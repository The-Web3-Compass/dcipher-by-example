
// Contract and request details
const SWAPPER_ADDRESS = "0xYourDeployedCrossChainSwapperAddress"; // Your contract address
const REQUEST_ID = "0xYourSwapRequestIdFromTransaction"; // From the swap transaction

async function main() {
  // Get the swapper contract instance
  const swapper = await hre.ethers.getContractAt("CrossChainSwapper", SWAPPER_ADDRESS);
  
  console.log("Checking status for request:", REQUEST_ID);
  console.log("═══════════════════════════════════════════\n");
  
  try {
    // Fetch swap status from contract
    const status = await swapper.getSwapStatus(REQUEST_ID);
    
    console.log("📋 Swap Details:");
    console.log("- Sender:", status.sender);
    console.log("- Recipient:", status.recipient);
    console.log("- Token In:", status.tokenIn);
    console.log("- Token Out:", status.tokenOut);
    console.log("- Amount In:", hre.ethers.formatEther(status.amountIn), "tokens");
    console.log("- Amount Out:", hre.ethers.formatEther(status.amountOut), "tokens");
    console.log("- Solver Fee:", hre.ethers.formatEther(status.solverFee), "tokens");
    console.log("- Verification Fee:", hre.ethers.formatEther(status.verificationFee), "tokens");
    console.log("- Source Chain:", status.srcChainId.toString());
    console.log("- Destination Chain:", status.dstChainId.toString());
    console.log("- Nonce:", status.nonce.toString());
    console.log("- Requested At:", new Date(Number(status.requestedAt) * 1000).toLocaleString());
    
    // Display execution status
    console.log("\n🎯 Status:", status.executed ? "✅ COMPLETED" : "⏳ PENDING");
    
    if (status.executed) {
      console.log("\n🎉 Your swap is complete!");
      console.log("Tokens should be in the recipient wallet on Fuji Testnet.");
    } else {
      console.log("\n⏳ Your swap is still processing...");
      console.log("This usually takes 5-15 minutes. Check back soon!");
      console.log("\nPossible reasons for delay:");
      console.log("- Solver is fulfilling the swap on destination chain");
      console.log("- dcipher committee is verifying the transaction");
      console.log("- Network congestion on either chain");
    }
  } catch (error) {
    console.error("\n❌ Error fetching swap status:");
    console.error(error.message);
    console.log("\nMake sure you're using the correct:");
    console.log("1. Contract address (SWAPPER_ADDRESS)");
    console.log("2. Request ID from your swap transaction");
    console.log("3. Network (should be baseSepolia)");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });