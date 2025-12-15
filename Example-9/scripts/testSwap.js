
// Addresses (update these with real values)
const SWAPPER_ADDRESS = "0xYourDeployedCrossChainSwapperAddress"; // Your deployed CrossChainSwapper
const RUSD_BASE_SEPOLIA = "0xYourRUSDTokenAddressOnBaseSepolia"; // RUSD token on Base Sepolia
const RUSD_AVAX_FUJI = "0xYourRUSDTokenAddressOnAvalancheFuji"; // RUSD token on Avalanche Fuji
const RECIPIENT_ADDRESS = "0xYourRecipientAddressOnDestinationChain"; // Where tokens go on destination chain

async function main() {
  const [signer] = await hre.ethers.getSigners();
  
  console.log("Testing swap with account:", signer.address);
  
  // Get contract instances
  const swapper = await hre.ethers.getContractAt("CrossChainSwapper", SWAPPER_ADDRESS);
  const rusd = await hre.ethers.getContractAt("IERC20", RUSD_BASE_SEPOLIA);
  
  // Check RUSD balance
  const balance = await rusd.balanceOf(signer.address);
  console.log("RUSD balance:", hre.ethers.formatEther(balance));
  
  // Define swap parameters
  const amountIn = hre.ethers.parseUnits("1", 18); // Swap 1 token
  const amountOut = hre.ethers.parseUnits("0.95", 18); // Receive 0.95 tokens (after network fee)
  const solverFee = hre.ethers.parseUnits("0.01", 18); // Pay 0.01 tokens to solver
  const destinationChainId = 43113; // Avalanche Fuji
  
  // Calculate total tokens needed
  const totalNeeded = amountIn + solverFee;
  console.log("\nSwap Parameters:");
  console.log("- Amount In:", hre.ethers.formatEther(amountIn), "RUSD");
  console.log("- Amount Out:", hre.ethers.formatEther(amountOut), "RUSD");
  console.log("- Solver Fee:", hre.ethers.formatEther(solverFee), "RUSD");
  console.log("- Total Needed:", hre.ethers.formatEther(totalNeeded), "RUSD");
  console.log("- Destination Chain:", destinationChainId, "(Avalanche Fuji)");
  console.log("- Recipient:", RECIPIENT_ADDRESS);
  
  // Approve tokens for the swapper contract
  console.log("\nApproving tokens...");
  const approveTx = await rusd.approve(SWAPPER_ADDRESS, totalNeeded);
  await approveTx.wait();
  console.log("✅ Tokens approved");
  
  // Initiate the cross-chain swap
  console.log("\nInitiating cross-chain swap...");
  const swapTx = await swapper.initiateSwap(
    RUSD_BASE_SEPOLIA,      // tokenIn
    RUSD_AVAX_FUJI,         // tokenOut
    amountIn,               // amountIn
    amountOut,              // amountOut
    solverFee,              // solverFee
    destinationChainId,     // destinationChainId
    RECIPIENT_ADDRESS       // recipient
  );
  
  console.log("Transaction hash:", swapTx.hash);
  console.log("Waiting for confirmation...");
  
  const receipt = await swapTx.wait();
  console.log("✅ Swap initiated successfully!");
  console.log("Block number:", receipt.blockNumber);
  
  // Extract request ID from transaction events
  let requestId = null;
  for (const log of receipt.logs) {
    try {
      const parsed = swapper.interface.parseLog({
        topics: log.topics,
        data: log.data
      });
      if (parsed && parsed.name === "SwapInitiated") {
        requestId = parsed.args.requestId;
        break;
      }
    } catch (e) {
      // Skip logs that don't match
      continue;
    }
  }
  
  if (requestId) {
    console.log("\nRequest ID:", requestId);
    console.log("\n⏳ Swap is pending. A solver will execute it on the destination chain.");
    console.log("You can check the status later using the request ID.");
  } else {
    console.log("\n⚠️ Could not extract request ID from transaction logs.");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });