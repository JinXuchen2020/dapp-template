import { ZombieModel } from "@/models/ZombieModel";
import Web3, { Address, Contract, Uint256 } from "web3";

let cryptoZombies: Contract<any>;
let messages: string[] = [];

export const setCryptoZombies = (contract: Contract<any>) => {
  cryptoZombies = contract;
}

export const getMessages = () => {
  return messages;
}

export const getZombiesByOwner = (owner: Address) => {
  return cryptoZombies!.methods.getZombiesByOwner(owner).call();
}

export const getZombieDetails = (id: Uint256) => {
  return cryptoZombies!.methods.zombies(id).call()
}

export const getZombies = async (account: Address) => {
  const ids = await getZombiesByOwner(account);
  let zombieModels: ZombieModel[] = [];
  if (ids && ids.length > 0) {
    zombieModels = await displayZombies(account, ids);
  }

  return zombieModels;
}

export const displayZombies = async (account: Address, ids: Uint256[]) => {
  return await Promise.all(ids.map((id: Uint256) => {
    return getZombieDetails(id).then((res: any) => {
      const zombie: ZombieModel = {
        dna: res.dna.toString(),
        id: id,
        level: res.level.toString(),
        name: res.name,
        winCount: res.winCount.toString(),
        loseCount: res.lossCount.toString(),
        readyTime: res.readyTime.toString()
      }
      return zombie;
    })
  }));
}

const createRandomZombie = (account: Address, name: string) => {
  // 这将需要一段时间，所以在界面中告诉用户这一点
  // 事务被发送出去了
  messages.push( `账号：${account} 正在区块链上创建僵尸，这将需要一会儿...`);
  // 把事务发送到我们的合约:
  return cryptoZombies!.methods.createRandomZombie(name)
  .send({ from: account })
  .on("receipt", async function(receipt) {
    messages.push(`账号：${account} 成功生成了僵尸 ${name}!`);
  })
  .on("error", function(error) {
    // 告诉用户合约失败了
    messages.push( `账号：${account} 合约失败，原因 ${error.message}`);
  });
}

export const levelUp = (account: Address, zombieId: Uint256) => {
  messages.push( `账号：${account} 正在升级您的僵尸...`);
  return cryptoZombies!.methods.levelUp(zombieId)
  .send({ from: account, value: Web3.utils.toWei("0.001","ether") })
  .on("receipt", function(receipt) {
    messages.push( `不得了了！账号：${account} 僵尸成功升级啦！`);
  })
  .on("error", function(error) {
    messages.push( `账号：${account} 合约失败，原因 ${error.message}`);
  });
}

export const attack = (attackAccount: Address, attackZombieId: Uint256, account: Address, zombieId: Uint256) => {
  messages.push( `账号：${attackAccount}的僵尸正在攻击 账号：${account}的僵尸...`);
  // 把事务发送到我们的合约:
  return cryptoZombies!.methods.attack(attackZombieId, zombieId)
  .send({ from: attackAccount })
  .on("receipt", function(receipt) {
    messages.push( `账号：${attackAccount}的僵尸攻击 账号：${account}的僵尸结束!`);
  })
  .on("error", function(error) {
    // 告诉用户合约失败了
    messages.push( `账号：${account} 合约失败，原因 ${error.message}`);
  })
}

export const initZombies = async (account: Address) => {
  const zombies = await getZombiesByOwner(account);
  if(zombies && zombies.length === 0) {
    messages.push( `账号：${account} 正在初始化僵尸...`);
    createRandomZombie(account, "CryptoZombie #1").then(() => {
      messages.push(`账号：${account} 初始化僵尸完成...`);
    });
  }
  else {
    messages.push(`账号：${account} 初始化僵尸完成...`);
  }
}