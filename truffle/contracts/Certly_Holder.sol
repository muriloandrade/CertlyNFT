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

    struct NFT {
        address seller;
        address owner;
        uint id;
    }
    mapping(bytes32 => PendingNFTs) hashesNFTs;
    mapping(address => bool) allowedClientsContracts;

    event PendingNftRegistered(address _fromClient, uint _nftId, uint _timestamp);
    event NftsClaimed(NFT[] _nfts, uint _timestamp);

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
        
        emit PendingNftRegistered(msg.sender, _nftId, block.timestamp);
    }

    mapping(address => NFT[]) _nfts;
    function claimNFTs(uint _invoiceHash, uint _password) external {        
        bytes32 hash_ = keccak256(abi.encodePacked(_invoiceHash, _password));
        PendingNFTs storage hashPendingNFTs = hashesNFTs[hash_];
        require(hashPendingNFTs.validHash != false, "Invalid invoice hash or password");  
        
        for(uint i = 0; i < hashPendingNFTs.clients.length; i++) {            
            ICertly_Client client = ICertly_Client(hashPendingNFTs.clients[i]);

            uint[] memory nftIds = hashPendingNFTs.nfts[address(client)];
            for (uint j = 0; j < nftIds.length; j++) {
                NFT memory nft;
                nft.seller = address(client);
                nft.owner = msg.sender;
                nft.id = nftIds[j];
                _nfts[msg.sender].push(nft);
            }

            client.requestNfts(msg.sender, nftIds);            
            delete hashPendingNFTs.nfts[address(client)];
        }        
        hashPendingNFTs.validHash = false;
        delete hashPendingNFTs.clients;
        emit NftsClaimed(_nfts[msg.sender], block.timestamp);
        delete _nfts[msg.sender];
    }
}