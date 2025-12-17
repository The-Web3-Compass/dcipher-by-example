const hre = require("hardhat");

// Base Sepolia addresses from dcipher documentation
const NETWORK_CONFIG = {
    baseSepolia: {
        blocklockSender: "0x82Fed730CbdeC5A2D8724F2e3b316a70A565e27e", // TODO: Get from dcipher docs
        router: "0x16323707e61d20A39AaE5ab64808e480B91658aB",
        rusdToken: "0x9Eb392A6286138E5d59a40Da5398e567Ab3AAd7c",
    },
};

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    const networkName = hre.network.name;

    console.log("\n=== Deploying SealedBidMarketplace ===");
    console.log("Network:", networkName);
    console.log("Deployer:", deployer.address);
    console.log(
        "Balance:",
        hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)),
        "ETH"
    );

    const config = NETWORK_CONFIG[networkName];
    if (!config) {
        throw new Error(`No configuration found for network: ${networkName}`);
    }

    console.log("\nUsing addresses:");
    console.log("- BlocklockSender:", config.blocklockSender);
    console.log("- OnlySwaps Router:", config.router);
    console.log("- RUSD Token:", config.rusdToken);

    console.log("\nDeploying contract...");
    const SealedBidMarketplace = await hre.ethers.getContractFactory("SealedBidMarketplace");
    const marketplace = await SealedBidMarketplace.deploy(
        config.blocklockSender,
        config.router,
        config.rusdToken
    );

    await marketplace.waitForDeployment();
    const marketplaceAddress = await marketplace.getAddress();

    console.log("\n✅ Deployment complete!");
    console.log("SealedBidMarketplace deployed to:", marketplaceAddress);

    console.log("\n📝 Save this address for your frontend .env file:");
    console.log(`VITE_MARKETPLACE_ADDRESS=${marketplaceAddress}`);

    console.log("\n🔗 View on BaseScan:");
    console.log(`https://sepolia.basescan.org/address/${marketplaceAddress}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
