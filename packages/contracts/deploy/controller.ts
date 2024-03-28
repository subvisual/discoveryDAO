import { DeployFunction } from "hardhat-deploy/types";

import { acalaDeploy } from "../src/acala";

const func: DeployFunction = async function (hre) {
  const { deployer } = await hre.getNamedAccounts();
  const { get } = hre.deployments;

  const citizend = await get("Citizend");
  const staking = await get("Staking");
  const merkleRoot =
    "0xa5c09e2a9128afef7246a5900cfe02c4bd2cfcac8ac4286f0159a699c8455a49";

  await acalaDeploy(hre, "Controller", {
    from: deployer,
    args: [staking.address, citizend.address, merkleRoot],
    log: true,
  });
};

func.id = "controller";
func.tags = ["controller"];
func.dependencies = ["ctnd.token", "staking"];

export default func;
