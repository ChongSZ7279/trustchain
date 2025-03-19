// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CharityContract {
    struct Charity {
        uint256 id;
        address payable wallet;
        bool exists;
        uint256 totalDonations;
        uint256 releasedFunds;
    }
    
    struct Milestone {
        uint256 id;
        uint256 charityId;
        uint256 amount;
        bool completed;
    }
    
    mapping(uint256 => Charity) public charities;
    mapping(uint256 => mapping(uint256 => Milestone)) public milestones;
    mapping(uint256 => uint256) public charityBalances;
    
    address public owner;
    
    event CharityRegistered(uint256 indexed charityId, address wallet);
    event DonationMade(uint256 indexed charityId, address indexed donor, uint256 amount, uint256 timestamp);
    event MilestoneCompleted(uint256 indexed charityId, uint256 indexed milestoneId, uint256 amount, uint256 timestamp);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    constructor() {
        owner = msg.sender;
    }
    
    function registerCharity(uint256 charityId, address payable wallet) external onlyOwner {
        require(!charities[charityId].exists, "Charity already registered");
        
        charities[charityId] = Charity({
            id: charityId,
            wallet: wallet,
            exists: true,
            totalDonations: 0,
            releasedFunds: 0
        });
        
        emit CharityRegistered(charityId, wallet);
    }
    
    function registerMilestone(uint256 charityId, uint256 milestoneId, uint256 amount) external onlyOwner {
        require(charities[charityId].exists, "Charity does not exist");
        require(!milestones[charityId][milestoneId].completed, "Milestone already exists");
        
        milestones[charityId][milestoneId] = Milestone({
            id: milestoneId,
            charityId: charityId,
            amount: amount,
            completed: false
        });
    }
    
    function donate(uint256 charityId) external payable {
        require(charities[charityId].exists, "Charity does not exist");
        require(msg.value > 0, "Donation amount must be greater than 0");
        
        charityBalances[charityId] += msg.value;
        charities[charityId].totalDonations += msg.value;
        
        emit DonationMade(charityId, msg.sender, msg.value, block.timestamp);
    }
    
    function verifyMilestone(uint256 charityId, uint256 milestoneId) external onlyOwner {
        require(charities[charityId].exists, "Charity does not exist");
        require(!milestones[charityId][milestoneId].completed, "Milestone already completed");
        
        Milestone storage milestone = milestones[charityId][milestoneId];
        Charity storage charity = charities[charityId];
        
        require(charityBalances[charityId] >= milestone.amount, "Insufficient funds for milestone");
        
        milestone.completed = true;
        charityBalances[charityId] -= milestone.amount;
        charity.releasedFunds += milestone.amount;
        
        charity.wallet.transfer(milestone.amount);
        
        emit MilestoneCompleted(charityId, milestoneId, milestone.amount, block.timestamp);
    }
    
    function getCharityBalance(uint256 charityId) external view returns (uint256) {
        require(charities[charityId].exists, "Charity does not exist");
        return charityBalances[charityId];
    }
    
    function getCharityTotalDonations(uint256 charityId) external view returns (uint256) {
        require(charities[charityId].exists, "Charity does not exist");
        return charities[charityId].totalDonations;
    }
    
    function getCharityReleasedFunds(uint256 charityId) external view returns (uint256) {
        require(charities[charityId].exists, "Charity does not exist");
        return charities[charityId].releasedFunds;
    }
    
    function isMilestoneCompleted(uint256 charityId, uint256 milestoneId) external view returns (bool) {
        require(charities[charityId].exists, "Charity does not exist");
        return milestones[charityId][milestoneId].completed;
    }
} 