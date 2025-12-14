// Script to submit an encrypted bid to an auction
const hre = require("hardhat");
const { Blocklock } = require("blocklock-js");
const { encodeParams, encodeCiphertextToSolidity } = require("blocklock-js");

async function main() {
  // Configuration - update these values
  const auctionAddress = "YOUR_DEPLOYED_CONTRACT_ADDRESS";
  const auctionId = 0; // The auction ID from previous step
  const bidAmountETH = "0.0025"; // Your bid: 0.0025 ETH
  
  const auction = await hre.ethers.getContractAt("SealedBidAuction", auctionAddress);
  const [signer] = await hre.ethers.getSigners();

  // Fetch auction details to get the reveal block
  const auctionData = await auction.getAuction(auctionId);
  const revealBlock = auctionData.revealBlock;

  console.log("Submitting bid to auction:", auctionId.toString());
  console.log("Your bid:", bidAmountETH, "ETH");
  console.log("Reveal block:", revealBlock.toString());
  console.log("Current block:", await hre.ethers.provider.getBlockNumber());

  // Encode bid amount as bytes
  const bidAmount = hre.ethers.parseEther(bidAmountETH);
  const encodedBid = encodeParams(["uint256"], [bidAmount]);
  const bidBytes = hre.ethers.getBytes(encodedBid);

  // Encrypt bid using dcipher time-lock encryption
  console.log("\nEncrypting bid...");
  const blocklockjs = Blocklock.createBaseSepolia(signer);
  const encryptedBid = blocklockjs.encrypt(bidBytes, revealBlock);

  // Convert ciphertext to Solidity-compatible format
  const solidityEncrypted = encodeCiphertextToSolidity(encryptedBid);

  // Submit encrypted bid to contract
  console.log("Submitting encrypted bid to contract...");
  const tx = await auction.submitBid(auctionId, solidityEncrypted);

  console.log("Transaction hash:", tx.hash);
  const receipt = await tx.wait();

  console.log("\n✅ Bid submitted!");
  console.log("Your bid is now encrypted on-chain.");
  console.log("Nobody can see the amount until block:", revealBlock.toString());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});