const hre = require("hardhat");
const fs = require("fs");

async function main() {
  const networkName = hre.network.name;
  const [signer] = await hre.ethers.getSigners();

  console.log("\n=== Creating New Lottery ===");
  console.log("Network:", networkName);
  console.log("Signer:", signer.address);

  // Load deployment info
  const deploymentPath = `./deployments/${networkName}.json`;
  if (!fs.existsSync(deploymentPath)) {
    throw new Error(`No deployment found for ${networkName}. Please deploy first.`);
  }

  const deployment = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
  const lotteryAddress = deployment.contractAddress;

  console.log("Lottery Contract:", lotteryAddress);

  // Get contract instance
  const lottery = await hre.ethers.getContractAt("CrossChainLottery", lotteryAddress);

  // Lottery parameters
  const entryFee = hre.ethers.parseUnits("0.1", 6); // 0.1 RUSD (6 decimals)
  const duration = 3600; // 5 mins in seconds

  console.log("\nLottery Parameters:");
  console.log("- Entry Fee:", hre.ethers.formatUnits(entryFee, 6), "RUSD");
  console.log("- Duration:", duration, "seconds (", duration / 60, "minutes )");

  // Create lottery
  console.log("\nCreating lottery...");
  const tx = await lottery.createLottery(entryFee, duration);
  console.log("Transaction hash:", tx.hash);

  const receipt = await tx.wait();
  console.log("✅ Transaction confirmed in block:", receipt.blockNumber);

  // Get current lottery ID
  const currentLotteryId = await lottery.lotteryId();
  console.log("\n✅ Lottery Created!");
  console.log("Lottery ID:", currentLotteryId.toString());

  // Get lottery details
  const lotteryDetails = await lottery.getLottery(currentLotteryId);
  console.log("\nLottery Details:");
  console.log("- ID:", lotteryDetails.id.toString());
  console.log("- Entry Fee:", hre.ethers.formatUnits(lotteryDetails._entryFee, 6), "RUSD");
  console.log("- Prize Pool:", hre.ethers.formatUnits(lotteryDetails._prizePool, 6), "RUSD");
  console.log("- Start Time:", new Date(Number(lotteryDetails.startTime) * 1000).toLocaleString());
  console.log("- End Time:", new Date(Number(lotteryDetails.endTime) * 1000).toLocaleString());
  console.log("- Participants:", lotteryDetails.participantCount.toString());
  console.log("- State:", ["OPEN", "DRAWING", "CLOSED"][lotteryDetails.state]);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
