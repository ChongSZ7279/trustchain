// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title CharityContract
 * @dev A smart contract for managing charity donations and task funding with milestone-based distribution
 */
contract CharityContract {
    address public owner;
    
    // Mapping from charity ID to its balance
    mapping(uint256 => uint256) public charityFunds;
    
    // Mapping from task ID to its balance
    mapping(uint256 => uint256) public taskFunds;
    
    // Mapping from task ID to its milestones
    mapping(uint256 => Milestone[]) public taskMilestones;
    
    // Mapping from donor address to their total donation amount
    mapping(address => uint256) public donorTotalAmount;
    
    // Mapping from charity ID to its donors
    mapping(uint256 => address[]) public charityDonors;
    
    // Mapping to track if an address is already in the donors list for a charity
    mapping(uint256 => mapping(address => bool)) private isDonorAdded;
    
    // Struct to represent a milestone
    struct Milestone {
        string description;
        uint256 amount;
        bool completed;
        bool fundsReleased;
    }
    
    // Events
    event DonationReceived(uint256 indexed charityId, address indexed donor, uint256 amount, uint256 timestamp);
    event TaskFunded(uint256 indexed taskId, address indexed donor, uint256 amount, uint256 timestamp);
    event MilestoneAdded(uint256 indexed taskId, string description, uint256 amount);
    event MilestoneCompleted(uint256 indexed taskId, uint256 milestoneIndex);
    event MilestoneFundsReleased(uint256 indexed taskId, uint256 milestoneIndex, address recipient, uint256 amount);
    event TaskFundsWithdrawn(uint256 indexed taskId, address indexed recipient, uint256 amount);
    
    constructor() {
        owner = msg.sender;
    }
    
    /**
     * @dev Modifier to restrict function access to the contract owner
     */
    modifier onlyOwner() {
        require(msg.sender == owner, "Only the contract owner can call this function");
        _;
    }
    
    /**
     * @dev Donate to a charity
     * @param charityId The ID of the charity to donate to
     */
    function donate(uint256 charityId) external payable {
        require(msg.value > 0, "Donation amount must be greater than 0");
        
        charityFunds[charityId] += msg.value;
        donorTotalAmount[msg.sender] += msg.value;
        
        // Add donor to the charity's donor list if not already added
        if (!isDonorAdded[charityId][msg.sender]) {
            charityDonors[charityId].push(msg.sender);
            isDonorAdded[charityId][msg.sender] = true;
        }
        
        emit DonationReceived(charityId, msg.sender, msg.value, block.timestamp);
    }
    
    /**
     * @dev Fund a specific task
     * @param taskId The ID of the task to fund
     */
    function fundTask(uint256 taskId) external payable {
        require(msg.value > 0, "Funding amount must be greater than 0");
        
        taskFunds[taskId] += msg.value;
        donorTotalAmount[msg.sender] += msg.value;
        
        emit TaskFunded(taskId, msg.sender, msg.value, block.timestamp);
    }
    
    /**
     * @dev Add a milestone to a task
     * @param taskId The ID of the task
     * @param description The description of the milestone
     * @param amount The amount of funds to be released upon completion
     */
    function addMilestone(uint256 taskId, string calldata description, uint256 amount) external onlyOwner {
        require(bytes(description).length > 0, "Description cannot be empty");
        require(amount > 0, "Amount must be greater than 0");
        
        taskMilestones[taskId].push(Milestone({
            description: description,
            amount: amount,
            completed: false,
            fundsReleased: false
        }));
        
        emit MilestoneAdded(taskId, description, amount);
    }
    
    /**
     * @dev Mark a milestone as completed
     * @param taskId The ID of the task
     * @param milestoneIndex The index of the milestone
     */
    function completeMilestone(uint256 taskId, uint256 milestoneIndex) external onlyOwner {
        require(milestoneIndex < taskMilestones[taskId].length, "Milestone does not exist");
        require(!taskMilestones[taskId][milestoneIndex].completed, "Milestone already completed");
        
        taskMilestones[taskId][milestoneIndex].completed = true;
        
        emit MilestoneCompleted(taskId, milestoneIndex);
    }
    
    /**
     * @dev Release funds for a completed milestone
     * @param taskId The ID of the task
     * @param milestoneIndex The index of the milestone
     * @param recipient The address to send the funds to
     */
    function releaseMilestoneFunds(uint256 taskId, uint256 milestoneIndex, address payable recipient) external onlyOwner {
        require(milestoneIndex < taskMilestones[taskId].length, "Milestone does not exist");
        require(taskMilestones[taskId][milestoneIndex].completed, "Milestone not completed");
        require(!taskMilestones[taskId][milestoneIndex].fundsReleased, "Funds already released");
        require(taskFunds[taskId] >= taskMilestones[taskId][milestoneIndex].amount, "Insufficient funds");
        
        uint256 amount = taskMilestones[taskId][milestoneIndex].amount;
        taskFunds[taskId] -= amount;
        taskMilestones[taskId][milestoneIndex].fundsReleased = true;
        
        recipient.transfer(amount);
        
        emit MilestoneFundsReleased(taskId, milestoneIndex, recipient, amount);
    }
    
    /**
     * @dev Withdraw funds from a task (for non-milestone-based tasks)
     * @param taskId The ID of the task to withdraw funds from
     * @param recipient The address to send the funds to
     */
    function withdrawTaskFunds(uint256 taskId, address payable recipient) external onlyOwner {
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
    
    /**
     * @dev Get the total donation amount of a donor
     * @param donor The address of the donor
     * @return The total donation amount
     */
    function getDonorTotalAmount(address donor) external view returns (uint256) {
        return donorTotalAmount[donor];
    }
    
    /**
     * @dev Get the number of milestones for a task
     * @param taskId The ID of the task
     * @return The number of milestones
     */
    function getMilestoneCount(uint256 taskId) external view returns (uint256) {
        return taskMilestones[taskId].length;
    }
    
    /**
     * @dev Get milestone details
     * @param taskId The ID of the task
     * @param milestoneIndex The index of the milestone
     * @return description The description of the milestone
     * @return amount The amount of funds to be released
     * @return completed Whether the milestone is completed
     * @return fundsReleased Whether the funds have been released
     */
    function getMilestone(uint256 taskId, uint256 milestoneIndex) external view returns (
        string memory description,
        uint256 amount,
        bool completed,
        bool fundsReleased
    ) {
        require(milestoneIndex < taskMilestones[taskId].length, "Milestone does not exist");
        
        Milestone memory milestone = taskMilestones[taskId][milestoneIndex];
        return (
            milestone.description,
            milestone.amount,
            milestone.completed,
            milestone.fundsReleased
        );
    }
    
    /**
     * @dev Get the number of donors for a charity
     * @param charityId The ID of the charity
     * @return The number of donors
     */
    function getDonorCount(uint256 charityId) external view returns (uint256) {
        return charityDonors[charityId].length;
    }
    
    /**
     * @dev Get a donor address by index for a charity
     * @param charityId The ID of the charity
     * @param index The index of the donor
     * @return The donor address
     */
    function getDonorByIndex(uint256 charityId, uint256 index) external view returns (address) {
        require(index < charityDonors[charityId].length, "Donor index out of bounds");
        return charityDonors[charityId][index];
    }
} 