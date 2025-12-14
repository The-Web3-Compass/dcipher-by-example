async function main() {
  console.log("Deploying SealedBidAuction...");

  // Base Sepolia dcipher BlocklockSender address
  const blocklockSenderAddress = "0x82Fed730CbdeC5A2D8724F2e3b316a70A565e27e";

  // Deploy the auction contract
  const SealedBidAuction = await hre.ethers.getContractFactory("SealedBidAuction");
  const auction = await SealedBidAuction.deploy(blocklockSenderAddress);

  await auction.waitForDeployment();

  const address = await auction.getAddress();
  console.log("SealedBidAuction deployed to:", address);
  console.log("\n✅ Deployment complete");
  console.log("Save this address for the next steps!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});