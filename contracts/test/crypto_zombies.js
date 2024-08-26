const CryptoZombies = artifacts.require("CryptoZombies");
const { time } = require("@openzeppelin/test-helpers");

const zombieNames = ["Zombie 1", "Zombie 2"];

/*
 * uncomment accounts to access the test accounts made available by the
 * Ethereum client
 * See docs: https://www.trufflesuite.com/docs/truffle/testing/writing-tests-in-javascript
 */
contract("CryptoZombies", function (accounts) {
  let [alice, bob] = accounts;

  let contractInstance;

  beforeEach(async () => {
    contractInstance = await CryptoZombies.new();
  });

  afterEach(async () => {
    await contractInstance.kill();
  });

  it("should assert true", async function () {
    await CryptoZombies.deployed();
    return assert.isTrue(true);
  });

  it("should be able to create a new zombie", async function () {
    const result = await contractInstance.createRandomZombie(zombieNames[0], {from: alice});
    assert.equal(result.receipt.status, true);
    assert.equal(result.logs[0].args.name, zombieNames[0]);
  });

  it("should not allow two zombies", async () => {
    await contractInstance.createRandomZombie(zombieNames[0], {from: alice});
    await shouldThrow(contractInstance.createRandomZombie(zombieNames[1], {from: alice}));
  })

  context("with the single-step transfer scenario", async () => {
    it("should transfer a zombie", async () => {
      const result = await contractInstance.createRandomZombie(zombieNames[0], {from: alice});
      const zombieId = result.logs[0].args.zombieId.toNumber();
      await contractInstance.transfer(bob, zombieId, {from: alice});
      const newOwner = await contractInstance.ownerOf(zombieId);
      assert.equal(newOwner, bob);
    })
  })

  context("with the two-step transfer scenario", async () => {
    it("should approve and then transfer a zombie when the approved address calls transferFrom", async () => {
      const result = await contractInstance.createRandomZombie(zombieNames[0], {from: alice});
      const zombieId = result.logs[0].args.zombieId.toNumber();
      await contractInstance.approve(bob, zombieId, {from: alice});

      await contractInstance.takeOwnership(zombieId, {from: bob});  
      const newOwner = await contractInstance.ownerOf(zombieId);
      assert.equal(newOwner, bob);
    })
  })

  it("zombies should be able to attack another zombie", async () => {
    let result;
    result = await contractInstance.createRandomZombie(zombieNames[0], {from: alice});
    const firstZombieId = result.logs[0].args.zombieId.toNumber();
    result = await contractInstance.createRandomZombie(zombieNames[1], {from: bob});
    const secondZombieId = result.logs[0].args.zombieId.toNumber();
    await time.increase(time.duration.days(1));
    await contractInstance.attack(firstZombieId, secondZombieId, {from: alice});
    assert.equal(result.receipt.status, true);
  })

  it("owners should be able to get their own zombies", async () => {
    const newZombie = await contractInstance.createRandomZombie(zombieNames[0], {from: alice});
    const firstZombieId = newZombie.logs[0].args.zombieId.toNumber();
    const result = await contractInstance.getZombiesByOwner(alice);
    const zombieIds = result.map(zombie => zombie.toNumber());
    assert.equal(zombieIds.length, 1);
    assert.equal(zombieIds[0], firstZombieId);
  })
});

async function shouldThrow(promise) {
  try {
    await promise;
    assert(false, "Expected an error but did not get one");
  } catch (err) {
    assert(err.message.includes("revert"), "Expected a revert error");
  }
}
