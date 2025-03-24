// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title Donation Contract
 * @dev A contract that allows users to make donations and transactions
 */
contract DonationContract {
    address public owner;
    
    // Structure to store donation information
    struct Donation {
        address donor;
        uint256 amount;
        uint256 timestamp;
        string message;
    }
    
    // Structure to store transaction information
    struct Transaction {
        address sender;
        address recipient;
        uint256 amount;
        uint256 timestamp;
        string description;
    }
    
    // Array to store all donations
    Donation[] public donations;
    
    // Array to store all transactions
    Transaction[] public transactions;
    
    // Mapping to track total donation amount by donor
    mapping(address => uint256) public donorTotalAmount;
    
    // Mapping to track total transactions by address (sent)
    mapping(address => uint256) public senderTotalAmount;
    
    // Mapping to track total transactions by address (received)
    mapping(address => uint256) public recipientTotalAmount;
    
    // Events
    event DonationReceived(address indexed donor, uint256 amount, string message);
    event TransactionExecuted(address indexed sender, address indexed recipient, uint256 amount, string description);
    event FundsWithdrawn(address indexed to, uint256 amount);
    
    // Modifier to restrict access to owner
    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call this function");
        _;
    }
    
    /**
     * @dev Constructor sets the owner to the deployer of the contract
     */
    constructor() {
        owner = msg.sender;
    }
    
    /**
     * @dev Make a donation with an optional message
     * @param message A message from the donor
     */
    function donate(string memory message) external payable {
        require(msg.value > 0, "Donation amount must be greater than 0");
        // Just emit an event for now
        emit DonationReceived(msg.sender, msg.value, message);
    }
    
    /**
     * @dev Execute a transaction to send funds to a recipient
     * @param recipient The address of the recipient
     * @param description A description of the transaction
     */
    function executeTransaction(address payable recipient, string memory description) external payable {
        require(msg.value > 0, "Transaction amount must be greater than 0");
        require(recipient != address(0), "Cannot send to zero address");
        
        // Record the transaction
        transactions.push(Transaction({
            sender: msg.sender,
            recipient: recipient,
            amount: msg.value,
            timestamp: block.timestamp,
            description: description
        }));
        
        // Update sender's and recipient's totals
        senderTotalAmount[msg.sender] += msg.value;
        recipientTotalAmount[recipient] += msg.value;
        
        // Transfer funds to recipient
        (bool success, ) = recipient.call{value: msg.value}("");
        require(success, "Transfer failed");
        
        // Emit event
        emit TransactionExecuted(msg.sender, recipient, msg.value, description);
    }
    
    /**
     * @dev Withdraw funds from the contract (only owner)
     * @param to The address to send the funds to
     * @param amount The amount to withdraw
     */
    function withdraw(address payable to, uint256 amount) external onlyOwner {
        require(amount > 0, "Withdrawal amount must be greater than 0");
        require(amount <= address(this).balance, "Insufficient contract balance");
        
        // Transfer funds
        (bool success, ) = to.call{value: amount}("");
        require(success, "Transfer failed");
        
        // Emit event
        emit FundsWithdrawn(to, amount);
    }
    
    /**
     * @dev Get the total number of donations
     * @return The number of donations
     */
    function getDonationCount() external view returns (uint256) {
        return donations.length;
    }
    
    /**
     * @dev Get the total number of transactions
     * @return The number of transactions
     */
    function getTransactionCount() external view returns (uint256) {
        return transactions.length;
    }
    
    /**
     * @dev Get donation details by index
     * @param index The index of the donation
     * @return donor The address of the donor
     * @return amount The donation amount
     * @return timestamp The timestamp of the donation
     * @return message The donation message
     */
    function getDonationDetails(uint256 index) external view returns (
        address donor,
        uint256 amount,
        uint256 timestamp,
        string memory message
    ) {
        require(index < donations.length, "Donation index out of bounds");
        Donation storage donation = donations[index];
        return (donation.donor, donation.amount, donation.timestamp, donation.message);
    }
    
    /**
     * @dev Get transaction details by index
     * @param index The index of the transaction
     * @return sender The address of the sender
     * @return recipient The address of the recipient
     * @return amount The transaction amount
     * @return timestamp The timestamp of the transaction
     * @return description The transaction description
     */
    function getTransactionDetails(uint256 index) external view returns (
        address sender,
        address recipient,
        uint256 amount,
        uint256 timestamp,
        string memory description
    ) {
        require(index < transactions.length, "Transaction index out of bounds");
        Transaction storage txn = transactions[index];
        return (txn.sender, txn.recipient, txn.amount, txn.timestamp, txn.description);
    }
    
    /**
     * @dev Get the contract balance
     * @return The balance of the contract
     */
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    /**
     * @dev Get all donations by a specific donor
     * @param donor The address of the donor
     * @return indices The indices of the donations made by the donor
     */
    function getDonationsByDonor(address donor) external view returns (uint256[] memory) {
        uint256 count = 0;
        
        // Count donations by this donor
        for (uint256 i = 0; i < donations.length; i++) {
            if (donations[i].donor == donor) {
                count++;
            }
        }
        
        // Create array of indices
        uint256[] memory indices = new uint256[](count);
        uint256 currentIndex = 0;
        
        // Fill array with indices
        for (uint256 i = 0; i < donations.length; i++) {
            if (donations[i].donor == donor) {
                indices[currentIndex] = i;
                currentIndex++;
            }
        }
        
        return indices;
    }
    
    /**
     * @dev Get all transactions by a specific sender
     * @param sender The address of the sender
     * @return indices The indices of the transactions made by the sender
     */
    function getTransactionsBySender(address sender) external view returns (uint256[] memory) {
        uint256 count = 0;
        
        // Count transactions by this sender
        for (uint256 i = 0; i < transactions.length; i++) {
            if (transactions[i].sender == sender) {
                count++;
            }
        }
        
        // Create array of indices
        uint256[] memory indices = new uint256[](count);
        uint256 currentIndex = 0;
        
        // Fill array with indices
        for (uint256 i = 0; i < transactions.length; i++) {
            if (transactions[i].sender == sender) {
                indices[currentIndex] = i;
                currentIndex++;
            }
        }
        
        return indices;
    }
    
    /**
     * @dev Get all transactions to a specific recipient
     * @param recipient The address of the recipient
     * @return indices The indices of the transactions to the recipient
     */
    function getTransactionsByRecipient(address recipient) external view returns (uint256[] memory) {
        uint256 count = 0;
        
        // Count transactions to this recipient
        for (uint256 i = 0; i < transactions.length; i++) {
            if (transactions[i].recipient == recipient) {
                count++;
            }
        }
        
        // Create array of indices
        uint256[] memory indices = new uint256[](count);
        uint256 currentIndex = 0;
        
        // Fill array with indices
        for (uint256 i = 0; i < transactions.length; i++) {
            if (transactions[i].recipient == recipient) {
                indices[currentIndex] = i;
                currentIndex++;
            }
        }
        
        return indices;
    }
    
    /**
     * @dev Change the owner of the contract
     * @param newOwner The address of the new owner
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "New owner cannot be the zero address");
        owner = newOwner;
    }
    
    // Fallback function to accept ETH
    receive() external payable {
        // Record as a donation with empty message
        donations.push(Donation({
            donor: msg.sender,
            amount: msg.value,
            timestamp: block.timestamp,
            message: ""
        }));
        
        // Update donor's total
        donorTotalAmount[msg.sender] += msg.value;
        
        // Emit event
        emit DonationReceived(msg.sender, msg.value, "");
    }
    
    /**
     * @dev Get donations within a specific range
     * @param startIndex The starting index
     * @param count The number of donations to retrieve
     * @return donors Array of donor addresses
     * @return amounts Array of donation amounts
     * @return timestamps Array of donation timestamps
     * @return messages Array of donation messages
     */
    function getDonationBatch(uint256 startIndex, uint256 count) external view returns (
        address[] memory donors,
        uint256[] memory amounts,
        uint256[] memory timestamps,
        string[] memory messages
    ) {
        // Ensure we don't go out of bounds
        uint256 endIndex = startIndex + count;
        if (endIndex > donations.length) {
            endIndex = donations.length;
        }
        
        // Calculate actual count
        uint256 actualCount = endIndex - startIndex;
        
        // Initialize return arrays
        donors = new address[](actualCount);
        amounts = new uint256[](actualCount);
        timestamps = new uint256[](actualCount);
        messages = new string[](actualCount);
        
        // Fill arrays with donation data
        for (uint256 i = 0; i < actualCount; i++) {
            Donation storage donation = donations[startIndex + i];
            donors[i] = donation.donor;
            amounts[i] = donation.amount;
            timestamps[i] = donation.timestamp;
            messages[i] = donation.message;
        }
        
        return (donors, amounts, timestamps, messages);
    }
    
    /**
     * @dev Get transactions within a specific range
     * @param startIndex The starting index
     * @param count The number of transactions to retrieve
     * @return senders Array of sender addresses
     * @return recipients Array of recipient addresses
     * @return amounts Array of transaction amounts
     * @return timestamps Array of transaction timestamps
     * @return descriptions Array of transaction descriptions
     */
    function getTransactionBatch(uint256 startIndex, uint256 count) external view returns (
        address[] memory senders,
        address[] memory recipients,
        uint256[] memory amounts,
        uint256[] memory timestamps,
        string[] memory descriptions
    ) {
        // Ensure we don't go out of bounds
        uint256 endIndex = startIndex + count;
        if (endIndex > transactions.length) {
            endIndex = transactions.length;
        }
        
        // Calculate actual count
        uint256 actualCount = endIndex - startIndex;
        
        // Initialize return arrays
        senders = new address[](actualCount);
        recipients = new address[](actualCount);
        amounts = new uint256[](actualCount);
        timestamps = new uint256[](actualCount);
        descriptions = new string[](actualCount);
        
        // Fill arrays with transaction data
        for (uint256 i = 0; i < actualCount; i++) {
            Transaction storage txn = transactions[startIndex + i];
            senders[i] = txn.sender;
            recipients[i] = txn.recipient;
            amounts[i] = txn.amount;
            timestamps[i] = txn.timestamp;
            descriptions[i] = txn.description;
        }
        
        return (senders, recipients, amounts, timestamps, descriptions);
    }
    
    /**
     * @dev Donate to a specific charity
     * @param charityId The ID of the charity (can be used in your frontend)
     * @param message A message from the donor
     */
    function donateToCharity(uint256 charityId, string memory message) external payable {
        require(msg.value > 0, "Donation amount must be greater than 0");
        
        // Record the donation with charity ID in the message
        // This is a simple way to associate donations with charities
        // In a more complex system, you might want to store charity IDs separately
        string memory fullMessage = string(abi.encodePacked(
            "Charity ID: ", 
            _uintToString(charityId), 
            " | Message: ", 
            message
        ));
        
        // Record the donation
        donations.push(Donation({
            donor: msg.sender,
            amount: msg.value,
            timestamp: block.timestamp,
            message: fullMessage
        }));
        
        // Update donor's total
        donorTotalAmount[msg.sender] += msg.value;
        
        // Emit event
        emit DonationReceived(msg.sender, msg.value, fullMessage);
    }
    
    /**
     * @dev Helper function to convert uint to string
     * @param v The uint value to convert
     * @return The string representation
     */
    function _uintToString(uint256 v) internal pure returns (string memory) {
        if (v == 0) {
            return "0";
        }
        
        uint256 maxlength = 100;
        bytes memory reversed = new bytes(maxlength);
        uint256 i = 0;
        while (v != 0) {
            uint256 remainder = v % 10;
            v = v / 10;
            reversed[i++] = bytes1(uint8(48 + remainder));
        }
        
        bytes memory s = new bytes(i);
        for (uint256 j = 0; j < i; j++) {
            s[j] = reversed[i - 1 - j];
        }
        
        return string(s);
    }
}