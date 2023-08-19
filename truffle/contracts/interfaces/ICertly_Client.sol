//SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

interface ICertly_Client {
    function nftClaimed(bytes32 _hash ,address _toAccount) external;
    function requestNfts(address _to, uint[] memory _ids) external;
}