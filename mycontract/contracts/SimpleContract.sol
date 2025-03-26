// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SimpleContract {
    address public owner;
    
    constructor() {
        owner = msg.sender;
    }
    
    function donate() external payable {
        // Just accept the payment
    }
    
    function getOwner() external view returns (address) {
        return owner;
    }
} 