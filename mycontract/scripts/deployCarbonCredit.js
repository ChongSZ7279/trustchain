// mycontract/scripts/deployCarbonCredit.js
const hre = require("hardhat");

async function main() {
  console.log("Deploying CarbonCreditContract...");
  
  const CarbonCreditContract = await hre.ethers.getContractFactory("CarbonCreditContract");
  const carbonCreditContract = await CarbonCreditContract.deploy();
  
  await carbonCreditContract.waitForDeployment();
  
  const contractAddress = await carbonCreditContract.getAddress();
  console.log("CarbonCreditContract deployed to:", contractAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });