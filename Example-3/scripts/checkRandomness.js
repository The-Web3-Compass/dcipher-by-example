/**
 * @fileoverview Script to check the randomness result from a dice roll
 * @description This script queries the DiceRoller contract to check if the randomness
 * has been received from the dCipher oracle and displays the resulting dice roll.
 * Run this script 10-30 seconds after executing rollDice.js to allow time for the
 * oracle to fulfill the randomness request.
 * 
 * @requires hardhat
 * @requires ethers
 * 
 * @example
 * # Check the dice roll result on Base Sepolia
 * npx hardhat run scripts/checkRandomness.js --network baseSepolia
 * 
 * @see rollDice.js - Use this script first to initiate a dice roll
 */

/**
 * Main function to check randomness and dice roll result
 * @async
 * @function main
 * @description Performs the following operations:
 * 1. Connects to the deployed DiceRoller contract
 * 2. Retrieves the latest randomness value
 * 3. Checks if randomness has been received (non-zero value)
 * 4. If received, displays the randomness and calculated dice roll (1-6)
 * 5. If not received, prompts user to wait longer
 * 
 * @throws {Error} If the contract address is invalid or read operation fails
 * @returns {Promise<void>}
 */
async function main() {
  /**
   * Address of the deployed DiceRoller contract
   * @constant {string}
   * @description Replace this with your actual deployed contract address.
   * This should be the same address used in rollDice.js.
   */
  const diceRollerAddress = "<YOUR DICE ROLLER CONTRACT ADDRESS>";
  
  // Get a contract instance at the specified address
  const diceRoller = await ethers.getContractAt("DiceRoller", diceRollerAddress);

  /**
   * Retrieve the latest randomness value from the contract
   * @type {string}
   * @description This will be a bytes32 hex string. If it equals ZeroHash (all zeros),
   * the randomness has not been received yet from the oracle.
   */
  const latestRandomness = await diceRoller.latestRandomness();

  // Check if randomness has been received
  if (latestRandomness === ethers.ZeroHash) {
    console.log("Randomness not received yet. Wait a bit longer...");
    return;
  }

  console.log("Randomness received:", latestRandomness);

  /**
   * Get the calculated dice roll result
   * @type {BigNumber}
   * @description The contract converts the randomness to a number between 1 and 6
   * using modulo operation: (randomness % 6) + 1
   */
  const diceRoll = await diceRoller.getLatestDiceRoll();
  console.log("Dice roll:", diceRoll.toString());
}

// Execute the script
main().catch((err) => {
  console.error(err);
  process.exit(1);
});
