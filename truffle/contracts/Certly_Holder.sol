//SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";

interface ICertly_Client {
    function requestNfts(address _to, uint[] memory _ids) external;
}

contract Certly_Holder is ERC1155Holder {
    
    address owner;
    address master;

    struct PendingNFTs {
        bool validHash;
        address[] clients;
        mapping(address => uint[]) nfts;
    }
    mapping(bytes32 => PendingNFTs) hashesNFTs;

    mapping(address => bool) allowedClientsContracts;

    constructor() {
        owner = msg.sender;
    }    

    function setMaster(address payable _master) external {
        require(msg.sender == owner, "Only owner");
        master = _master;
    }

    function registerClient(address _clientAddr) external {
        require(msg.sender == master, "Not allowed");
        allowedClientsContracts[_clientAddr] = true;
    }

    
    function registerPendingNft(bytes32 _hash, uint _nftId) external {
        require(allowedClientsContracts[msg.sender], "Only client's contracts");
        hashesNFTs[_hash].validHash = true;
        hashesNFTs[_hash].clients.push(msg.sender);
        hashesNFTs[_hash].nfts[msg.sender].push(_nftId);

    }

    function claimNFTs(uint _invoiceHash, uint _password) external {        
        bytes32 hash_ = keccak256(abi.encodePacked(_invoiceHash, _password));
        PendingNFTs storage hashPendingNFTs = hashesNFTs[hash_];
        require(hashPendingNFTs.validHash != false, "Invalid invoice hash or password");        
        
        for(uint i = 0; i < hashPendingNFTs.clients.length; i++) {            
            ICertly_Client client = ICertly_Client(hashPendingNFTs.clients[i]);
            client.requestNfts(msg.sender, hashPendingNFTs.nfts[address(client)]);
            delete hashPendingNFTs.nfts[address(client)];
        }        
        hashPendingNFTs.validHash = false;
        delete hashPendingNFTs.clients;
    }
}