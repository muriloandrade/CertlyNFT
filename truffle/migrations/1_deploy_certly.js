const Certly_ClientFactory = artifacts.require("Certly_ClientFactory");
const Certly_Master = artifacts.require("Certly_Master");

module.exports = async function (deployer) {
  await deployer.deploy(Certly_ClientFactory);
  await deployer.deploy(Certly_Master, Certly_ClientFactory.address);
  const clientFactory = await Certly_ClientFactory.deployed();
  const master = await Certly_Master.deployed();
  await clientFactory.setMaster(master.address);
};
