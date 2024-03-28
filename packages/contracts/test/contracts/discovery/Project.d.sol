pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "forge-std/console.sol";

import {MerkleProof} from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

import { Citizend } from "../../../contracts/token/Citizend.sol";
import { Project } from "../../../contracts/discovery/Project.sol";

contract ProjectTest is Test {

  Citizend citizend;
  Project project;

  address alice = 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266;
  address bob = 0x70997970C51812dc3A010C7d01b50e0d17dc79C8;
  address carol = 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC;

  mapping(address => bytes32[]) public proofs;

  function setUp() public {
    vm.startPrank(alice);

    bytes32 merkleRoot = 0xa5c09e2a9128afef7246a5900cfe02c4bd2cfcac8ac4286f0159a699c8455a49;
    proofs[alice] = [
      bytes32(0x00314e565e0574cb412563df634608d76f5c59d9f817e85966100ec1d48005c0),
      bytes32(0x347dce04eb339ca70588960730ef0cada966bb1d5e10a9b9489a3e0ba47dc1b6)
    ];

    citizend = new Citizend(alice);
    project = new Project("test project", address(citizend), 1000, 1, address(0), merkleRoot);

    vm.stopPrank();
  }

  function testInvest() public {
    vm.startPrank(alice);

    project.invest(1,1, proofs[alice]);

    vm.stopPrank();
  }

  function testInvestShouldRevertWithInvalidProof() public {
    vm.startPrank(alice);

    vm.expectRevert();
    project.invest(1,1, proofs[bob]);

    vm.stopPrank();
  }
}
