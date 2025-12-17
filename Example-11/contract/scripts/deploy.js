const hre = require("hardhat");

// Base Sepolia addresses
const NETWORK_CONFIG = {
  baseSepolia: {
    randomnessSender: "0xf4e080Db4765C856c0af43e4A8C4e31aA3b48779",
    router: "0x16323707e61d20A39AaE5ab64808e480B91658aB",
    rusdToken: "0x9Eb392A6286138E5d59a40Da5398e567Ab3AAd7c",
  },
};

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const networkName = hre.network.name;

  console.log("\n=== Deploying CrossChainLottery ===");
  console.log("Network:", networkName);
  console.log("Deployer:", deployer.address);
  console.log(
    "Balance:",
    hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)),
    "ETH"
  );

  // Get network config
  const config = NETWORK_CONFIG[networkName];
  if (!config) {
    throw new Error(`No configuration found for network: ${networkName}`);
  }

  console.log("\nUsing addresses:");
  console.log("- RandomnessSender:", config.randomnessSender);
  console.log("- OnlySwaps Router:", config.router);
  console.log("- RUSD Token:", config.rusdToken);

  // Entry fee: 1 RUSD (6 decimals)
  const entryFee = hre.ethers.parseUnits("1", 6);

  console.log("\nDeploying contract...");
  const CrossChainLottery = await hre.ethers.getContractFactory("CrossChainLottery");
  const lottery = await CrossChainLottery.deploy(
    config.randomnessSender,
    deployer.address, // owner
    config.router,
    config.rusdToken,
    entryFee
  );

  await lottery.waitForDeployment();
  const lotteryAddress = await lottery.getAddress();

  console.log("\n✅ CrossChainLottery deployed to:", lotteryAddress);


  // Save deployment info
  const fs = require("fs");
  const deploymentInfo = {
    network: networkName,
    contractAddress: lotteryAddress,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    config: config,
    entryFee: entryFee.toString(),
  };

  const deploymentsDir = "./deployments";
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }

  fs.writeFileSync(
    `${deploymentsDir}/${networkName}.json`,
    JSON.stringify(deploymentInfo, null, 2)
  );
}

function getExplorerUrl(network, address) {
  const explorers = {
    baseSepolia: `https://sepolia.basescan.org/address/${address}`,
    avalancheFuji: `https://testnet.snowtrace.io/address/${address}`,
  };
  return explorers[network] || "N/A";
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
