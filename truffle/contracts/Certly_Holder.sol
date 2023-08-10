//SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";

contract Certly_Client is ERC1155Holder {
    
    address owner;

    constructor() {
        owner = msg.sender;
    }    
}