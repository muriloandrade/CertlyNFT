//SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
import { ERC2771Context } from "@gelatonetwork/relay-context/contracts/vendor/ERC2771Context.sol";
import "./interfaces/ICertly_Client.sol";


contract Certly_Holder is ERC1155Holder, ERC2771Context {
    
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
        string uri;
        uint id;
    }
    mapping(bytes32 => PendingNFTs) hashesNFTs;
    mapping(address => bool) allowedClientsContracts;

    event PendingNftsRegistered(address _fromClient, uint[] _nftsIds, uint _timestamp);
    event NftsRedeemed(NFT[] _nfts, uint _timestamp);

    //Trusted Forwarder: GelatoRelay1BalanceERC2771.sol
    constructor(address trustedForwarder) ERC2771Context(trustedForwarder) {
        owner = msg.sender;
    }    

    function setMaster(address payable _master) external {
        require(msg.sender == owner, "Hld: Only owner");
        master = _master;
    }

    function registerClient(address _clientAddr) external {
        require(msg.sender == master, "Hld: Not allowed");
        allowedClientsContracts[_clientAddr] = true;
    }

    function registerPendingNfts(bytes32 _hash, uint[] memory _nftsIds) external {
        require(allowedClientsContracts[msg.sender], "Hld: Only client's contracts");
        hashesNFTs[_hash].validHash = true;
        hashesNFTs[_hash].clients.push(msg.sender);
        for (uint i = 0; i < _nftsIds.length; i++) hashesNFTs[_hash].nfts[msg.sender].push(_nftsIds[i]);
        
        emit PendingNftsRegistered(msg.sender, _nftsIds, block.timestamp);
    }

    mapping(address => NFT[]) _nfts;
    
    //Gelato's sponsored function
    function claimNFTs(bytes32 _invoiceHash, bytes32 _password) external {
        bytes32 hash_ = keccak256(abi.encodePacked(_invoiceHash, _password));
        PendingNFTs storage hashPendingNFTs = hashesNFTs[hash_];
        require(hashPendingNFTs.validHash != false, "Hld: Invalid invoice hash or password");  
        
        for(uint i = 0; i < hashPendingNFTs.clients.length; i++) {
            ICertly_Client client = ICertly_Client(hashPendingNFTs.clients[i]);

            uint[] memory nftsIds = hashPendingNFTs.nfts[address(client)];
            for (uint j = 0; j < nftsIds.length; j++) {
                NFT memory nft;
                nft.seller = address(client);
                nft.owner = _msgSender();
                nft.id = nftsIds[j];
                _nfts[_msgSender()].push(nft);
            }

            client.requestNfts(_msgSender(), nftsIds);
            delete hashPendingNFTs.nfts[address(client)];
        }        
        hashPendingNFTs.validHash = false;
        delete hashPendingNFTs.clients;
        emit NftsRedeemed(_nfts[_msgSender()], block.timestamp);
        delete _nfts[_msgSender()];
    }
}