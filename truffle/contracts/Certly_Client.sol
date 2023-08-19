//SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/ICertly_Master.sol";
import "./interfaces/ICertly_Holder.sol";


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
    mapping(uint => address) nftsPreviousOwners;
    mapping(uint => uint) nftsConversionsTimestamps;
    uint public timeToRevertNft = 1 days;

    event Withdrawn(address indexed to, uint value, uint timestamp);    
    event MintedTokens(uint[] ids, uint[] amounts, uint timestamp);
    event TokensConvertedToNFTs(
        address tokensOwner,
        uint[] tokensIds,
        address nftsOwner,
        uint[] nftsIds,
        uint timestamp
    );
    event FeePaid(uint amount, uint timestamp);

    modifier onlyHolder {
        require(msg.sender == address(holder), "Clt: Not allowed");
        _;
    }

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
            "Clt: The value requested exceeds the balance"
        );
        _to.transfer(_value);
        emit Withdrawn(_to, _value, block.timestamp);
    }

    function updateUri(string memory _newUri) external onlyOwner {
        master.updateUri(uri(0), _newUri);
        _setURI(_newUri);
    }

    function setTimeToRevertNft(uint _timeInDays) external onlyOwner {
        timeToRevertNft = _timeInDays * 1 days;
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
        require(address(this).balance >= totalAmount * mintPrice, "Clt: Not enough funds");

        bool ids_range_ok = true;
        for (uint i = 0; i < ids.length; i++) {
            ids_range_ok = ids[i] <= MAX_TOKEN_ID;
        }
        require(ids_range_ok, "Clt: Passed Id(s) out of range");

        _mintBatch(owner(), ids, amounts, "");
        payFee(mintPrice * totalAmount);
        emit MintedTokens(ids, amounts, block.timestamp);
    }

    mapping(address => mapping(uint => bool)) nftsIdsPassed;
    function tokensToNfts(address _toAccount, uint[] memory _tokensIds, uint[] memory _nftsIds) private {
        bool tokensIdsOk = true;
        bool nftsIdsOk = true;
        for (uint i = 0; i < _tokensIds.length && tokensIdsOk && nftsIdsOk; i++) {
            tokensIdsOk = _tokensIds[i] <= MAX_TOKEN_ID;
            nftsIdsOk =  _nftsIds[i] >= MIN_NFT_ID
                        && !(nftsIdsPassed[_toAccount][_nftsIds[i]])
                        && totalSupply(_nftsIds[i]) == 0;
            nftsIdsPassed[_toAccount][_nftsIds[i]] = true;
        }
        for (uint i; i < _nftsIds.length; i++) nftsIdsPassed[msg.sender][i] = false;
        require(tokensIdsOk && nftsIdsOk, "Clt: Passed Id(s) out of range, non unique or already minted NFT Id" );
       
        uint[] memory _1s = new uint[](_nftsIds.length);
        for(uint i = 0; i < _tokensIds.length; i++) _1s[i] = 1;
        burnBatch(msg.sender, _tokensIds, _1s);
        _mintBatch(_toAccount, _nftsIds, _1s, "");

        for (uint i = 0; i < _nftsIds.length; i++) {
            nftsPreviousTokens[_nftsIds[i]] = _tokensIds[i];
            nftsPreviousOwners[_nftsIds[i]] = msg.sender;
            nftsConversionsTimestamps[_nftsIds[i]] = block.timestamp;
        }
        emit TokensConvertedToNFTs(
            msg.sender,
            _tokensIds,
            _toAccount,
            _nftsIds,
            block.timestamp
        );
    }

    function verifyHashUint(uint256 _hash) public pure returns(bytes32)  {
        return keccak256(abi.encodePacked(_hash));
    }



    function tokensToNftsPending(bytes32 _invoice_and_password_hash, uint[] memory _tokensIds, uint[] memory _nftsIds) external {
        
        tokensToNfts(address(holder), _tokensIds, _nftsIds);
        holder.registerPendingNfts(_invoice_and_password_hash, _nftsIds);
    }
    
    function requestNfts(address _to, uint[] memory _ids) external onlyHolder {
        uint[] memory _1s = new uint[](_ids.length);
        for(uint i = 0; i < _ids.length; i++) _1s[i] = 1;
        safeBatchTransferFrom(msg.sender, _to, _ids, _1s, "");
    }

    function revertNft(address _caller, uint _nftId) external onlyHolder {
        require(balanceOf(_caller, _nftId) > 0, "Clt: Caller is not NFT owner");
        require(block.timestamp <= nftsConversionsTimestamps[_nftId] + timeToRevertNft,"Clt: Elapsed time to revert");
        burn(_caller, _nftId, 1);
        _mint(
            nftsPreviousOwners[_nftId],
            nftsPreviousTokens[_nftId],
            1,
            ""
        );
    }

    function payFee(uint _value) private {
        master.receiveFee{value: _value}();
        emit FeePaid(_value, block.timestamp);
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