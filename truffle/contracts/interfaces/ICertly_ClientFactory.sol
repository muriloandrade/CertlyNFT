//SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

interface ICertly_ClientFactory {
  function createNewClient(string memory _uri, string memory _baseURI, address _owner) external returns(address); 
}