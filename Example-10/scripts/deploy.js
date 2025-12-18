// Deploy CrossChainPaymentGateway contract

const ROUTER_ADDRESSES = {
  baseSepolia: "0x16323707e61d20A39AaE5ab64808e480B91658aB",
  avalancheFuji: "0x16323707e61d20A39AaE5ab64808e480B91658aB"
};

const SETTLEMENT_CONFIG = {
  chainId: 84532,
  token: "0x9Eb392A6286138E5d59a40Da5398e567Ab3AAd7c"
};

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  
  console.log("Deploying CrossChainPaymentGateway...");
  console.log("Deployer:", deployer.address);
  
  const networkName = hre.network.name;
  console.log("Network:", networkName);
  
  let routerAddress;
  if (networkName === "baseSepolia") {
    routerAddress = ROUTER_ADDRESSES.baseSepolia;
  } else if (networkName === "avalancheFuji") {
    routerAddress = ROUTER_ADDRESSES.avalancheFuji;
  } else {
    throw new Error(`No router address configured for network: ${networkName}`);
  }
  
  console.log("Router:", routerAddress);
  console.log("Settlement Chain:", SETTLEMENT_CONFIG.chainId);
  console.log("Settlement Token:", SETTLEMENT_CONFIG.token);
  
  const PaymentGateway = await hre.ethers.getContractFactory("CrossChainPaymentGateway");
  const gateway = await PaymentGateway.deploy(
    routerAddress,
    SETTLEMENT_CONFIG.chainId,
    SETTLEMENT_CONFIG.token
  );
  
  await gateway.waitForDeployment();
  const gatewayAddress = await gateway.getAddress();
  
  console.log("CrossChainPaymentGateway deployed to:", gatewayAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
