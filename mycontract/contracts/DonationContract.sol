// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DonationContract {
    address public owner;
    
    // Mapping from charity ID to total donations
    mapping(uint256 => uint256) public charityDonations;
    
    // Mapping from donor address to total donations
    mapping(address => uint256) public donorTotalDonations;
    
    event DonationMade(
        address indexed donor,
        uint256 indexed charityId,
        uint256 amount,
        string message
    );
    
    constructor() {
        owner = msg.sender;
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call this function");
        _;
    }
    
    function donate(uint256 charityId, string memory message) public payable {
        require(msg.value > 0, "Donation amount must be greater than 0");
        
        // Update charity donations
        charityDonations[charityId] += msg.value;
        
        // Update donor total donations
        donorTotalDonations[msg.sender] += msg.value;
        
        // Emit donation event
        emit DonationMade(msg.sender, charityId, msg.value, message);
    }
    
    function getContractBalance() public view returns (uint256) {
        return address(this).balance;
    }
    
    function getCharityDonations(uint256 charityId) public view returns (uint256) {
        return charityDonations[charityId];
    }
    
    function getDonorTotalDonations(address donor) public view returns (uint256) {
        return donorTotalDonations[donor];
    }
    
    function withdrawFunds(address payable recipient, uint256 amount) public onlyOwner {
        require(amount <= address(this).balance, "Insufficient contract balance");
        recipient.transfer(amount);
    }
} 