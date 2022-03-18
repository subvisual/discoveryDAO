import { ethers } from "hardhat";
import { expect } from "chai";

import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import {
  MockERC20,
  MockERC20__factory,
  Sale,
  Sale__factory,
  Citizend,
  Citizend__factory,
  Vesting,
  Vesting__factory,
} from "../../../src/types";

const { parseUnits } = ethers.utils;
const { MaxUint256 } = ethers.constants;

describe("Sale", () => {
  let owner: SignerWithAddress;
  let alice: SignerWithAddress;

  let aUSD: MockERC20;
  let sale: Sale;

  let start: number;
  let end: number;

  beforeEach(async () => {
    [owner, alice] = await ethers.getSigners();

    start = Math.floor(new Date().getTime() / 1000);
    end = start + 60 * 60 * 24;

    aUSD = await new MockERC20__factory(owner).deploy("aUSD", "aUSD");

    sale = await new Sale__factory(owner).deploy(
      aUSD.address,
      parseUnits("0.3"),
      start,
      end
    );

    await aUSD.mint(alice.address, parseUnits("1000"));
    await aUSD.mint(owner.address, parseUnits("1000"));
    await aUSD.connect(alice).approve(sale.address, MaxUint256);
  });

  describe("constructor", () => {
    it("sets the correct params", async () => {
      expect(await sale.paymentToken()).to.equal(aUSD.address);
      expect(await sale.rate()).to.equal(parseUnits("0.3"));
      expect(await sale.start()).to.equal(start);
      expect(await sale.end()).to.equal(end);

      expect(await sale.hasRole(await sale.DEFAULT_ADMIN_ROLE(), owner.address))
        .to.be.true;
      expect(await sale.hasRole(await sale.CAP_VALIDATOR_ROLE(), owner.address))
        .to.be.true;
    });
  });

  describe("buy", () => {
    it("register an account", async () => {
      await sale.connect(alice).buy(30);

      expect(await sale.uncappedAllocation(alice.address)).to.eq(100);
    });
    it("emits a Purchase event", async () => {
      const amount = parseUnits("1");

      expect(await sale.connect(alice).buy(amount))
        .to.emit(sale, "Purchase")
        .withArgs(
          alice.address,
          amount,
          await sale.paymentTokenToToken(amount)
        );
    });

    it("correctly handles multiple purchases from the same account", async () => {
      const paymentAmount = 30;

      expect(await sale.connect(alice).buy(paymentAmount))
        .to.emit(sale, "Purchase")
        .withArgs(alice.address, paymentAmount, 100);

      expect(await sale.connect(alice).buy(paymentAmount))
        .to.emit(sale, "Purchase")
        .withArgs(alice.address, paymentAmount, 100);

      expect(await sale.uncappedAllocation(alice.address)).to.eq(200);
    });
  });

  describe("paymentTokenToToken", async () => {
    it("converts 0 to 0", async () => {
      await expect(await sale.paymentTokenToToken(parseUnits("0"))).to.eq(0);
    });

    it("converts 0.30 $aUSD to 1 $CTND", async () => {
      const paymentAmount = parseUnits("0.30");
      const tokens = parseUnits("1");

      expect(await sale.paymentTokenToToken(paymentAmount)).to.equal(tokens);
    });

    it("converts 300 $aUSD to 1000 $CTND", async () => {
      const paymentAmount = parseUnits("300");
      const tokens = parseUnits("1000");

      expect(await sale.paymentTokenToToken(paymentAmount)).to.equal(tokens);
    });
  });

  describe("tokenToPaymentToken", async () => {
    it("converts 0 to 0", async () => {
      await expect(await sale.tokenToPaymentToken(parseUnits("0"))).to.eq(0);
    });

    it("converts 1 $CTND to 0.30 $aUSD", async () => {
      const tokens = parseUnits("1");
      const paymentAmount = parseUnits("0.30");

      expect(await sale.tokenToPaymentToken(tokens)).to.equal(paymentAmount);
    });
  });

  describe("set individual cap", () => {
    it("allows me to set the cap", async () => {
      await sale.setIndividualCap(100);

      expect(await sale.individualCap()).to.equal(100);
    });
  });

  describe("refundAmount", () => {
    it("is 0 before the vesting", async () => {
      expect(await sale.refundAmount(alice.address)).to.equal(0);
    });

    it("is 0 if the individual cap is higher than the invested total", async () => {
      await sale.connect(alice).buy(await sale.tokenToPaymentToken(100));
      await sale.setIndividualCap(200);

      expect(await sale.refundAmount(alice.address)).to.equal(0);
    });

    it("is the difference between the cap and the invested total", async () => {
      await sale.connect(alice).buy(300);

      // set a cap of 200$ in $CTND
      const cap = await sale.paymentTokenToToken(200);
      await sale.setIndividualCap(cap);

      expect(await sale.refundAmount(alice.address)).to.equal(100);
    });
  });

  describe("refund", () => {
    it("fails if individual cap is not yet set", async () => {
      await sale.connect(alice).buy(300);

      await expect(sale.refund(alice.address)).to.be.revertedWith(
        "cap not yet set"
      );
    });

    it("refunds the correct amount once the cap is set", async () => {
      await sale.connect(alice).buy(300);

      // set a cap of 200$ in $CTND
      const cap = await sale.paymentTokenToToken(200);
      await sale.setIndividualCap(cap);

      await expect(() => sale.refund(alice.address)).to.changeTokenBalance(
        aUSD,
        alice,
        100
      );
    });

    it("emits an event", async () => {
      await sale.connect(alice).buy(300);

      // set a cap of 200$ in $CTND
      const cap = await sale.paymentTokenToToken(200);
      await sale.setIndividualCap(cap);

      await expect(sale.refund(alice.address))
        .to.emit(sale, "Refund")
        .withArgs(alice.address, 100);
    });

    it("does not allow double refunds", async () => {
      await sale.connect(alice).buy(300);

      // set a cap of 200$ in $CTND
      const cap = await sale.paymentTokenToToken(200);
      await sale.setIndividualCap(cap);

      await sale.refund(alice.address);

      expect(sale.refund(alice.address)).to.be.revertedWith("already refunded");
    });
  });
});
