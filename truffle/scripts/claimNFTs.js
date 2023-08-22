const Holder = artifacts.require("Certly_Holder");
const HDWalletProvider = require('@truffle/hdwallet-provider');
const { GelatoRelay } = require("@gelatonetwork/relay-sdk");
const { ethers } = require("ethers");

module.exports = function (callback) {
  
  (async ()=> { 
    try {
      require('dotenv').config();
      const holder = await Holder.deployed();
      const relay = new GelatoRelay();
      
      const accounts = await web3.eth.getAccounts();
      const apiKey = process.env.GELATO_API_KEY;
      let provider = new ethers.providers.Web3Provider(web3.currentProvider);
      const chainId = provider.provider.chainId;
      const data = holder.contract.methods.claimNFTs("0xc888c9ce9e098d5864d3ded6ebcc140a12142263bace3a23a36f9905f12bd64a","0xd57fa53f0ffc77a42bcc62fd0e178cdc7e36e394ca553d411b5e5713e0a74d7a").encodeABI();

      // Populate a relay request
      const request = {
        chainId: chainId,
        target: holder.address,
        data: data,
        user: accounts[1],
      };

      console.log("request", request)

      const relayResponse = await relay.sponsoredCallERC2771(request, provider, apiKey);
      console.log(relayResponse);

    } catch (e) {
      console.log(e);
    }
    
    callback();

  })();

};