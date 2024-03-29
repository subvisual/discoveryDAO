import { ethers } from "hardhat";
import { expect } from "chai";

import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import {
  Batch,
  Batch__factory,
  Project,
  Project__factory,
  MockERC20,
  MockERC20__factory,
  Controller,
  Controller__factory,
  FractalRegistry,
  FractalRegistry__factory,
  Citizend,
  Citizend__factory,
  Staking,
  Staking__factory,
} from "../../../src/types";

import { goToTime, currentTimestamp } from "../../timeHelpers";
import { registerProject, makeProjectReady, setUpBatch } from "./helpers";
import { BytesLike } from "ethers";

const { parseUnits, formatBytes32String } = ethers.utils;

describe("Batch", () => {
  let owner: SignerWithAddress;
  let alice: SignerWithAddress;
  let bob: SignerWithAddress;
  let carol: SignerWithAddress;

  let batch: Batch;
  let controller: Controller;
  let citizend: Citizend;
  let staking: Staking;
  let projectToken: MockERC20;
  let fakeProject: Project;
  let anotherFakeProject: Project;
  let aUSD: MockERC20;
  let oneDay: number;
  let votingStart: number;
  let votingEnd: number;
  let merkleRoot: BytesLike;
  let aliceMerkleProof: BytesLike[];
  let bobMerkleProof: BytesLike[];

  beforeEach(async () => {
    [owner, alice, bob, carol] = await ethers.getSigners();
    oneDay = 60 * 60 * 24;
    votingStart = (await currentTimestamp()) + oneDay;
    votingEnd = votingStart + oneDay * 10;
    projectToken = await new MockERC20__factory(owner).deploy(
      "ProjectToken",
      "ProjectToken",
      18
    );
    merkleRoot =
      "0xa5c09e2a9128afef7246a5900cfe02c4bd2cfcac8ac4286f0159a699c8455a49";
    aliceMerkleProof = [
      "0xe9707d0e6171f728f7473c24cc0432a9b07eaaf1efed6a137a4a8c12c79552d9",
      "0x347dce04eb339ca70588960730ef0cada966bb1d5e10a9b9489a3e0ba47dc1b6",
    ];
    bobMerkleProof = [
      "0x8a3552d60a98e0ade765adddad0a2e420ca9b1eef5f326ba7ab860bb4ea72c94",
      "0x070e8db97b197cc0e4a1790c5e6c3667bab32d733db7f815fbe84f5824c7168d",
    ];

    citizend = await new Citizend__factory(owner).deploy(owner.address);
    staking = await new Staking__factory(owner).deploy(citizend.address);
    controller = await new Controller__factory(owner).deploy(
      staking.address,
      citizend.address,
      merkleRoot
    );
    aUSD = await new MockERC20__factory(owner).deploy("aUSD", "aUSD", 12);

    fakeProject = await registerProject(owner, projectToken, controller, aUSD);
    await makeProjectReady(fakeProject, projectToken);
    anotherFakeProject = await registerProject(
      owner,
      projectToken,
      controller,
      aUSD
    );
    await makeProjectReady(anotherFakeProject, projectToken);

    batch = await setUpBatch(
      controller,
      [fakeProject, anotherFakeProject],
      owner
    );

    await citizend.transfer(alice.address, 1000);
    await citizend.transfer(bob.address, 1000);

    await controller.setBatchVotingPeriod(
      batch.address,
      votingStart,
      votingEnd,
      0
    );
    await goToTime(votingStart);
  });

  describe("constructor", async () => {
    it("should set the correct values", async () => {
      expect(await batch.projects(0)).to.eq(fakeProject.address);
      expect(await batch.projects(1)).to.eq(anotherFakeProject.address);
      expect(await batch.slotCount()).to.eq(2);
    });

    it("fails with an empty list of projects", async () => {
      await expect(new Batch__factory(owner).deploy([], 0)).to.be.revertedWith(
        "projects must not be empty"
      );
    });

    it("fails with no slots", async () => {
      await expect(
        new Batch__factory(owner).deploy([fakeProject.address], 0)
      ).to.be.revertedWith("slotCount must be greater than 0");
    });

    it("fails with more slots than projects", async () => {
      await expect(
        new Batch__factory(owner).deploy([fakeProject.address], 2)
      ).to.be.revertedWith("cannot have more slots than projects");
    });

    it("fails with an address that does not implement IProject", async () => {
      await expect(
        controller.createBatch([projectToken.address], 1)
      ).to.be.revertedWith("project must be an IProject");
    });

    xit("fails if one of the projects is not whitelisted", async () => {
      await expect(
        setUpBatch(controller, [fakeProject], owner)
      ).to.be.revertedWith("project must be whitelisted");
    });
  });

  describe("setVotingPeriod", async () => {
    it("sets the voting period", async () => {
      await controller.setBatchVotingPeriod(
        batch.address,
        votingStart + 1 * oneDay,
        votingEnd,
        oneDay
      );

      const votingPeriod = await batch.votingPeriod();

      expect(votingPeriod.start).to.eq(votingStart + 1 * oneDay);
      expect(votingPeriod.end).to.eq(votingEnd);
      expect(await batch.singleSlotDuration()).to.eq(4.5 * oneDay);
      expect(await batch.investmentEnd()).to.eq(votingEnd + oneDay);
    });

    it("reverts if the start is in the past", async () => {
      await expect(
        controller.setBatchVotingPeriod(
          batch.address,
          votingStart - 10 * oneDay,
          votingStart + 20 * oneDay,
          0
        )
      ).to.be.revertedWith("start must be in the future");
    });

    it("reverts if the end is before the start", async () => {
      await expect(
        controller.setBatchVotingPeriod(
          batch.address,
          votingStart + 10 * oneDay,
          votingStart - 10 * oneDay,
          0
        )
      ).to.be.revertedWith("start must be before end");
    });

    it("reverts if not called by the controller", async () => {
      await expect(
        batch.connect(alice).setVotingPeriod(votingStart + 1, votingEnd, 0)
      ).to.be.revertedWith("only controller can set voting period");
    });
  });

  describe("vote", () => {
    it("allows a user to vote", async () => {
      await batch.connect(alice).vote(fakeProject.address, aliceMerkleProof);

      expect(await batch.userVoteCount(alice.address)).to.eq(1);
      expect(await batch.projectVoteCount(fakeProject.address)).to.eq(1);
      expect(
        await batch.userHasVotedForProject(fakeProject.address, alice.address)
      ).to.be.true;
    });

    it("does not allow a user to vote twice in the same project", async () => {
      await batch.connect(alice).vote(fakeProject.address, aliceMerkleProof);

      await expect(
        batch.connect(alice).vote(fakeProject.address, aliceMerkleProof)
      ).to.be.revertedWith("already voted in this project");
    });

    it("does not give users more votes than slots", async () => {
      fakeProject = await registerProject(
        owner,
        projectToken,
        controller,
        aUSD
      );
      await makeProjectReady(fakeProject, projectToken);
      anotherFakeProject = await registerProject(
        owner,
        projectToken,
        controller,
        aUSD
      );
      await makeProjectReady(anotherFakeProject, projectToken);
      batch = await setUpBatch(
        controller,
        [fakeProject, anotherFakeProject],
        owner,
        1
      );
      await controller.setBatchVotingPeriod(
        batch.address,
        votingStart + oneDay,
        votingEnd,
        0
      );
      await goToTime(votingStart + oneDay);

      await batch.connect(alice).vote(fakeProject.address, aliceMerkleProof);

      await expect(
        batch.connect(alice).vote(anotherFakeProject.address, aliceMerkleProof)
      ).to.be.revertedWith("vote limit reached");
    });

    it("does not allow a user to vote before the voting period is set", async () => {
      const newProject: Project = await registerProject(
        owner,
        projectToken,
        controller,
        aUSD
      );
      await makeProjectReady(newProject, projectToken);
      await controller.createBatch([newProject.address], 1);
      batch = await Batch__factory.connect(
        await controller.projectsToBatches(newProject.address),
        owner
      );

      await expect(
        batch.connect(alice).vote(newProject.address, aliceMerkleProof)
      ).to.be.revertedWith("voting period not set");
    });

    it("does not allow a user without KYC to vote", async () => {
      await citizend.transfer(carol.address, 1000);

      await expect(
        batch.connect(carol).vote(fakeProject.address, aliceMerkleProof)
      ).to.be.revertedWith("not allowed to vote");
    });

    it("does not allow a user not belonging to the DAO to vote", async () => {
      await expect(
        batch.connect(carol).vote(fakeProject.address, aliceMerkleProof)
      ).to.be.revertedWith("not allowed to vote");
    });
  });

  describe("getProjectStatus", () => {
    it("returns the correct project", async () => {
      const status = await batch.getProjectStatus(fakeProject.address);

      expect(status).to.eq(0);
    });

    it("takes the votes into account", async () => {
      await batch.connect(alice).vote(fakeProject.address, aliceMerkleProof);
      await batch.connect(bob).vote(fakeProject.address, bobMerkleProof);
      await batch
        .connect(alice)
        .vote(anotherFakeProject.address, aliceMerkleProof);
      await goToTime(votingStart + 5 * oneDay);

      const status = await batch.getProjectStatus(fakeProject.address);

      expect(status).to.eq(1);
    });

    it("marks projects as losers after the end of the batch", async () => {
      await goToTime(votingStart + 11 * oneDay);

      const status = await batch.getProjectStatus(fakeProject.address);

      expect(status).to.eq(2);
    });
  });

  describe("getCurrentWinners", () => {
    it("calculates the winner if one exists", async () => {
      await batch.connect(alice).vote(fakeProject.address, aliceMerkleProof);

      await goToTime(votingStart + 5 * oneDay);
      const winners = await batch.getCurrentWinners();

      expect(winners[0]).to.eq(fakeProject.address);
    });

    it("calculates the winners of multiple slots", async () => {
      await batch.connect(alice).vote(fakeProject.address, aliceMerkleProof);
      await batch.connect(bob).vote(fakeProject.address, bobMerkleProof);
      await batch
        .connect(alice)
        .vote(anotherFakeProject.address, aliceMerkleProof);

      await goToTime(votingStart + 5 * oneDay);
      let winners = await batch.getCurrentWinners();

      expect(winners.length).to.eq(1);
      expect(winners[0]).to.eq(fakeProject.address);

      await goToTime(votingStart + 10 * oneDay);

      winners = await batch.getCurrentWinners();

      expect(winners.length).to.eq(2);
      expect(winners[0]).to.eq(fakeProject.address);
      expect(winners[1]).to.eq(anotherFakeProject.address);
    });

    it("calculates the winners of multiple slots with votes in multiple slots", async () => {
      await batch.connect(alice).vote(fakeProject.address, aliceMerkleProof);
      await batch.connect(bob).vote(fakeProject.address, bobMerkleProof);
      await batch
        .connect(alice)
        .vote(anotherFakeProject.address, aliceMerkleProof);

      await goToTime(votingStart + 5 * oneDay);
      let winners = await batch.getCurrentWinners();

      await batch.connect(bob).vote(anotherFakeProject.address, bobMerkleProof);
      expect(winners.length).to.eq(1);
      expect(winners[0]).to.eq(fakeProject.address);

      await goToTime(votingStart + 10 * oneDay);

      winners = await batch.getCurrentWinners();

      expect(winners.length).to.eq(2);
      expect(winners[0]).to.eq(fakeProject.address);
      expect(winners[1]).to.eq(anotherFakeProject.address);
    });

    it("works even when it doesn't actually have to calculate anything", async () => {
      await batch.connect(alice).vote(fakeProject.address, aliceMerkleProof);
      await goToTime(votingStart + 5 * oneDay);
      await batch
        .connect(alice)
        .vote(anotherFakeProject.address, aliceMerkleProof);

      let winners = await batch.getCurrentWinners();

      expect(winners.length).to.eq(1);
      expect(winners[0]).to.eq(fakeProject.address);
    });

    it("has no winners if no votes are received", async () => {
      await goToTime(votingEnd);

      const winners = await batch.getCurrentWinners();

      expect(winners.length).to.eq(0);
    });
  });

  describe("projectVoteCount", () => {
    it("counts 1 vote per project, linearly", async () => {
      await batch.connect(alice).vote(fakeProject.address, aliceMerkleProof);
      await batch.connect(bob).vote(fakeProject.address, bobMerkleProof);

      expect(await batch.projectVoteCount(fakeProject.address)).to.eq(2);
    });
  });

  describe("weightedProjectVoteCount", () => {
    it("gives more weight to early votes, following a linear curve", async () => {
      await goToTime(votingStart + oneDay);
      await batch.connect(alice).vote(fakeProject.address, aliceMerkleProof);

      expect(
        await batch.weightedProjectVoteCount(fakeProject.address)
      ).to.be.closeTo(parseUnits("0.045"), parseUnits("0.0001"));

      await goToTime(votingStart + 4 * oneDay);
      await batch.connect(bob).vote(fakeProject.address, bobMerkleProof);

      expect(
        await batch.weightedProjectVoteCount(fakeProject.address)
      ).to.be.closeTo(parseUnits("0.075"), parseUnits("0.0001"));
    });
  });
});
