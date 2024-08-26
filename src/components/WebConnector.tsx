'use client'
import { useEffect, useState } from "react";
import Web3, { Address, Contract, Uint256 } from "web3";
import cryptoZombiesABI from "../contracts/CryptoZombies.json"

const WebConnector = () => {
  const [account, setAccount] = useState<Address>();
  const [message, setMessage] = useState<string>();

  const [cryptoZombies, setCryptoZombies] = useState<Contract<any>>();

  const getZombieDetails = (id: Uint256) => {
    return cryptoZombies!.methods.zombies(id).call()
  }

  // 1. Define `zombieToOwner` here
  const zombieToOwner = (id: Uint256) =>  {
    return cryptoZombies!.methods.zombieToOwner(id).call()
  }

  // 2. Define `getZombiesByOwner` here
  const getZombiesByOwner = async (owner: Address) => {
    return cryptoZombies!.methods.getZombiesByOwner(owner).call();
  }

  const displayZombies = (ids: Uint256[]) => {
    for (let id of ids) {
      getZombieDetails(id).then((zombie: any) => {
        console.log(zombie);
      })
    }
  }

  const createRandomZombie =(name: string) => {
    // 这将需要一段时间，所以在界面中告诉用户这一点
    // 事务被发送出去了
    setMessage("正在区块链上创建僵尸，这将需要一会儿...");
    // 把事务发送到我们的合约:
    return cryptoZombies!.methods.createRandomZombie(name)
    .send({ from: account })
    .on("receipt", function(receipt) {
      setMessage("成功生成了 " + name + "!");
      // 事务被区块链接受了，重新渲染界面
      getZombiesByOwner(account!).then((ids: any) => displayZombies(ids));
    })
    .on("error", function(error) {
      // 告诉用户合约失败了
      setMessage(error.message);
    });
  }

  const feedOnKitty =(zombieId: Uint256, kittyId: Uint256) => {
    // 这将需要一段时间，所以在界面中告诉用户这一点
    // 事务被发送出去了
    setMessage("正在吃猫咪，这将需要一会儿...");
    // 把事务发送到我们的合约:
    return cryptoZombies!.methods.feedOnKitty(zombieId, kittyId)
    .send({ from: account })
    .on("receipt", function(receipt) {
      setMessage("吃了一只猫咪并生成了一只新僵尸!");
      // 事务被区块链接受了，重新渲染界面
      getZombiesByOwner(account!).then((ids: any) => displayZombies(ids));
    })
    .on("error", function(error) {
      // 告诉用户合约失败了
      setMessage(JSON.stringify(error));
    });
  }

  const levelUp = (zombieId: Uint256) => {
    setMessage("正在升级您的僵尸...");
    return cryptoZombies!.methods.levelUp(zombieId)
    .send({ from: account, value: Web3.utils.toWei("0.001","ether") })
    .on("receipt", function(receipt) {
      setMessage("不得了了！僵尸成功升级啦！");
    })
    .on("error", function(error) {
      setMessage(JSON.stringify(error));
    });
  }

  const startApp = async () => {
    cryptoZombies!.events.NewZombie({ fromBlock: "latest" }).on("data", function(event) {
      console.log(event);
      // 重新渲染界面
      getZombiesByOwner(account!).then((ids: any) => displayZombies(ids));
    });
    await initZombies();
  }

  const initZombies = async() => {
    const zombies = await getZombiesByOwner(account!);
    if(zombies && zombies.length === 0) {
      setMessage("正在初始化僵尸...");
      createRandomZombie("CryptoZombie #1").then(() => {
        setMessage("初始化僵尸完成...");
      });
    }
    else {
      setMessage("初始化僵尸完成...");
    }
  }

  useEffect(() => {
    const loadWeb3 = async () => {
      if (window.ethereum) {
        window.web3 = new Web3(window.ethereum);
        await window.ethereum.enable();
        const networkId = await window.web3.eth.net.getId();
        const networkData = cryptoZombiesABI.networks[networkId as keyof typeof cryptoZombiesABI.networks];
        if (networkData) {
          const cryptoZombies = new window.web3.eth.Contract(cryptoZombiesABI.abi, networkData.address);
          setCryptoZombies(cryptoZombies);
        } else {
          console.log("CryptoZombies contract not deployed to detected network.");
        }

        return await window.web3.eth.getAccounts();
      } else if (window.web3) {
        window.web3 = new Web3(window.web3.currentProvider);
        const networkId = await window.web3.eth.net.getId();
        const networkData = cryptoZombiesABI.networks[networkId as keyof typeof cryptoZombiesABI.networks];
        if (networkData) {
          const cryptoZombies = new window.web3.eth.Contract(cryptoZombiesABI.abi, networkData.address);
          setCryptoZombies(cryptoZombies);
        } else {
          console.log("CryptoZombies contract not deployed to detected network.");
        }

        return await window.web3.eth.getAccounts();
      } else {
        console.log("No web3 instance found");
      }
    };
    loadWeb3().then((accounts: any) => {
      if (accounts && accounts.length > 0) {
        setAccount(accounts[0]);
      }
    });
  }, []);

  useEffect(() => {
    if (window.web3 && account) {
      startApp();
    }
  }, [account]);

  return (
    <div>
      <h1>Web3.js with Next.js</h1>
      <p>Account: {account || 'No account connected'}</p>
      <p>Message: {message || ''}</p>
      <button onClick={() => getZombiesByOwner(account!).then((ids: any) => displayZombies(ids))}>Get Zombies</button>
      <button onClick={() => levelUp("0")}>level up Zombies</button>
    </div>
  );
}

export default WebConnector;