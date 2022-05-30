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

const { parseUnits, formatBytes32String } = ethers.utils;

describe("Batch", () => {
  let owner: SignerWithAddress;
  let alice: SignerWithAddress;
  let bob: SignerWithAddress;
  let carol: SignerWithAddress;

  let batch: Batch;
  let controller: Controller;
  let registry: FractalRegistry;
  let citizend: Citizend;
  let staking: Staking;
  let projectToken: MockERC20;
  let fakeProject: Project;
  let anotherFakeProject: Project;
  let aUSD: MockERC20;
  let oneDay: number;
  let votingStart: number;
  let votingEnd: number;

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

    registry = await new FractalRegistry__factory(owner).deploy(owner.address);
    citizend = await new Citizend__factory(owner).deploy(owner.address);
    staking = await new Staking__factory(owner).deploy(citizend.address);
    controller = await new Controller__factory(owner).deploy(
      registry.address,
      staking.address,
      citizend.address
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

    await registry.addUserAddress(alice.address, formatBytes32String("id1"));
    await registry.addUserAddress(bob.address, formatBytes32String("id2"));
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
      expect(await fakeProject.batch()).to.eq(batch.address);
      expect(await anotherFakeProject.batch()).to.eq(batch.address);
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

    it("fails if one of the projects is not ready", async () => {
      fakeProject = await registerProject(
        owner,
        projectToken,
        controller,
        aUSD
      );

      await expect(
        controller.createBatch([fakeProject.address], 1)
      ).to.be.revertedWith("project not ready");
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
      await batch.connect(alice).vote(fakeProject.address);

      expect(await batch.userVoteCount(alice.address)).to.eq(1);
      expect(await batch.projectVoteCount(fakeProject.address)).to.eq(1);
      expect(
        await batch.userHasVotedForProject(fakeProject.address, alice.address)
      ).to.be.true;
    });

    it("does not allow a user to vote twice in the same project", async () => {
      await batch.connect(alice).vote(fakeProject.address);

      await expect(
        batch.connect(alice).vote(fakeProject.address)
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

      await batch.connect(alice).vote(fakeProject.address);

      await expect(
        batch.connect(alice).vote(anotherFakeProject.address)
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
        batch.connect(alice).vote(newProject.address)
      ).to.be.revertedWith("voting period not set");
    });

    it("does not allow a user without KYC to vote", async () => {
      await citizend.transfer(carol.address, 1000);

      await expect(
        batch.connect(carol).vote(fakeProject.address)
      ).to.be.revertedWith("not allowed to vote");
    });

    it("does not allow a user not belonging to the DAO to vote", async () => {
      await registry.addUserAddress(carol.address, formatBytes32String("id3"));

      await expect(
        batch.connect(carol).vote(fakeProject.address)
      ).to.be.revertedWith("not allowed to vote");
    });
  });

  describe("getProjectStatus", () => {
    it("returns the correct project", async () => {
      const status = await batch.getProjectStatus(fakeProject.address);

      expect(status).to.eq(0);
    });

    it("takes the votes into account", async () => {
      await batch.connect(alice).vote(fakeProject.address);
      await batch.connect(bob).vote(fakeProject.address);
      await batch.connect(alice).vote(anotherFakeProject.address);
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
      await batch.connect(alice).vote(fakeProject.address);

      await goToTime(votingStart + 5 * oneDay);
      const winners = await batch.getCurrentWinners();

      expect(winners[0]).to.eq(fakeProject.address);
    });

    it("calculates the winners of multiple slots", async () => {
      await batch.connect(alice).vote(fakeProject.address);
      await batch.connect(bob).vote(fakeProject.address);
      await batch.connect(alice).vote(anotherFakeProject.address);

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
      await batch.connect(alice).vote(fakeProject.address);
      await batch.connect(bob).vote(fakeProject.address);
      await batch.connect(alice).vote(anotherFakeProject.address);

      await goToTime(votingStart + 5 * oneDay);
      let winners = await batch.getCurrentWinners();

      await batch.connect(bob).vote(anotherFakeProject.address);
      expect(winners.length).to.eq(1);
      expect(winners[0]).to.eq(fakeProject.address);

      await goToTime(votingStart + 10 * oneDay);

      winners = await batch.getCurrentWinners();

      expect(winners.length).to.eq(2);
      expect(winners[0]).to.eq(fakeProject.address);
      expect(winners[1]).to.eq(anotherFakeProject.address);
    });

    it("works even when it doesn't actually have to calculate anything", async () => {
      await batch.connect(alice).vote(fakeProject.address);
      await goToTime(votingStart + 5 * oneDay);
      await batch.connect(alice).vote(anotherFakeProject.address);

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
      await batch.connect(alice).vote(fakeProject.address);
      await batch.connect(bob).vote(fakeProject.address);

      expect(await batch.projectVoteCount(fakeProject.address)).to.eq(2);
    });
  });

  describe("weightedProjectVoteCount", () => {
    it("gives more weight to early votes, following a linear curve", async () => {
      await goToTime(votingStart + oneDay);
      await batch.connect(alice).vote(fakeProject.address);

      expect(
        await batch.weightedProjectVoteCount(fakeProject.address)
      ).to.be.closeTo(parseUnits("0.045"), parseUnits("0.0001"));

      await goToTime(votingStart + 4 * oneDay);
      await batch.connect(bob).vote(fakeProject.address);

      expect(
        await batch.weightedProjectVoteCount(fakeProject.address)
      ).to.be.closeTo(parseUnits("0.075"), parseUnits("0.0001"));
    });
  });
});
