// We require the Hardhat Runtime Environment explicitly here.
const hre = require("hardhat");

async function main() {
  console.log("Deploying DonationContract to Scroll Sepolia...");

  // Get the contract factory
  const DonationContract = await hre.ethers.getContractFactory("DonationContract");
  
  // Deploy the contract
  const donationContract = await DonationContract.deploy();

  // Wait for deployment to finish
  await donationContract.waitForDeployment();

  // Get the contract address
  const contractAddress = await donationContract.getAddress();
  
  console.log(`DonationContract deployed to: ${contractAddress}`);
  console.log("Save this address and update your environment variables!");
}

// Execute the deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
