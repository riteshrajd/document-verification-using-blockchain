import hre from "hardhat";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const DocumentVerifier = await hre.ethers.getContractFactory("DocumentVerifier");
  console.log("Deploying DocumentVerifier...");
  
  const documentVerifier = await DocumentVerifier.deploy();
  await documentVerifier.waitForDeployment();

  const address = await documentVerifier.getAddress();
  console.log(`DocumentVerifier deployed to: ${address}`);

  // Save the contract address and ABI to the frontend
  const artifact = await hre.artifacts.readArtifact("DocumentVerifier");
  
  const frontendDir = __dirname + "/../frontend/src";
  if (!fs.existsSync(frontendDir)) {
    fs.mkdirSync(frontendDir, { recursive: true });
  }

  fs.writeFileSync(
    frontendDir + "/ContractInfo.js",
    `export const CONTRACT_ADDRESS = "${address}";\nexport const CONTRACT_ABI = ${JSON.stringify(artifact.abi, null, 2)};`
  );
  
  console.log("Contract info saved to frontend/src/ContractInfo.js");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
