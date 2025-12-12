// Deploy DiceRoller contract
// Usage: npx hardhat run scripts/deploy.js --network baseSepolia

async function main() {
  const DiceRollerFactory = await ethers.getContractFactory("DiceRoller");

  // dcipher oracle address on Base Sepolia
  const randomnessSenderAddress = "0xf4e080Db4765C856c0af43e4A8C4e31aA3b48779";

  const [deployer] = await ethers.getSigners();
  const ownerAddress = deployer.address;

  console.log("Deploying DiceRoller...");
  console.log("Deployer:", deployer.address);
  console.log("RandomnessSender:", randomnessSenderAddress);

  const diceRoller = await DiceRollerFactory.deploy(
    randomnessSenderAddress,
    ownerAddress
  );

  await diceRoller.waitForDeployment();

  console.log("DiceRoller deployed to:", await diceRoller.getAddress());
  console.log("Roll count:", await diceRoller.rollCount());
  console.log("Latest request ID:", await diceRoller.latestRequestId());

  console.log("✅ Deployment complete");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
