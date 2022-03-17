import { ethers, deployments } from "hardhat";
import { expect } from "chai";

import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Citizend, Citizend__factory } from "../../../src/types";

describe("Citizend", () => {
  let owner: SignerWithAddress;

  let citizend: Citizend;

  const fixture = deployments.createFixture(async ({ deployments, ethers }) => {
    await deployments.fixture(["ctnd.token"]);

    [owner] = await ethers.getSigners();

    const citizendDeployment = await deployments.get("Citizend");

    citizend = Citizend__factory.connect(citizendDeployment.address, owner);
  });

  beforeEach(() => fixture());

  describe("constructor", () => {
    it("sets the correct params", async () => {
      expect(await citizend.name()).to.equal("Citizend");
      expect(await citizend.symbol()).to.equal("CTND");
    });

    it("mints initial amount to the owner");
  });
});
