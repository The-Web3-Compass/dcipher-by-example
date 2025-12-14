// Script to check auction results and display winner
async function main() {
  // Configuration - update these values
  const auctionAddress = "YOUR_DEPLOYED_CONTRACT_ADDRESS";
  const auctionId = 0;
  
  const auction = await hre.ethers.getContractAt("SealedBidAuction", auctionAddress);

  // Fetch auction status
  const auctionData = await auction.getAuction(auctionId);
  const currentBlock = await hre.ethers.provider.getBlockNumber();

  console.log("Auction ID:", auctionId.toString());
  console.log("Current block:", currentBlock);
  console.log("Reveal block:", auctionData.revealBlock.toString());
  console.log("Decrypted:", auctionData.decrypted);

  // Check if decryption has completed
  if (!auctionData.decrypted) {
    console.log("\n⏳ Auction not yet decrypted.");
    
    if (currentBlock < auctionData.revealBlock) {
      console.log("Reveal block not reached yet.");
      console.log("Blocks remaining:", (auctionData.revealBlock - BigInt(currentBlock)).toString());
    } else {
      console.log("Reveal block reached. Waiting for dcipher callback...");
      console.log("This usually takes 10-30 seconds.");
    }
    return;
  }

  // Display final results
  console.log("\n✅ Auction Results:");
  console.log("Winner:", auctionData.winner);
  console.log("Winning bid:", hre.ethers.formatEther(auctionData.winningBid), "ETH");

  // Display all decrypted bids
  const bids = await auction.getBids(auctionId);
  console.log("\nAll Bids:");
  
  for (let i = 0; i < bids.length; i++) {
    const bid = bids[i];
    console.log(`\nBid ${i}:`);
    console.log("  Bidder:", bid.bidder);
    console.log("  Amount:", hre.ethers.formatEther(bid.decryptedAmount), "ETH");
    console.log("  Timestamp:", new Date(Number(bid.timestamp) * 1000).toISOString());
    
    if (bid.bidder.toLowerCase() === auctionData.winner.toLowerCase()) {
      console.log("  🏆 WINNER!");
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});