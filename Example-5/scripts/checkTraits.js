
async function main() {
  // Replace with your deployed contract address
  const NFT_ADDRESS = "0x32125CCF6c2F9Db2f5252453d982733522A0937e";
  
  // Which token do you want to check?
  const tokenId = 1;

  console.log("🔍 Checking traits for Token ID:", tokenId, "\n");

  const nft = await hre.ethers.getContractAt("RandomTraitsNFT", NFT_ADDRESS);

  // Check if traits are revealed
  const seed = await nft.tokenTraitSeed(tokenId);
  
  if (seed === "0x0000000000000000000000000000000000000000000000000000000000000000") {
    console.log("⏳ Traits not revealed yet...");
    console.log("💡 The dcipher network is still processing your randomness request.");
    console.log("💡 This usually takes 10-30 seconds. Try again in a moment!");
    return;
  }

  console.log("✅ Traits revealed!");
  console.log("🎲 Random Seed:", seed, "\n");

  // Get the traits
  const traits = await nft.getTraits(tokenId);
  
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("     NFT #" + tokenId + " TRAITS");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🔷 Shape:", traits.shape);
  console.log("🎨 Color:", traits.color);
  console.log("📏 Size:", traits.size);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // Get the full metadata
  console.log("🖼️  Getting metadata...\n");
  const tokenURI = await nft.tokenURI(tokenId);
  
  // The tokenURI is a data URI, decode it to see the JSON
  if (tokenURI.startsWith("data:application/json;base64,")) {
    const base64Data = tokenURI.replace("data:application/json;base64,", "");
    const jsonString = Buffer.from(base64Data, "base64").toString("utf8");
    const metadata = JSON.parse(jsonString);
    
    console.log("📋 Metadata:");
    console.log("   Name:", metadata.name);
    console.log("   Description:", metadata.description);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });