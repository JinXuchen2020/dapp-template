var CryptoZombies = artifacts.require("./CryptoZombies.sol");
module.exports = function(_deployer) {
  // Use deployer to state migration tasks.
  _deployer.deploy(CryptoZombies);
};
