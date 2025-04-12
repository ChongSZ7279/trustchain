const hre = require("hardhat");

async function main() {
  console.log("Deploying contract to Scroll Sepolia...");
  
  // Get the contract factory
  const DonationContract = await hre.ethers.getContractFactory("DonationContract");
  
  // Deploy the contract
  const donationContract = await DonationContract.deploy();
  
  // Wait for deployment to complete
  await donationContract.waitForDeployment();
  
  // Get the contract address
  const contractAddress = await donationContract.getAddress();
  console.log("DonationContract deployed to:", contractAddress);
  
  // Verify the contract (optional)
  try {
    if (hre.network.name === "scrollSepolia") {
      await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: [],
      });
    }
  } catch (error) {
    console.error("Verification failed:", error);
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 