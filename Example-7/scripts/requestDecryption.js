// Script to request decryption of auction bids after bidding closes
async function main() {
  // Configuration - update these values
  const auctionAddress = "YOUR_DEPLOYED_CONTRACT_ADDRESS";
  const auctionId = 0;
  
  const auction = await hre.ethers.getContractAt("SealedBidAuction", auctionAddress);

  // Check auction status
  const auctionData = await auction.getAuction(auctionId);
  const currentBlock = await hre.ethers.provider.getBlockNumber();

  console.log("Auction ID:", auctionId.toString());
  console.log("Current block:", currentBlock);
  console.log("Bidding deadline:", auctionData.biddingDeadline.toString());
  console.log("Reveal block:", auctionData.revealBlock.toString());

  // Validate auction is ready for decryption
  if (currentBlock <= auctionData.biddingDeadline) {
    console.log("\n❌ Bidding period is still open!");
    console.log("Wait until block:", auctionData.biddingDeadline.toString());
    return;
  }

  if (auctionData.decrypted) {
    console.log("\n✅ Auction already decrypted!");
    console.log("Winner:", auctionData.winner);
    console.log("Winning bid:", hre.ethers.formatEther(auctionData.winningBid), "ETH");
    return;
  }

  const bidCount = await auction.getBidCount(auctionId);
  console.log("Number of bids:", bidCount.toString());

  if (bidCount === 0n) {
    console.log("\n❌ No bids to decrypt!");
    return;
  }

  // Gas limit for callback - needs to cover decryption of all bids
  const callbackGasLimit = 500000;

  // Calculate cost for dcipher callback
  const BlocklockSender = await hre.ethers.getContractAt(
    "IBlocklockSender",
    "0x82Fed730CbdeC5A2D8724F2e3b316a70A565e27e" // Base Sepolia BlocklockSender
  );
  
  const requestPrice = await BlocklockSender.calculateRequestPriceNative(callbackGasLimit);

  console.log("\nCallback gas limit:", callbackGasLimit);
  console.log("Request price:", hre.ethers.formatEther(requestPrice), "ETH");

  // Submit decryption request to dcipher network
  console.log("\nRequesting decryption...");
  const tx = await auction.requestDecryption(auctionId, callbackGasLimit, {
    value: requestPrice
  });

  console.log("Transaction hash:", tx.hash);
  const receipt = await tx.wait();

  console.log("\n✅ Decryption requested!");
  console.log("The dcipher network will deliver the decryption key when block", 
              auctionData.revealBlock.toString(), "is reached.");
  console.log("\nThis typically takes 10-30 seconds after the reveal block.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});