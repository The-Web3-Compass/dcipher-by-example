// Check if randomness has been received and see the dice result
// Usage: npx hardhat run scripts/checkRandomness.js --network baseSepolia

async function main() {
  // Replace with your deployed contract address
  const diceRollerAddress = "<YOUR DICE ROLLER CONTRACT ADDRESS>";
  
  const diceRoller = await ethers.getContractAt("DiceRoller", diceRollerAddress);

  const latestRandomness = await diceRoller.latestRandomness();

  if (latestRandomness === ethers.ZeroHash) {
    console.log("Randomness not received yet. Wait a bit longer...");
    return;
  }

  console.log("Randomness received:", latestRandomness);

  const diceRoll = await diceRoller.getLatestDiceRoll();
  console.log("Dice roll:", diceRoll.toString());
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
