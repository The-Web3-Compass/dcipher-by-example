// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {RandomnessReceiverBase} from "randomness-solidity/src/RandomnessReceiverBase.sol";

// Simple dice roller using dcipher's verifiable randomness
contract DiceRoller is RandomnessReceiverBase {
    bytes32 public latestRandomness;
    uint256 public latestRequestId;
    uint256 public rollCount;

    event DiceRolled(uint256 indexed requestId, address indexed roller);
    event RandomnessReceived(uint256 indexed requestId, bytes32 randomValue);

    constructor(address _randomnessSender, address _owner)
        RandomnessReceiverBase(_randomnessSender, _owner)
    {}

    // Request randomness and roll the dice - needs ETH to pay oracle fee
    function rollDice(uint32 callbackGasLimit) external payable returns (uint256) {
        (uint256 requestId, uint256 requestPrice) = _requestRandomnessPayInNative(callbackGasLimit);

        latestRequestId = requestId;
        rollCount++;

        emit DiceRolled(requestId, msg.sender);

        return requestId;
    }

    // Oracle calls this when randomness is ready
    function onRandomnessReceived(uint256 requestId, bytes32 randomness) internal override {
        require(latestRequestId == requestId, "Unexpected request ID");

        latestRandomness = randomness;

        emit RandomnessReceived(requestId, randomness);
    }

    // Get dice result (1-6) from latest randomness
    function getLatestDiceRoll() external view returns (uint256) {
        return (uint256(latestRandomness) % 6) + 1;
    }
}
