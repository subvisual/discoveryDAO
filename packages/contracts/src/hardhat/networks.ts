import type { NetworksUserConfig } from "hardhat/types";

const { MANDALA_MNEMONIC } = process.env;

const devMnemonic =
  process.env.DEV_MNEMONIC ||
  "test test test test test test test test test test test junk";

const mandalaMnemonic = MANDALA_MNEMONIC || devMnemonic;

let networks: NetworksUserConfig = {};

networks["hardhat"] = {
  blockGasLimit: 3000000000,
  allowUnlimitedContractSize: true,
  accounts: { mnemonic: devMnemonic },
};

networks["mandalaLocal"] = {
  url: "http://127.0.0.1:8545",
  accounts: {
    mnemonic:
      "fox sight canyon orphan hotel grow hedgehog build bless august weather swarm",
    path: "m/44'/60'/0'/0",
  },
  chainId: 595,
};

networks["mandala"] = {
  url: "https://tc7-eth.aca-dev.network",
  accounts: {
    mnemonic: mandalaMnemonic,
  },
  chainId: 595,
};

export { networks };
