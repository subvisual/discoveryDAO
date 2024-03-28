// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IBatch {
    function vote(address projectAddress, bytes32[] calldata _merkleProof)
        external;
}
