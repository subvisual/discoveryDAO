import { ethers } from "hardhat";
import { expect } from "chai";

import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import {
  Controller,
  Controller__factory,
  Batch,
  Batch__factory,
  Project,
  Project__factory,
  MockERC20,
  MockERC20__factory,
  FractalRegistry,
  FractalRegistry__factory,
  Citizend,
  Citizend__factory,
  Staking,
  Staking__factory,
} from "../../../src/types";

import { registerProject, makeProjectReady, setUpBatch } from "./helpers";

const { parseUnits, formatBytes32String } = ethers.utils;
const { MaxUint256 } = ethers.constants;

describe("Controller", () => {
  let owner: SignerWithAddress;
  let alice: SignerWithAddress;
  let bob: SignerWithAddress;

  let controller: Controller;
  let project: Project;
  let projectToken: MockERC20;
  let aUSD: MockERC20;
  let registry: FractalRegistry;
  let citizend: Citizend;
  let staking: Staking;

  beforeEach(async () => {
    [owner, alice, bob] = await ethers.getSigners();

    registry = await new FractalRegistry__factory(owner).deploy(owner.address);
    citizend = await new Citizend__factory(owner).deploy(owner.address);
    staking = await new Staking__factory(owner).deploy(citizend.address);
    aUSD = await new MockERC20__factory(owner).deploy("aUSD", "aUSD", 12);
    projectToken = await new MockERC20__factory(owner).deploy(
      "ProjectToken",
      "ProjectToken",
      18
    );

    controller = await new Controller__factory(owner).deploy(
      registry.address,
      staking.address,
      citizend.address
    );
  });

  describe("constructor", () => {
    it("sets the correct params", async () => {
      expect(await controller.registry()).to.eq(registry.address);
      expect(await controller.staking()).to.eq(staking.address);
      expect(await controller.token()).to.eq(citizend.address);
      expect(
        await controller.hasRole(
          await controller.DEFAULT_ADMIN_ROLE(),
          owner.address
        )
      ).to.be.true;
    });
  });

  describe("canInvestInStakersPool", () => {
    it("is true if the user meets all the requirements", async () => {
      await registry.addUserAddress(alice.address, formatBytes32String("id1"));
      await citizend.transfer(alice.address, 1000);
      await citizend.connect(alice).approve(staking.address, MaxUint256);
      await staking.connect(alice).stake(100);
      project = await registerProject(owner, projectToken, controller, aUSD);

      expect(await controller.canInvestInStakersPool(alice.address)).to.be.true;
    });

    it("is false if the user does not have the KYC", async () => {
      await citizend.transfer(alice.address, 1000);
      await citizend.connect(alice).approve(staking.address, MaxUint256);
      await staking.connect(alice).stake(100);
      project = await registerProject(owner, projectToken, controller, aUSD);

      expect(await controller.canInvestInStakersPool(alice.address)).to.be
        .false;
    });

    it("is false if the user does not belong to the DAO", async () => {
      await registry.addUserAddress(alice.address, formatBytes32String("id1"));
      project = await registerProject(owner, projectToken, controller, aUSD);

      expect(await controller.canInvestInStakersPool(alice.address)).to.be
        .false;
    });

    it("is false if the user does not have staked tokens", async () => {
      await registry.addUserAddress(alice.address, formatBytes32String("id1"));
      await citizend.transfer(alice.address, 1000);
      project = await registerProject(owner, projectToken, controller, aUSD);

      expect(await controller.canInvestInStakersPool(alice.address)).to.be
        .false;
    });
  });

  describe("canInvestInPeoplesPool", () => {
    it("is true if the user meets all the requirements", async () => {
      await registry.addUserAddress(alice.address, formatBytes32String("id1"));
      await citizend.transfer(alice.address, 1000);
      project = await registerProject(owner, projectToken, controller, aUSD);
      await makeProjectReady(project, projectToken);
      const batch: Batch = await setUpBatch(controller, [project], owner);
      await batch.connect(alice).vote(project.address);

      expect(
        await controller.canInvestInPeoplesPool(project.address, alice.address)
      ).to.be.true;
    });

    it("is false if the user does not have the KYC", async () => {
      await citizend.transfer(alice.address, 1000);
      project = await registerProject(owner, projectToken, controller, aUSD);
      await makeProjectReady(project, projectToken);
      const batch: Batch = await setUpBatch(controller, [project], owner);

      expect(
        await controller.canInvestInPeoplesPool(project.address, alice.address)
      ).to.be.false;
    });

    it("is false if the user does not belong to the DAO", async () => {
      await registry.addUserAddress(alice.address, formatBytes32String("id1"));
      project = await registerProject(owner, projectToken, controller, aUSD);
      await makeProjectReady(project, projectToken);
      const batch: Batch = await setUpBatch(controller, [project], owner);

      expect(
        await controller.canInvestInPeoplesPool(project.address, alice.address)
      ).to.be.false;
    });

    it("is false if the user hasn't voted in the project", async () => {
      await citizend.transfer(alice.address, 1000);
      await registry.addUserAddress(alice.address, formatBytes32String("id1"));
      project = await registerProject(owner, projectToken, controller, aUSD);
      await makeProjectReady(project, projectToken);
      await setUpBatch(controller, [project], owner);

      expect(
        await controller.canInvestInPeoplesPool(project.address, alice.address)
      ).to.be.false;
    });
  });

  describe("registerProject", () => {
    it("registers a project", async () => {
      project = await registerProject(owner, projectToken, controller, aUSD);

      expect(await project.description()).to.eq("My Project");
      expect(await project.token()).to.eq(projectToken.address);
      expect(await project.saleSupply()).to.eq(parseUnits("1000"));
      expect(await project.rate()).to.eq(parseUnits("2"));
    });

    it("emits a ProjectRegistered event", async () => {
      expect(
        await controller.registerProject(
          "My Project",
          projectToken.address,
          parseUnits("1000"),
          parseUnits("2"),
          aUSD.address,
          0,
          3
        )
      ).to.emit(controller, "ProjectRegistered");
    });

    it("fails to register a project that is not known to the controller");
    it("fails to register a project that's already registered in a batch");
    it("fails to register a project that is not ready for listing");
  });

  describe("createBatch", () => {
    it("creates a batch", async () => {
      project = await registerProject(owner, projectToken, controller, aUSD);
      await makeProjectReady(project, projectToken);

      expect(await project.approvedByLegal()).to.equal(true);
      expect(await project.approvedByManager()).to.equal(true);
      expect(await project.isReadyForListing()).to.equal(true);

      await expect(controller.createBatch([project.address], 1)).to.not.be
        .reverted;
    });

    it("reverts if a project is not approved", async () => {
      project = await registerProject(owner, projectToken, controller, aUSD);

      await expect(
        controller.createBatch([project.address], 1)
      ).to.be.revertedWith("project not ready");
    });

    it("reverts if a project is already included in a different batch", async () => {
      project = await registerProject(owner, projectToken, controller, aUSD);
      await makeProjectReady(project, projectToken);

      expect(await project.approvedByLegal()).to.equal(true);
      expect(await project.approvedByManager()).to.equal(true);
      expect(await project.isReadyForListing()).to.equal(true);

      await expect(controller.createBatch([project.address], 1)).to.not.be
        .reverted;
      await expect(
        controller.createBatch([project.address], 1)
      ).to.be.revertedWith("already in a batch");
    });
  });
});
