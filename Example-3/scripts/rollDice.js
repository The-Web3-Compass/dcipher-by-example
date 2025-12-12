/**
 * @fileoverview Script to initiate a dice roll using the DiceRoller contract
 * @description This script interacts with a deployed DiceRoller contract to request
 * verifiable randomness from the dCipher oracle. The randomness request is paid for
 * in native tokens (ETH on Base Sepolia) and will be fulfilled asynchronously.
 * 
 * @requires hardhat
 * @requires ethers
 * 
 * @example
 * # Roll the dice on Base Sepolia
 * npx hardhat run scripts/rollDice.js --network baseSepolia
 * 
 * @see checkRandomness.js - Use this script to check the result after 10-30 seconds
 */

/**
 * Main function to execute a dice roll
 * @async
 * @function main
 * @description Performs the following operations:
 * 1. Connects to the deployed DiceRoller contract
 * 2. Initiates a randomness request with payment
 * 3. Waits for transaction confirmation
 * 4. Parses the DiceRolled event to get the request ID
 * 5. Provides instructions for checking the result
 * 
 * @throws {Error} If the contract address is invalid or transaction fails
 * @returns {Promise<void>}
 */
async function main() {
  /**
   * Address of the deployed DiceRoller contract
   * @constant {string}
   * @description Replace this with your actual deployed contract address.
   * You can find this in the deployment script output.
   */
  const diceRollerAddress = "<YOUR DICE ROLLER CONTRACT ADDRESS>";
  
  // Get a contract instance at the specified address
  const diceRoller = await ethers.getContractAt("DiceRoller", diceRollerAddress);

  /**
   * Gas limit for the randomness callback
   * @constant {number}
   * @description The amount of gas allocated for the oracle to call back with randomness.
   * 100,000 is recommended for simple operations. Increase if your callback logic is complex.
   */
  const callbackGasLimit = 100000;

  /**
   * Payment amount for the randomness request
   * @constant {BigNumber}
   * @description The amount of native token (ETH) to send with the request.
   * This covers the oracle fee. If the transaction reverts, try increasing this value.
   * The actual cost depends on gas prices and the callback gas limit.
   */
  const valueToSend = ethers.parseEther("0.0003");

  console.log("Rolling the dice...\n");

  /**
   * Execute the dice roll transaction
   * @type {TransactionResponse}
   * @description Calls the rollDice function with payment to request randomness
   */
  const tx = await diceRoller.rollDice(callbackGasLimit, {
    value: valueToSend,
  });

  console.log("tx hash:", tx.hash);

  // Wait for the transaction to be mined
  const receipt = await tx.wait();
  console.log("confirmed in block:", receipt.blockNumber);

  /**
   * Parse the DiceRolled event from transaction logs
   * @type {LogDescription|null}
   * @description Searches through transaction logs to find the DiceRolled event
   * which contains the request ID needed to track this randomness request
   */
  let parsedEvent = null;

  for (const log of receipt.logs) {
    try {
      const parsed = diceRoller.interface.parseLog(log);
      if (parsed.name === "DiceRolled") {
        parsedEvent = parsed;
        break;
      }
    } catch {
      /* ignore non-DiceRoller logs */
    }
  }

  // Handle case where event is not found
  if (!parsedEvent) {
    console.log("DiceRolled event not found — but transaction succeeded.");
    return;
  }

  // Display the request ID and next steps
  console.log("Request ID:", parsedEvent.args.requestId.toString());
  console.log("\nNow wait 10–30 seconds, then run checkRandomness.js");
}

// Execute the script
main().catch((err) => {
  console.error(err);
  process.exit(1);
});
