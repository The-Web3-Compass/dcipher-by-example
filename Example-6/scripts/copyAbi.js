const fs = require("fs");
const path = require("path");

async function main() {
  const artifactPath = path.join(
    __dirname,
    "../artifacts/contracts/GiftMessage.sol/GiftMessage.json"
  );
  
  const configPath = path.join(__dirname, "../frontend/src/abi.ts");
  
  if (!fs.existsSync(artifactPath)) {
    console.error("❌ Artifact not found. Run 'npm run compile' first.");
    process.exit(1);
  }
  
  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
  const abi = artifact.abi;
  
  const content = `// Auto-generated - run 'npm run copy-abi' to regenerate
export const GIFT_MESSAGE_ABI = ${JSON.stringify(abi, null, 2)} as const;
`;
  
  const srcDir = path.dirname(configPath);
  if (!fs.existsSync(srcDir)) {
    fs.mkdirSync(srcDir, { recursive: true });
  }
  
  fs.writeFileSync(configPath, content);
  
  console.log("✅ ABI copied to frontend/src/abi.ts");
  console.log(`   ${abi.length} functions/events exported`);
}

main();
