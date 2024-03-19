import { ethers } from "hardhat";

import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import {
  Controller,
  Batch,
  Batch__factory,
  Project,
  Project__factory,
  MockERC20,
} from "../../../src/types";

import { findEvent } from "../../shared/utils";
import { goToTime, currentTimestamp } from "../../timeHelpers";

const { parseUnits } = ethers.utils;

export async function registerProject(
  owner: SignerWithAddress,
  projectToken: MockERC20,
  controller: Controller,
  investmentToken: MockERC20
): Promise<Project> {
  const tx = await controller.registerProject(
    "My Project",
    projectToken.address,
    parseUnits("1000"),
    parseUnits("2"),
    investmentToken.address,
    0,
    3
  );

  const event = await findEvent(tx, "ProjectRegistered");
  const projectAddress = event?.args?.project;

  return Project__factory.connect(projectAddress, owner);
}

export async function makeProjectReady(
  project: Project,
  projectToken: MockERC20
) {
  await projectToken.transfer(project.address, parseUnits("1000"));
  await project.approveByManager();
  await project.approveByLegal();
}

export async function setUpBatch(
  controller: Controller,
  projects: Project[],
  owner: SignerWithAddress,
  slotCount?: number
): Promise<Batch> {
  await controller.createBatch(
    projects.map((project) => project.address),
    slotCount || projects.length
  );
  const batch: Batch = await Batch__factory.connect(
    await controller.projectsToBatches(projects[0].address),
    owner
  );
  const startTime: number = (await currentTimestamp()) + 100;
  await controller.setBatchVotingPeriod(
    batch.address,
    startTime,
    startTime + 60 * 60 * 24,
    0
  );
  await goToTime(startTime);

  return batch;
}
