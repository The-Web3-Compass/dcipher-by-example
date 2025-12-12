/**
 * @fileoverview Deployment script for the DiceRoller smart contract
 * @description This script deploys the DiceRoller contract to the Base Sepolia testnet
 * using Hardhat. It configures the contract with the dCipher RandomnessSender oracle
 * address and sets the deployer as the contract owner.
 * 
 * @requires hardhat
 * @requires ethers
 * 
 * @example
 * # Deploy to Base Sepolia
 * npx hardhat run scripts/deploy.js --network baseSepolia
 * 
 * # Deploy to local Hardhat network
 * npx hardhat run scripts/deploy.js --network hardhat
 */

/**
 * Main deployment function
 * @async
 * @function main
 * @description Deploys the DiceRoller contract with the following steps:
 * 1. Gets the contract factory for DiceRoller
 * 2. Retrieves the deployer's signer
 * 3. Deploys the contract with RandomnessSender and owner addresses
 * 4. Waits for deployment confirmation
 * 5. Logs deployment details and initial state
 * 
 * @throws {Error} If deployment fails or contract interaction fails
 * @returns {Promise<void>}
 */
async function main() {
  // Get the contract factory for DiceRoller
  const DiceRollerFactory = await ethers.getContractFactory("DiceRoller");

  /**
   * dCipher RandomnessSender contract address for Base Sepolia
   * @constant {string}
   * @description This is the official dCipher oracle address on Base Sepolia testnet.
   * For other networks, consult the dCipher documentation.
   * @see https://docs.dcipher.io
   */
  const randomnessSenderAddress = "0xf4e080Db4765C856c0af43e4A8C4e31aA3b48779";

  // Get the deployer's signer and address
  const [deployer] = await ethers.getSigners();
  const ownerAddress = deployer.address;

  console.log("Deploying DiceRoller...");
  console.log("Deployer:", deployer.address);
  console.log("RandomnessSender:", randomnessSenderAddress);

  /**
   * Deploy the DiceRoller contract
   * @type {Contract}
   * @description Deploys with two constructor arguments:
   * - randomnessSenderAddress: The dCipher oracle contract address
   * - ownerAddress: The address that will own and control the contract
   */
  const diceRoller = await DiceRollerFactory.deploy(
    randomnessSenderAddress,
    ownerAddress
  );

  // Wait for the deployment transaction to be mined
  await diceRoller.waitForDeployment();

  // Log deployment information
  console.log("DiceRoller deployed to:", await diceRoller.getAddress());
  console.log("Roll count:", await diceRoller.rollCount());
  console.log("Latest request ID:", await diceRoller.latestRequestId());

  console.log("✅ Deployment complete");
}

// Execute the deployment script
main().catch((err) => {
  console.error(err);
  process.exit(1);
});
