const Master = artifacts.require("Certly_Master");
const Client = artifacts.require("Certly_Client");
const Holder = artifacts.require("Certly_Holder");

module.exports = function (callback) {
  
  (async ()=> { 
    try { 
      const accounts = await web3.eth.getAccounts();
      const master = await Master.deployed();
      const holder = await Holder.deployed();
      
      const tx_nike = await master.createContract("nike.com/shoes/{id}.json", {from: accounts[1]});
      const clientAddr_nike = tx_nike.logs[2].args.contractAddress;
      const client_nike = await Client.at(clientAddr_nike);
      await client_nike.sendTransaction({from: accounts[1], value: 150});
      await client_nike.mintTokenBatch([0,1,2], [1,1,1], {from: accounts[1]});
      console.log(`0_total_supply = ${await client_nike.totalSupply(0)}`);
      console.log(`1_total_supply = ${await client_nike.totalSupply(1)}`);
      console.log(`2_total_supply = ${await client_nike.totalSupply(2)}`);

      await client_nike.tokensToNftsPending(123, 321, [0, 1, 2], [4294967296, 4294967297, 4294967298], {from: accounts[1]});
      console.log(`0_total_supply = ${await client_nike.totalSupply(0)}`);
      console.log(`1_total_supply = ${await client_nike.totalSupply(1)}`);
      console.log(`2_total_supply = ${await client_nike.totalSupply(2)}`);
      
      const tx_adidas = await master.createContract("adidas.com/shoes/{id}.json", {from: accounts[2]});
      const clientAddr_adidas = tx_adidas.logs[2].args.contractAddress;
      const client_adidas = await Client.at(clientAddr_adidas);
      await client_adidas.sendTransaction({from: accounts[2], value: 50});
      await client_adidas.mintTokenBatch([0], [5], {from: accounts[2]});
      console.log(`0_total_supply = ${await client_adidas.totalSupply(0)}`);
      await client_adidas.tokensToNftsPending(123, 321, [0, 0], [4294967296, 4294967297], {from: accounts[2]});
      console.log(`0_total_supply = ${await client_adidas.totalSupply(0)}`);
      
      let result = await holder.claimNFTs(123, 321, {from: accounts[3]});

      await printBalance();
      
      console.log("Reverting Nike 97 and Adidas 97");
      await client_nike.revertNft(4294967297, {from: accounts[3]});
      await client_adidas.revertNft(4294967297, {from: accounts[3]});
      
      await printBalance();

      console.log(await client_nike.uri(0));
      await client_nike.updateUri("nike.com/sho/{id}.json", {from: accounts[1]});
      await client_adidas.updateUri("adidas.com/sho/{id}.json", {from: accounts[2]});
      console.log(await client_nike.uri(0));

      async function printBalance() {
        console.log(`Total supply nike ...00= ${await client_nike.totalSupply(0)}`);
        console.log(`Total supply nike ...01= ${await client_nike.totalSupply(1)}`);
        console.log(`Total supply nike ...02= ${await client_nike.totalSupply(2)}`);
        console.log(`BalanceOf nike ......96= ${await client_nike.balanceOf(accounts[3], 4294967296)}`);
        console.log(`BalanceOf nike ......97= ${await client_nike.balanceOf(accounts[3], 4294967297)}`);
        console.log(`BalanceOf nike ......98= ${await client_nike.balanceOf(accounts[3], 4294967298)}`);
        console.log(`BalanceOf nike ......99= ${await client_nike.balanceOf(accounts[3], 4294967299)}`);
        
        console.log(`Total supply adidas ...00= ${await client_adidas.totalSupply(0)}`);
        console.log(`BalanceOf adidas ......96= ${await client_adidas.balanceOf(accounts[3], 4294967296)}`);
        console.log(`BalanceOf adidas ......97= ${await client_adidas.balanceOf(accounts[3], 4294967297)}`);
        console.log(`BalanceOf adidas ......98= ${await client_adidas.balanceOf(accounts[3], 4294967298)}`);
        console.log(`BalanceOf adidas ......99= ${await client_adidas.balanceOf(accounts[3], 4294967299)}`);
      }
    
    } catch (e) {
      console.log(e);
    }
    
    callback();

  })();

};