// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title CharityContract
 * @dev A smart contract for managing charity donations and task funding with milestone-based distribution
 */
contract CharityContract is ReentrancyGuard, Ownable, Pausable {
    // State variables
    mapping(uint256 => uint256) public charityFunds;
    mapping(uint256 => uint256) public taskFunds;
    mapping(uint256 => Milestone[]) public taskMilestones;
    mapping(address => uint256) public donorTotalAmount;
    mapping(uint256 => address[]) public charityDonors;
    mapping(uint256 => mapping(address => bool)) private isDonorAdded;
    mapping(uint256 => address) public charityOwners;
    
    uint256 public constant PLATFORM_FEE = 1; // 1% platform fee
    address public feeCollector;
    uint256 public minDonationAmount = 0.001 ether;
    
    // Struct definitions
    struct Milestone {
        string description;
        uint256 amount;
        bool completed;
        bool fundsReleased;
        uint256 deadline;
        bytes32 proofHash;
    }
    
    // Events
    event DonationReceived(
        uint256 indexed charityId, 
        address indexed donor, 
        uint256 amount, 
        uint256 platformFee,
        uint256 timestamp
    );
    event TaskFunded(
        uint256 indexed taskId, 
        address indexed donor, 
        uint256 amount, 
        uint256 platformFee,
        uint256 timestamp
    );
    event MilestoneAdded(
        uint256 indexed taskId, 
        string description, 
        uint256 amount, 
        uint256 deadline
    );
    event MilestoneCompleted(
        uint256 indexed taskId, 
        uint256 milestoneIndex, 
        bytes32 proofHash
    );
    event MilestoneFundsReleased(
        uint256 indexed taskId, 
        uint256 milestoneIndex, 
        address recipient, 
        uint256 amount
    );
    event CharityRegistered(uint256 indexed charityId, address owner);
    event MinDonationAmountUpdated(uint256 newAmount);
    event FeeCollectorUpdated(address newCollector);
    
    // Constructor
    constructor(address _feeCollector) {
        feeCollector = _feeCollector;
    }
    
    // Modifiers
    modifier onlyCharityOwner(uint256 charityId) {
        require(charityOwners[charityId] == msg.sender, "Not charity owner");
        _;
    }
    
    modifier validAmount() {
        require(msg.value >= minDonationAmount, "Amount below minimum");
        _;
    }
    
    // External/Public functions
    function donate(uint256 charityId) external payable whenNotPaused nonReentrant validAmount {
        require(charityOwners[charityId] != address(0), "Charity not registered");
        
        uint256 fee = (msg.value * PLATFORM_FEE) / 100;
        uint256 donationAmount = msg.value - fee;
        
        // Transfer platform fee
        (bool feeSuccess,) = feeCollector.call{value: fee}("");
        require(feeSuccess, "Fee transfer failed");
        
        // Update state
        charityFunds[charityId] += donationAmount;
        donorTotalAmount[msg.sender] += donationAmount;
        
        if (!isDonorAdded[charityId][msg.sender]) {
            charityDonors[charityId].push(msg.sender);
            isDonorAdded[charityId][msg.sender] = true;
        }
        
        emit DonationReceived(charityId, msg.sender, donationAmount, fee, block.timestamp);
    }
    
    function fundTask(uint256 taskId) external payable whenNotPaused nonReentrant validAmount {
        uint256 fee = (msg.value * PLATFORM_FEE) / 100;
        uint256 fundingAmount = msg.value - fee;
        
        // Transfer platform fee
        (bool feeSuccess,) = feeCollector.call{value: fee}("");
        require(feeSuccess, "Fee transfer failed");
        
        taskFunds[taskId] += fundingAmount;
        donorTotalAmount[msg.sender] += fundingAmount;
        
        emit TaskFunded(taskId, msg.sender, fundingAmount, fee, block.timestamp);
    }
    
    function addMilestone(
        uint256 taskId,
        string calldata description,
        uint256 amount,
        uint256 deadline
    ) external onlyCharityOwner(taskId) {
        require(bytes(description).length > 0, "Empty description");
        require(amount > 0, "Invalid amount");
        require(deadline > block.timestamp, "Invalid deadline");
        
        taskMilestones[taskId].push(Milestone({
            description: description,
            amount: amount,
            completed: false,
            fundsReleased: false,
            deadline: deadline,
            proofHash: bytes32(0)
        }));
        
        emit MilestoneAdded(taskId, description, amount, deadline);
    }
    
    function completeMilestone(
        uint256 taskId,
        uint256 milestoneIndex,
        bytes32 proofHash
    ) external onlyCharityOwner(taskId) {
        require(milestoneIndex < taskMilestones[taskId].length, "Invalid milestone");
        Milestone storage milestone = taskMilestones[taskId][milestoneIndex];
        
        require(!milestone.completed, "Already completed");
        require(block.timestamp <= milestone.deadline, "Milestone expired");
        require(proofHash != bytes32(0), "Invalid proof");
        
        milestone.completed = true;
        milestone.proofHash = proofHash;
        
        emit MilestoneCompleted(taskId, milestoneIndex, proofHash);
    }
    
    function releaseMilestoneFunds(
        uint256 taskId,
        uint256 milestoneIndex,
        address payable recipient
    ) external onlyOwner nonReentrant {
        require(milestoneIndex < taskMilestones[taskId].length, "Invalid milestone");
        Milestone storage milestone = taskMilestones[taskId][milestoneIndex];
        
        require(milestone.completed, "Not completed");
        require(!milestone.fundsReleased, "Already released");
        require(taskFunds[taskId] >= milestone.amount, "Insufficient funds");
        
        milestone.fundsReleased = true;
        taskFunds[taskId] -= milestone.amount;
        
        (bool success,) = recipient.call{value: milestone.amount}("");
        require(success, "Transfer failed");
        
        emit MilestoneFundsReleased(taskId, milestoneIndex, recipient, milestone.amount);
    }
    
    // Admin functions
    function registerCharity(uint256 charityId, address owner) external onlyOwner {
        require(charityOwners[charityId] == address(0), "Already registered");
        require(owner != address(0), "Invalid owner");
        
        charityOwners[charityId] = owner;
        emit CharityRegistered(charityId, owner);
    }
    
    function updateMinDonationAmount(uint256 newAmount) external onlyOwner {
        minDonationAmount = newAmount;
        emit MinDonationAmountUpdated(newAmount);
    }
    
    function updateFeeCollector(address newCollector) external onlyOwner {
        require(newCollector != address(0), "Invalid address");
        feeCollector = newCollector;
        emit FeeCollectorUpdated(newCollector);
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    // View functions
    function getCharityBalance(uint256 charityId) external view returns (uint256) {
        return charityFunds[charityId];
    }
    
    function getTaskBalance(uint256 taskId) external view returns (uint256) {
        return taskFunds[taskId];
    }
    
    function getDonorTotalAmount(address donor) external view returns (uint256) {
        return donorTotalAmount[donor];
    }
    
    function getMilestoneCount(uint256 taskId) external view returns (uint256) {
        return taskMilestones[taskId].length;
    }
    
    function getMilestone(uint256 taskId, uint256 milestoneIndex) external view returns (
        string memory description,
        uint256 amount,
        bool completed,
        bool fundsReleased,
        uint256 deadline,
        bytes32 proofHash
    ) {
        require(milestoneIndex < taskMilestones[taskId].length, "Invalid milestone");
        Milestone storage milestone = taskMilestones[taskId][milestoneIndex];
        return (
            milestone.description,
            milestone.amount,
            milestone.completed,
            milestone.fundsReleased,
            milestone.deadline,
            milestone.proofHash
        );
    }
    
    function getDonorCount(uint256 charityId) external view returns (uint256) {
        return charityDonors[charityId].length;
    }
    
    function getDonorByIndex(uint256 charityId, uint256 index) external view returns (address) {
        require(index < charityDonors[charityId].length, "Index out of bounds");
        return charityDonors[charityId][index];
    }
    
    // Emergency functions
    function emergencyWithdraw(address payable recipient) external onlyOwner {
        require(recipient != address(0), "Invalid recipient");
        uint256 balance = address(this).balance;
        (bool success,) = recipient.call{value: balance}("");
        require(success, "Transfer failed");
    }
} 