
async function main() {
  // Replace with your deployed contract address
  const NFT_ADDRESS = "<YOUR-NFT-CONTRACT-ADDRESS>";
  
  console.log("🎨 Minting a Random Traits NFT...\n");

  const [minter] = await hre.ethers.getSigners();
  console.log("Minting from:", minter.address);

  // Connect to the deployed contract
  const nft = await hre.ethers.getContractAt("RandomTraitsNFT", NFT_ADDRESS);

  // Check current supply
  const nextTokenId = await nft.nextTokenId();
  console.log("Next Token ID:", nextTokenId.toString());

  // Set callback gas limit (100k is usually enough for our simple callback)
  const callbackGasLimit = 100000;

  // Set payment for randomness request
  // Start with 0.001 ETH, increase if it reverts
  const paymentAmount = hre.ethers.parseEther("0.0001");

  console.log("\nSending mint transaction...");
  console.log("Callback Gas Limit:", callbackGasLimit);
  console.log("Payment Amount:", hre.ethers.formatEther(paymentAmount), "ETH");

  // Mint!
  const tx = await nft.mint(callbackGasLimit, { value: paymentAmount });
  
  console.log("\n⏳ Transaction sent:", tx.hash);
  console.log("Waiting for confirmation...");

  const receipt = await tx.wait();
  
  console.log("✅ Minted in block:", receipt.blockNumber);

  // Parse the NFTMinted event to get token ID and request ID
  const mintEvent = receipt.logs
    .map(log => {
      try {
        return nft.interface.parseLog(log);
      } catch {
        return null;
      }
    })
    .find(event => event && event.name === "NFTMinted");

  if (mintEvent) {
    console.log("\n🎉 NFT Minted!");
    console.log("Token ID:", mintEvent.args.tokenId.toString());
    console.log("Randomness Request ID:", mintEvent.args.requestId.toString());
    console.log("\n⏱️  Traits will be revealed in 10-30 seconds...");
    console.log("💡 Run 'npx hardhat run scripts/checkTraits.js --network baseSepolia' to see traits");
  }

  console.log("\n🔗 View transaction:");
  console.log(`   https://sepolia.basescan.org/tx/${tx.hash}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });