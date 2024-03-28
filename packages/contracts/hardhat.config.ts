import "@typechain/hardhat";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-waffle";
import "hardhat-deploy";
import "hardhat-gas-reporter";

import "./src/tasks";
import { networks } from "./src/hardhat";

require("@nomicfoundation/hardhat-foundry");

const config = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 300,
      },
    },
  },
  networks,
  namedAccounts: {
    deployer: 0,
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS ? true : false,
    gasPrice: 100,
    currency: "USD",
  },
  typechain: {
    outDir: "src/types",
    target: "ethers-v5",
  },
};

export default config;
