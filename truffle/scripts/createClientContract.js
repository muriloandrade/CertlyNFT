const Master = artifacts.require("Certly_Master");
const Client = artifacts.require("Certly_Client");

module.exports = function (callback) {
  
  (async ()=> {  
    const accounts = await web3.eth.getAccounts();
    const master = await Master.deployed();
    const tx = await master.createContract("nike.com/shoes/{id}.json", {from: accounts[1]});
    const clientAddr = tx.logs[2].args.contractAddress;
    const client = await Client.at(clientAddr);
    await client.sendTransaction({from: accounts[1], value: 50});
    await client.mintToken(0, 5, {from: accounts[1]});
    console.log(await client.balanceOf(accounts[1], 0));
    
    callback();

  })();

};