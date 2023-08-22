//SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";

interface ICertly_Client is IERC1155 {
    function requestNfts(address _to, uint[] memory _ids) external;
    function uri(uint256) external view returns (string memory);
}