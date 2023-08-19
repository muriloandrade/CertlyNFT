//SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

interface ICertly_Master {
    function getMintPrice() external view returns (uint);
    function updateUri(string memory _prevUri, string calldata _newUri) external;
    function receiveFee() payable external;
}