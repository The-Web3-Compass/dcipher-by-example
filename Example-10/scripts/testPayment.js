// Test cross-chain payment flow

const GATEWAY_ADDRESS = "0x9a957CBf2938A8f18cC622dCa7452003A3e8f154";
const SOURCE_TOKEN = "0xFDdcB87aFED6B20cF7616A7339Bc5f8aC37154C3";

async function main() {
  const [signer] = await hre.ethers.getSigners();
  
  console.log("Testing payment flow...");
  console.log("Account:", signer.address);
  console.log("Chain ID:", (await hre.ethers.provider.getNetwork()).chainId.toString());
  
  const gateway = await hre.ethers.getContractAt("CrossChainPaymentGateway", GATEWAY_ADDRESS);
  const sourceToken = await hre.ethers.getContractAt("IERC20", SOURCE_TOKEN);
  
  const balance = await sourceToken.balanceOf(signer.address);
  console.log("Token balance:", hre.ethers.formatEther(balance));
  
  // Step 1: Register merchant
  const merchantInfo = await gateway.getMerchantInfo(signer.address);
  if (!merchantInfo.isRegistered) {
    console.log("Registering as merchant...");
    const registerTx = await gateway.registerMerchant(signer.address);
    await registerTx.wait();
    console.log("Merchant registered");
  } else {
    console.log("Already registered as merchant");
  }
  
  // Step 2: Make payment
  const orderId = hre.ethers.keccak256(hre.ethers.toUtf8Bytes(`ORDER-${Date.now()}`));
  const amountIn = hre.ethers.parseUnits("1", 18);
  const expectedSettlement = hre.ethers.parseUnits("0.95", 18);
  const solverFee = hre.ethers.parseUnits("0.01", 18);
  const totalNeeded = amountIn + solverFee;
  
  console.log("Approving tokens...");
  const approveTx = await sourceToken.approve(GATEWAY_ADDRESS, totalNeeded);
  await approveTx.wait();
  
  console.log("Making payment...");
  const paymentTx = await gateway.makePayment(
    signer.address,
    orderId,
    SOURCE_TOKEN,
    amountIn,
    expectedSettlement,
    solverFee
  );
  
  const receipt = await paymentTx.wait();
  console.log("Payment tx:", paymentTx.hash);
  
  // Extract payment ID from events
  for (const log of receipt.logs) {
    try {
      const parsed = gateway.interface.parseLog({ topics: log.topics, data: log.data });
      if (parsed && parsed.name === "PaymentInitiated") {
        console.log("Payment ID:", parsed.args.paymentId);
        console.log("Swap Request ID:", parsed.args.swapRequestId);
        break;
      }
    } catch (e) {
      continue;
    }
  }
  
  console.log("Payment initiated. Pending cross-chain settlement.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
