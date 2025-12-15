const hre = require("hardhat");

async function main() {
  console.log("🎁 Deploying GiftMessage contract...\n");
  
  const blocklockSender = "0x82Fed730CbdeC5A2D8724F2e3b316a70A565e27e";
  
  console.log("Network:", hre.network.name);
  console.log("BlocklockSender address:", blocklockSender);
  
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "ETH\n");
  
  const GiftMessage = await hre.ethers.getContractFactory("GiftMessage");
  const contract = await GiftMessage.deploy(blocklockSender);
  
  await contract.waitForDeployment();
  const address = await contract.getAddress();
  
  console.log("✅ GiftMessage deployed to:", address);
  console.log("\n📋 Save this address for your frontend config!");
  
  console.log("\n⏳ Waiting for block confirmations...");
  await contract.deploymentTransaction().wait(5);
  console.log("✅ Confirmed!");
  
  console.log("\n🔍 Attempting contract verification on Basescan...");
  try {
    await hre.run("verify:verify", {
      address: address,
      constructorArguments: [blocklockSender],
    });
    console.log("✅ Contract verified on Basescan!");
  } catch (error) {
    if (error.message.includes("Already Verified")) {
      console.log("✅ Contract already verified!");
    } else {
      console.log("⚠️ Verification failed:", error.message);
      console.log("You can verify manually later with:");
      console.log(`npx hardhat verify --network baseSepolia ${address} ${blocklockSender}`);
    }
  }
  
  console.log("\n🎉 Deployment complete!");
  console.log("\nNext steps:");
  console.log("1. Run: npm run copy-abi");
  console.log("2. Update CONTRACT_ADDRESS in frontend/src/config.ts");
  console.log("3. Run: cd frontend && npm install && npm run dev");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
