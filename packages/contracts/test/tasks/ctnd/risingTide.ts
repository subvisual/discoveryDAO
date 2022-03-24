import hre, { ethers, deployments, run } from "hardhat";
import { expect } from "chai";

import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import {
  Sale,
  MockERC20,
  MockERC20__factory,
  Sale__factory,
  FractalRegistry,
  FractalRegistry__factory,
} from "../../../src/types";

import { currentTimestamp } from "../../../test/timeHelpers";

import { computeRisingTide } from "../../../src/tasks/ctnd/risingTide";

const { parseUnits, formatBytes32String } = ethers.utils;
const { MaxUint256 } = ethers.constants;

describe("ctnd:risingTide task", () => {
  let owner: SignerWithAddress;
  let alice: SignerWithAddress;
  let bob: SignerWithAddress;
  let carol: SignerWithAddress;

  let aUSD: MockERC20;
  let sale: Sale;
  let registry: FractalRegistry;

  let start: number;
  let end: number;

  const fixture = deployments.createFixture(async ({ deployments, ethers }) => {
    await deployments.fixture(["aUSD", "fractal-registry"]);

    [owner, alice, bob, carol] = await ethers.getSigners();

    const aUSDDeployment = await deployments.get("aUSD");
    const registryDeployment = await deployments.get("FractalRegistry");

    start = await currentTimestamp();
    end = start + 60 * 60 * 24;

    aUSD = MockERC20__factory.connect(aUSDDeployment.address, owner);
    registry = FractalRegistry__factory.connect(
      registryDeployment.address,
      owner
    );
    sale = await new Sale__factory(owner).deploy(
      aUSD.address,
      parseUnits("1"),
      start,
      end,
      5000,
      registry.address
    );
  });

  beforeEach(async () => {
    await fixture();
  });

  describe("rising tide calculation", () => {
    it("correctly computes the Gitbook example", async () => {
      const gitbookExample = [
        500, 1000, 750, 500, 1000, 750, 200, 1000, 800, 1000,
      ];

      for (const [i, amount] of gitbookExample.entries()) {
        const signers = await ethers.getSigners();
        const signer = signers[i];

        await aUSD.connect(signer).mint(signer.address, parseUnits("1000"));
        await aUSD.connect(signer).approve(sale.address, MaxUint256);
        await registry.addUserAddress(
          signer.address,
          ethers.utils.randomBytes(32)
        );

        const paymentAmount = await sale.tokenToPaymentToken(amount);
        await sale.connect(signer).buy(paymentAmount);
      }

      await computeRisingTide(sale.address, 0, hre);
    });
  });
});
