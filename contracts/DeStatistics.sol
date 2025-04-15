// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract DeStatistics {
    address public owner;

    mapping(address => uint256) public uploaders;
    mapping(address => uint256) public interactions;

    modifier onlyOwner() {
        require(msg.sender == owner, "Caller is not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    // 10% to the Platform and 90% to the uploader

    function donation(address receiver) public payable {
        require(msg.value > 0, "You must send > 0 ETH");
        uploaders[receiver] += msg.value;
        (bool success, ) = receiver.call{value: (msg.value * 90) / 100}("");
        require(success, "Failed to transfer funds");
    }

    function interact(address bucket) public payable {
        require(msg.value > 0, "You must send > 0 ETH");
        interactions[bucket] += 1;
    }

    // Owner Control

    function changeOwner(address newOwner) public onlyOwner {
        owner = newOwner;
    }

    // Garbage Collection and Fallbacks

    /**
     * @dev Allows the owner to withdraw the contract's balance, if necessary, because the contract balance is not used.
     */
    function garbage() public payable onlyOwner {
        payable(owner).transfer(address(this).balance);
    }

    receive() external payable {} // Recieve Payments

    fallback() external payable {} // Recieve Payments if recieve doesn't work
}
