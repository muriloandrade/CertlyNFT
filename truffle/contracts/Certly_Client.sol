//SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface ICertly_Master {
    function getMintPrice() external view returns (uint);
    function updateUri(string memory _prevUri, string memory _uri) external;
}

interface ICertly_Holder {
    function registerPendingNft(bytes32 _hash, uint _nftId) external;
}

contract Certly_Client is ERC1155Supply, ERC1155Burnable, Ownable {
    ICertly_Master master;
    ICertly_Holder holder;
    address masterAddr;
    uint accountBalance;

    //Token IDs: from 0 to (2^32)-1
    uint public constant MAX_TOKEN_ID = (2 ** 32) - 1;

    //NFT IDs: from (2^32) onward
    uint public constant MIN_NFT_ID = 2 ** 32;

    mapping(uint => uint) nftsPreviousTokens;
    mapping(uint => uint) nftsConversionsTimestamps;
    uint public timeToRevertNft = 1 days;
    mapping(bytes32 => uint) pendingNfts;

    event TokenConvertedToNFT(
        address tokenOwner,
        uint tokenId,
        address nftOwner,
        uint nftId,
        uint timestamp
    );
    event Withdrawn(address indexed to, uint value);
    event UriChanged(string from, string to);

    constructor(address _masterAddr, address _holderAddr, string memory _uri, address _client) ERC1155(_uri) {
        master = ICertly_Master(_masterAddr);
        holder = ICertly_Holder(_holderAddr);
        masterAddr = _masterAddr;
        _transferOwnership(_client);
    }

    receive() external payable onlyOwner {
        accountBalance += msg.value;
    }

    function withdraw(address payable _to, uint _value) external onlyOwner {
        require(
            address(this).balance >= _value,
            "The value requested exceeds the balance"
        );
        _to.transfer(_value);
        emit Withdrawn(_to, _value);
    }

    function setURI(string memory _newUri) external onlyOwner {
        master.updateUri(uri(0), _newUri);
        _setURI(_newUri);
    }

    function setTimeToRevertNft(uint _timeInDays) external onlyOwner {
        timeToRevertNft = _timeInDays * 1 days;
    }

    function mintToken(uint256 id, uint256 amount) external onlyOwner {
        require(id <= MAX_TOKEN_ID, "Token id out of range");
        uint mintPrice = master.getMintPrice();
        require(address(this).balance >= amount * mintPrice, "Not enough funds");
        payTip(mintPrice * amount);
        _mint(owner(), id, amount, "");
    }

    function mintTokenBatch(
        uint256[] memory ids,
        uint256[] memory amounts
    ) external onlyOwner {
        uint mintPrice = master.getMintPrice();
        uint totalAmount;
        for (uint i = 0; i < amounts.length; i++) {
            totalAmount += amounts[i];
        }
        require(
            address(this).balance >= totalAmount * mintPrice, "Not enough funds");

        bool ids_range_ok = true;
        for (uint i = 0; i < ids.length; i++) {
            ids_range_ok = ids[i] <= MAX_TOKEN_ID;
        }
        require(ids_range_ok, "It was passed token ID(s) out of range");

        payFee(mintPrice * totalAmount);
        _mintBatch(owner(), ids, amounts, "");
    }

    function tokenToNft(address _toAccount, uint _tokenId, uint _nftId) private {
        require(_tokenId <= MAX_TOKEN_ID, "Token ID out of range" );
        require(_nftId >= MIN_NFT_ID, "NFT ID out of range");
        require(
            balanceOf(msg.sender, _tokenId) > 0,
            "Insufficient token supply"
        );
        require(totalSupply(_nftId) == 0, "NFT already minted");
        _mint(_toAccount, _nftId, 1, "");
        burn(msg.sender, _tokenId, 1);
        nftsPreviousTokens[_nftId] = _tokenId;
        nftsConversionsTimestamps[_nftId] = block.timestamp;
        emit TokenConvertedToNFT(
            msg.sender,
            _tokenId,
            _toAccount,
            _nftId,
            block.timestamp
        );
    }

    function tokenToNftPending(uint _invoiceHash, uint _password, uint _tokenId, uint _nftId) external onlyOwner {
        bytes32 hash = keccak256(abi.encodePacked(_invoiceHash, _password));
        tokenToNft(address(holder), _tokenId, _nftId);
        pendingNfts[hash] = _nftId;
        holder.registerPendingNft(hash, _nftId);
    }

    function requestNfts(address _to, uint[] memory _ids) external {
        require(msg.sender == address(holder), "Not allowed");
        uint[] memory amounts = new uint[](_ids.length);
        for(uint i = 0; i < amounts.length; i++) amounts[i] = 1;
        safeBatchTransferFrom(msg.sender, _to, _ids, amounts, "");
    }

    function revertNft(uint _nftId) external {
        require(balanceOf(msg.sender, _nftId) > 0, "Caller is not NFT owner");
        require(
            block.timestamp <=
                nftsConversionsTimestamps[_nftId] + timeToRevertNft,
            "Elapsed time to revert"
        );
        burn(msg.sender, _nftId, 1);
        _mint(
            owner(),
            nftsPreviousTokens[_nftId],
            1,
            ""
        );
    }

    function payFee(uint _value) public {
        payable(masterAddr).transfer(_value);
    }

    // The following functions are overrides required by Solidity.
    function _beforeTokenTransfer(
        address operator,
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) internal override(ERC1155, ERC1155Supply) {
        super._beforeTokenTransfer(operator, from, to, ids, amounts, data);
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC1155) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}