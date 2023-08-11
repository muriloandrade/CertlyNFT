const Certly_Holder = artifacts.require("Certly_Holder");
const Certly_ClientFactory = artifacts.require("Certly_ClientFactory");
const Certly_Master = artifacts.require("Certly_Master");

module.exports = async function (deployer) {
  await deployer.deploy(Certly_Holder);
  await deployer.deploy(Certly_ClientFactory, Certly_Holder.address);
  await deployer.deploy(Certly_Master, Certly_ClientFactory.address, Certly_Holder.address);
  const holder = await Certly_Holder.deployed();
  const clientFactory = await Certly_ClientFactory.deployed();
  const master = await Certly_Master.deployed();
  await holder.setMaster(master.address);
  await clientFactory.setMaster(master.address);
};
