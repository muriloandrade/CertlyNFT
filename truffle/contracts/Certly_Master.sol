//SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";

interface ICertly_ClientFactory {
  function createNewClient(string memory _uri, address _owner) external returns(address); 
}

interface ICertly_Client {
    function nftClaimed(bytes32 _hash ,address _toAccount) external;
}

interface ICertly_Holder {
    function registerClient(address _clientAddr) external;
}

contract Certly_Master is Ownable {
    uint256 public mintPrice = 10;
    ICertly_ClientFactory private clientFactory;
    ICertly_Holder private holder;

    struct Client {
        bool allowed;
        uint256 contractsCount;
        mapping(uint256 => address) contracts;
    }

    mapping(address => Client) clients;
    mapping(bytes32 => address) pendingNfts;
    mapping(address => bool) activeContracts;

    string[] uris = ["0"];

    event ClientContractCreated(
        address indexed client,
        address indexed contractAddress,
        uint index,
        uint timestamp
    );
    event MintPriceUpdated(uint previousPrice, uint newPrice, uint timestamp);
    event PendingNftRegistered(bytes32 hash, address client);

     modifier onlyClient {
        require(activeContracts[msg.sender], "Only from client's contracts");
        _;
    }

    constructor(address _clientFactoryAddr, address _holderAddr) {
      clientFactory = ICertly_ClientFactory(_clientFactoryAddr);
      holder = ICertly_Holder(_holderAddr);
    }

    receive() external payable onlyClient {}
    
    function withdraw(address payable _to, uint _value) external onlyOwner {
        require(
            address(this).balance >= _value,
            "The value requested exceeds the balance"
        );
        _to.transfer(_value);
    }

    function getBalance() external view onlyOwner returns (uint) {
        return address(this).balance;
    }

    function getActiveContract(address _addr) external view returns (bool) {
        return activeContracts[_addr];
    }

    function setMintPrice(uint256 _value) external onlyOwner {
        uint prev = mintPrice;
        mintPrice = _value;
        emit MintPriceUpdated(prev, _value, block.timestamp);
    }

    function getMintPrice() external view returns(uint) {
        return mintPrice;
    }

    function createContract(string calldata _uri) external {
        require(validateUri(_uri));
        clients[msg.sender].allowed = true;
        address newClientAddr = clientFactory.createNewClient(_uri, msg.sender);
        Client storage client = clients[msg.sender];
        client.contracts[client.contractsCount] = newClientAddr;
        activeContracts[newClientAddr] = true;
        emit ClientContractCreated(
            msg.sender,
            newClientAddr,
            client.contractsCount,
            block.timestamp
        );
        uris.push(_uri);
        holder.registerClient(newClientAddr);
        client.contractsCount++;
    }

    function validateUri(string calldata _uri) private view returns(bool) {
        require(uriExists(_uri) == 0, "URI already exists");
        uint uriLen = strlen(_uri);
        require(
            uriLen > 11 && sameStrings(_uri[uriLen - 10:], "/{id}.json"),
            "URI malformed. Must end with /{id}.json"
        );
        return true;    
    }

    function updateUri(string memory _prevUri, string calldata _uri) external onlyClient {
        require(validateUri(_uri));        
        uint prevIndex = uriExists(_prevUri);
        require(prevIndex > 0, "Previous URI not found");
        uris[prevIndex] = _uri;
    }

    function uriExists(string memory _uri) internal view returns (uint) {
        bool found = false;
        uint i;
        for (i = 0; i < uris.length && !found; i++) {
            if (sameStrings(uris[i], _uri)) {
                found = true;
                break;
            }
        }
        return found ? i : 0;
    }

    function sameStrings(
        string memory s1,
        string memory s2
    ) internal pure returns (bool same) {
        same =
            keccak256(abi.encodePacked(s1)) == keccak256(abi.encodePacked(s2));
        return same;
    }

    function getContractById(uint _id) external view returns (address) {
        require(
            clients[msg.sender].contracts[_id] != address(0),
            "Contract not found"
        );
        return clients[msg.sender].contracts[_id];
    }

    function strlen(string memory s) internal pure returns (uint256) {
        uint256 len;
        uint256 i = 0;
        uint256 bytelength = bytes(s).length;
        for (len = 0; i < bytelength; len++) {
            bytes1 b = bytes(s)[i];
            if (b < 0x80) {
                i += 1;
            } else if (b < 0xE0) {
                i += 2;
            } else if (b < 0xF0) {
                i += 3;
            } else if (b < 0xF8) {
                i += 4;
            } else if (b < 0xFC) {
                i += 5;
            } else {
                i += 6;
            }
        }
        return len;
    }
}