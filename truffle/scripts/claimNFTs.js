const Holder = artifacts.require("Certly_Holder");
const HDWalletProvider = require('@truffle/hdwallet-provider');
const { GelatoRelay, SponsoredCallERC2771Request, CallWithERC2771Request } = require("@gelatonetwork/relay-sdk");
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
      const data = holder.contract.methods.claimNFTs(123,321).encodeABI();

      // Populate a relay request
      const request = {
        chainId: chainId,
        target: holder.address,
        data: data,
        user: accounts[1],
      };

      const relayResponse = await relay.sponsoredCallERC2771(request, provider, apiKey);
      console.log(relayResponse);

    } catch (e) {
      console.log(e);
    }
    
    callback();

  })();

};