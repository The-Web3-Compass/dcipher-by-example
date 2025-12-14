// Script to create a new sealed bid auction
async function main() {
  // Replace with your deployed contract address
  const auctionAddress = "YOUR_DEPLOYED_CONTRACT_ADDRESS";
  
  const auction = await hre.ethers.getContractAt("SealedBidAuction", auctionAddress);

  // Auction parameters
  const description = "Rare Digital Collectible";
  const minBid = hre.ethers.parseEther("0.001"); // 0.001 ETH minimum
  const blocksUntilReveal = 50; // Reveal in 50 blocks (~10 minutes on Base)
  const biddingDuration = 30; // Accept bids for 30 blocks (~6 minutes)

  console.log("Creating auction...");
  console.log("Description:", description);
  console.log("Min bid:", hre.ethers.formatEther(minBid), "ETH");
  console.log("Bidding window:", biddingDuration, "blocks");
  console.log("Reveal block: current +", blocksUntilReveal);

  // Create the auction on-chain
  const tx = await auction.createAuction(
    description,
    minBid,
    blocksUntilReveal,
    biddingDuration
  );

  console.log("\nTransaction hash:", tx.hash);
  const receipt = await tx.wait();
  
  // Parse the AuctionCreated event to get auction details
  const event = receipt.logs.find(log => {
    try {
      const parsed = auction.interface.parseLog(log);
      return parsed.name === "AuctionCreated";
    } catch {
      return false;
    }
  });

  if (event) {
    const parsed = auction.interface.parseLog(event);
    const auctionId = parsed.args.auctionId;
    const revealBlock = parsed.args.revealBlock;
    const biddingDeadline = parsed.args.biddingDeadline;

    console.log("\n✅ Auction created!");
    console.log("Auction ID:", auctionId.toString());
    console.log("Bidding closes at block:", biddingDeadline.toString());
    console.log("Reveals at block:", revealBlock.toString());
    console.log("\nBidders should encrypt their bids for block:", revealBlock.toString());
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});