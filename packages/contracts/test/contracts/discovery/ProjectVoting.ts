import { ethers } from "hardhat";
import { expect } from "chai";

import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import {
  TestProjectVoting,
  TestProjectVoting__factory,
  Project,
  Project__factory,
  MockERC20,
  MockERC20__factory,
} from "../../../src/types";

import { goToTime, currentTimestamp } from "../../timeHelpers";

const { parseUnits } = ethers.utils;

describe("ProjectVoting", () => {
  let owner: SignerWithAddress;
  let alice: SignerWithAddress;
  let bob: SignerWithAddress;
  let carol: SignerWithAddress;
  let fakeToken: SignerWithAddress;

  let aUSD: MockERC20;
  let projectVoting: TestProjectVoting;
  let oneDay: number;
  let votingStart: number;
  let votingEnd: number;

  beforeEach(async () => {
    [owner, alice, bob, carol, fakeToken] = await ethers.getSigners();
    oneDay = 60 * 60 * 24;
    votingStart = (await currentTimestamp()) + oneDay;
    votingEnd = votingStart + oneDay * 10;

    aUSD = await new MockERC20__factory(owner).deploy("aUSD", "aUSD", 12);
  });

  describe("no projects", () => {
    beforeEach(async () => {
      projectVoting = await new TestProjectVoting__factory(owner).deploy(
        {
          start: votingStart,
          end: votingEnd,
        },
        [],
        2
      );
    });

    describe("calculateWeightedVote", async () => {
      it("is equal to the initial bonus when the voting starts", async () => {
        const weight = await projectVoting.test_calculateWeightedVote(
          votingStart
        );

        expect(weight).to.eq(parseUnits("0.05"));
      });

      it("is equal to the final bonus when the voting ends", async () => {
        const weight = await projectVoting.test_calculateWeightedVote(
          votingEnd
        );

        expect(weight).to.be.closeTo(parseUnits("0"), parseUnits("0.001"));
      });

      it("goes down linerarly as time goes by", async () => {
        expect(
          await projectVoting.test_calculateWeightedVote(votingStart + oneDay)
        ).to.be.closeTo(parseUnits("0.045"), parseUnits("0.001"));

        expect(
          await projectVoting.test_calculateWeightedVote(
            votingStart + oneDay * 8
          )
        ).to.be.closeTo(parseUnits("0.01"), parseUnits("0.001"));
      });
    });

    describe("sortVotes", async () => {
      it("sorts a list with multiple votes", async () => {
        const votes = [
          {
            originalIndex: 0,
            count: 10,
          },
          {
            originalIndex: 1,
            count: 9,
          },
          {
            originalIndex: 2,
            count: 23,
          },
          {
            originalIndex: 3,
            count: 3,
          },
        ];

        const sorted = await projectVoting.test_sortVotes(votes);
        let sortedCounts = sorted.map((vote) => vote.count.toNumber());

        expect(sortedCounts).to.deep.eq([23, 10, 9, 3]);
      });
    });
  });

  describe("3 projects with 3 slots", () => {
    let project1: Project;
    let project2: Project;
    let project3: Project;

    beforeEach(async () => {
      project1 = await createProject("project1");
      project2 = await createProject("project2");
      project3 = await createProject("project3");

      projectVoting = await new TestProjectVoting__factory(owner).deploy(
        {
          start: votingStart,
          end: votingEnd,
        },
        [project1.address, project2.address, project3.address],
        3
      );
    });

    describe("defineWinners", async () => {
      it("does not duplicate winners after each vote", async () => {
        await goToTime(votingStart);
        await projectVoting.connect(alice).test_vote(project1.address);
        await goToTime(votingStart + 4 * oneDay);
        await projectVoting.connect(bob).test_vote(project2.address);
        await goToTime(votingStart + 8 * oneDay);
        await projectVoting.connect(carol).test_vote(project3.address);
        await goToTime(votingStart + 10 * oneDay);

        const winners = await projectVoting.test_getWinners();

        expect(winners.length).to.eq(3);
        expect(winners[0]).to.eq(project1.address);
        expect(winners[1]).to.eq(project2.address);
        expect(winners[2]).to.eq(project3.address);
      });
    });
  });

  describe("5 projects with 2 slots", () => {
    let project1: Project;
    let project2: Project;
    let project3: Project;
    let project4: Project;
    let project5: Project;

    beforeEach(async () => {
      project1 = await createProject("project1");
      project2 = await createProject("project2");
      project3 = await createProject("project3");
      project4 = await createProject("project4");
      project5 = await createProject("project5");

      projectVoting = await new TestProjectVoting__factory(owner).deploy(
        {
          start: votingStart,
          end: votingEnd,
        },
        [
          project1.address,
          project2.address,
          project3.address,
          project4.address,
          project5.address,
        ],
        2
      );
    });

    describe("defineWinners", async () => {
      it("declares a winner after 50% of the voting period", async () => {
        await goToTime(votingStart);
        await projectVoting.connect(alice).test_vote(project1.address);

        await goToTime(votingStart + 5 * oneDay);
        const winners = await projectVoting.test_getWinners();

        expect(winners.length).to.eq(1);
        expect(winners[0]).to.eq(project1.address);
      });

      it("declares two winners after the voting period ends", async () => {
        await goToTime(votingStart);
        await projectVoting.connect(alice).test_vote(project1.address);
        await projectVoting.connect(alice).test_vote(project2.address);
        await projectVoting.connect(bob).test_vote(project2.address);

        await goToTime(votingEnd);
        const winners = await projectVoting.test_getWinners();

        expect(winners.length).to.eq(2);
        expect(winners[0]).to.eq(project2.address);
        expect(winners[1]).to.eq(project1.address);
      });

      it("declares two winners after the voting period ends even if all votes are near the end", async () => {
        await goToTime(votingEnd - oneDay);
        await projectVoting.connect(alice).test_vote(project2.address);
        await projectVoting.connect(bob).test_vote(project3.address);
        await projectVoting.connect(alice).test_vote(project3.address);

        await goToTime(votingEnd);
        const winners = await projectVoting.test_getWinners();

        expect(winners.length).to.eq(2);
        expect(winners[0]).to.eq(project2.address);
        expect(winners[1]).to.eq(project3.address);
      });

      it("uses weighted votes to resolve ties", async () => {
        await goToTime(votingStart);
        await projectVoting.connect(alice).test_vote(project2.address);
        await goToTime(votingStart + oneDay);
        await projectVoting.connect(alice).test_vote(project1.address);
        await goToTime(votingStart + 2 * oneDay);
        await projectVoting.connect(bob).test_vote(project3.address);

        await goToTime(votingStart + 5 * oneDay);
        const winners = await projectVoting.test_getWinners();

        expect(winners.length).to.eq(1);
        expect(winners[0]).to.eq(project2.address);
      });

      it("keeps winners order", async () => {
        await goToTime(votingStart);
        await projectVoting.connect(alice).test_vote(project3.address);
        await goToTime(votingStart + 5 * oneDay);
        await projectVoting.connect(alice).test_vote(project2.address);
        await projectVoting.connect(bob).test_vote(project2.address);

        await goToTime(votingEnd);
        const winners = await projectVoting.test_getWinners();

        expect(winners.length).to.eq(2);
        expect(winners[0]).to.eq(project3.address);
        expect(winners[1]).to.eq(project2.address);
      });
    });
  });

  function createProject(name: string): Promise<Project> {
    return new Project__factory(owner).deploy(
      name,
      fakeToken.address,
      1000,
      10,
      aUSD.address,
      0,
      3
    );
  }
});
