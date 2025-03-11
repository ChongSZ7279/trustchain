// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title CharityContract
 * @dev A smart contract for managing charity donations and task funding
 */
contract CharityContract {
    address public owner;
    
    // Mapping from charity ID to its balance
    mapping(uint256 => uint256) public charityFunds;
    
    // Mapping from task ID to its balance
    mapping(uint256 => uint256) public taskFunds;
    
    // Events
    event DonationReceived(uint256 indexed charityId, address indexed donor, uint256 amount);
    event TaskFunded(uint256 indexed taskId, address indexed donor, uint256 amount);
    event TaskFundsWithdrawn(uint256 indexed taskId, address indexed recipient, uint256 amount);
    
    constructor() {
        owner = msg.sender;
    }
    
    /**
     * @dev Donate to a charity
     * @param charityId The ID of the charity to donate to
     */
    function donate(uint256 charityId) external payable {
        require(msg.value > 0, "Donation amount must be greater than 0");
        
        charityFunds[charityId] += msg.value;
        
        emit DonationReceived(charityId, msg.sender, msg.value);
    }
    
    /**
     * @dev Fund a specific task
     * @param taskId The ID of the task to fund
     */
    function fundTask(uint256 taskId) external payable {
        require(msg.value > 0, "Funding amount must be greater than 0");
        
        taskFunds[taskId] += msg.value;
        
        emit TaskFunded(taskId, msg.sender, msg.value);
    }
    
    /**
     * @dev Withdraw funds from a task
     * @param taskId The ID of the task to withdraw funds from
     * @param recipient The address to send the funds to
     */
    function withdrawTaskFunds(uint256 taskId, address payable recipient) external {
        require(msg.sender == owner, "Only the contract owner can withdraw funds");
        require(taskFunds[taskId] > 0, "No funds available for this task");
        
        uint256 amount = taskFunds[taskId];
        taskFunds[taskId] = 0;
        
        recipient.transfer(amount);
        
        emit TaskFundsWithdrawn(taskId, recipient, amount);
    }
    
    /**
     * @dev Get the balance of a charity
     * @param charityId The ID of the charity
     * @return The balance of the charity
     */
    function getCharityBalance(uint256 charityId) external view returns (uint256) {
        return charityFunds[charityId];
    }
    
    /**
     * @dev Get the balance of a task
     * @param taskId The ID of the task
     * @return The balance of the task
     */
    function getTaskBalance(uint256 taskId) external view returns (uint256) {
        return taskFunds[taskId];
    }
} 