const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Contract", function () {
  let contract;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    
    const Contract = await ethers.getContractFactory("Contract");
    contract = await Contract.deploy();
  });

  it("Should deploy successfully", async function () {
    expect(await contract.getAddress()).to.be.properAddress;
  });

  // Add more tests specific to your contract
}); 