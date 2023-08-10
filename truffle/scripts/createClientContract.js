const Master = artifacts.require("Certly_Master");
const Client = artifacts.require("Certly_Client");

module.exports = function (callback) {
  
  (async ()=> {  
    const master = await Master.deployed();
    const accounts = await web3.eth.getAccounts();
    const tx = await master.createContract("nike.com/shoes/{id}.json", {from: accounts[1]});
    const clientContractAddress = tx.logs[2].args.contractAddress;
    const client = await Client.at(clientContractAddress);
    await client.sendTransaction({from: accounts[1], value: 50});
    await client.mintToken(0, 5, {from: accounts[1]});
    console.log(await client.balanceOf(accounts[1], 0));
    
    callback();

  })();

};