//SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

import "./Certly_Client.sol";

contract Certly_ClientFactory {
    
    address owner;
    address payable master;
    address holder;

    constructor(address _holder) {
        owner = msg.sender;
        holder = _holder;
    }

    function createNewClient(string memory _uri, string memory _baseURI, address _owner)
        external
        returns (address)
    {
        require(msg.sender == master, "Fct: Only master");
        Certly_Client newClient = new Certly_Client(master, holder, _uri, _baseURI, _owner);
        return address(newClient);
    }

    function setMaster(address payable _master) external {
        require(msg.sender == owner, "Fct: Not allowed");
        master = _master;
    }
}
