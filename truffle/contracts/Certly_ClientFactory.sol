//SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

import "./Certly_Client.sol";

contract Certly_ClientFactory {
    
    address owner;
    address payable master;

    constructor() {
        owner = msg.sender;
    }

    function createNewClient(string memory _uri, address _owner)
        external
        returns (address)
    {
        require(msg.sender == master, "Only master");
        Certly_Client newClient = new Certly_Client(_uri, master, _owner);
        return address(newClient);
    }

    function setMaster(address payable _master) external {
        require(msg.sender == owner, "Only owner");
        master = _master;
    }
}
