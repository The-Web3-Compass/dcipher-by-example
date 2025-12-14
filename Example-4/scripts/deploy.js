const hre = require("hardhat");

async function main() {
  console.log("Deploying FairLottery...");
  
  // Deployment parameters
  const ticketPrice = hre.ethers.parseEther("0.01"); // 0.01 ETH per ticket
  const maxTickets = 100;
  
  // dcipher RandomnessSender contract address
  // Get this from: https://docs.dcipher.network/networks/randomness
  // For Base Sepolia testnet: 0xf4e080Db4765C856c0af43e4A8C4e31aA3b48779
  const randomnessSender = process.env.RANDOMNESS_SENDER_ADDRESS || "0xf4e080Db4765C856c0af43e4A8C4e31aA3b48779";
  
  console.log("Parameters:");
  console.log("- Ticket Price:", hre.ethers.formatEther(ticketPrice), "ETH");
  console.log("- Max Tickets:", maxTickets);
  console.log("- RandomnessSender:", randomnessSender);
  
  const FairLottery = await hre.ethers.getContractFactory("FairLottery");
  const lottery = await FairLottery.deploy(
    ticketPrice,
    maxTickets,
    randomnessSender
  );
  
  await lottery.waitForDeployment();
  
  const address = await lottery.getAddress();
  console.log("\nFairLottery deployed to:", address);
  console.log("\nSave this address for the frontend!");
  
  // Wait for block confirmations
  console.log("\nWaiting for block confirmations...");
  await lottery.deploymentTransaction().wait(5);
  
  // Verify on Etherscan
  console.log("\nVerifying contract...");
  try {
    await hre.run("verify:verify", {
      address: address,
      constructorArguments: [ticketPrice, maxTickets, randomnessSender],
    });
    console.log("Contract verified on Etherscan");
  } catch (error) {
    console.log("Verification failed:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });