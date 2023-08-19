//SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

interface ICertly_Holder {
    function registerClient(address _clientAddr) external;
    function registerPendingNfts(bytes32 _hash, uint[] memory _nftsIds) external;
}
