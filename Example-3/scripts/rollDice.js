// Roll the dice - requests randomness from dcipher oracle
// Usage: npx hardhat run scripts/rollDice.js --network baseSepolia

async function main() {
  // Replace with your deployed contract address
  const diceRollerAddress = "<YOUR DICE ROLLER CONTRACT ADDRESS>";
  
  const diceRoller = await ethers.getContractAt("DiceRoller", diceRollerAddress);

  const callbackGasLimit = 100000;
  const valueToSend = ethers.parseEther("0.0003"); // Oracle fee

  console.log("Rolling the dice...\n");

  const tx = await diceRoller.rollDice(callbackGasLimit, {
    value: valueToSend,
  });

  console.log("tx hash:", tx.hash);

  const receipt = await tx.wait();
  console.log("confirmed in block:", receipt.blockNumber);

  // Find the DiceRolled event
  let parsedEvent = null;

  for (const log of receipt.logs) {
    try {
      const parsed = diceRoller.interface.parseLog(log);
      if (parsed.name === "DiceRolled") {
        parsedEvent = parsed;
        break;
      }
    } catch {
      // Ignore non-DiceRoller logs
    }
  }

  if (!parsedEvent) {
    console.log("DiceRolled event not found — but transaction succeeded.");
    return;
  }

  console.log("Request ID:", parsedEvent.args.requestId.toString());
  console.log("\nNow wait 10–30 seconds, then run checkRandomness.js");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
