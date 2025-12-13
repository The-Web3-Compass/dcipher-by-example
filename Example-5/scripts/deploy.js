
async function main() {
  console.log("🚀 Deploying RandomTraitsNFT to Base Sepolia...\n");

  // CRITICAL: Replace with current RandomnessSender address from dcipher docs
  const RANDOMNESS_SENDER = "<BASE_SEPOLIA_RANDOMNESS_SENDER_ADDRESS>";

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying from:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "ETH\n");

  // Deploy the contract
  const RandomTraitsNFT = await hre.ethers.getContractFactory("RandomTraitsNFT");
  
  console.log("Deploying contract...");
  const nft = await RandomTraitsNFT.deploy(RANDOMNESS_SENDER, deployer.address);

  await nft.waitForDeployment();
  
  const contractAddress = await nft.getAddress();

  console.log("\n✅ RandomTraitsNFT deployed to:", contractAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });