'use client'
import { useEffect, useState } from "react";
import Web3, { Address, Contract, Uint, Uint256 } from "web3";
import cryptoZombiesABI from "../contracts/CryptoZombies.json"
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { ZombieModel } from "@/models/ZombieModel";
import { Label } from "./ui/label";
import { attack, getMessages, getZombies, initZombies, levelUp, setCryptoZombies } from "@/app/actions/contract";

const WebConnector = () => {
  const [accounts, setAccounts] = useState<Address[]>();
  const [messages, setMessages] = useState<string[]>([]);
  const [zombieModels, setZombieModels] = useState<{[key: Address]: ZombieModel[]}>({});
  const [selectedZombies, setSelectedZombies] = useState<{[key: Address]: Uint256}>({});

  let isInitialized = false;

  const displayZombies = async (account: Address) => {
    const result = await getZombies(account);
    setZombieModels({...zombieModels, [account]: result});
  }

  const attackZombie = (account: Address, zombieId: Uint256) => {
    // 这将需要一段时间，所以在界面中告诉用户这一点
    // 事务被发送出去了
    if (Object.keys(selectedZombies).length === 0) {
      setSelectedZombies({...selectedZombies, [account]: zombieId})
    }
    else {
      const attackAccount = Object.keys(selectedZombies)[0];
      const attackZombieId = selectedZombies[attackAccount];
      attack(attackAccount, attackZombieId, account, zombieId).then(async () => {
        const attackResult = await getZombies(attackAccount);
        const targetResult = await getZombies(account);
        setZombieModels({...zombieModels, [attackAccount]: attackResult, [account]: targetResult});
        const newMessages = getMessages();
        setMessages([...newMessages]);
        setSelectedZombies({});
      });
    }    
  }

  const levelUpZombie = (account: Address, zombieId: Uint256) => {
    levelUp(account, zombieId).then(async() => {
      const result = await getZombies(account);
      setZombieModels({...zombieModels, [account]: result});
      const newMessages = getMessages();
      setMessages([...newMessages]);
    });    
  }

  const startApp = async (accounts: Address[]) => {
    // cryptoZombies!.events.NewZombie({ fromBlock: "latest" }).on("data", function(event) {
    //   console.log(event);
    //   // 重新渲染界面
    //   // getZombiesByOwner(account!).then((ids: any) => displayZombies(ids));
    // });
    for (const account of accounts) {
      await initZombies(account);
    }

    const newMessages = getMessages();
    setMessages([...newMessages]);
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
    loadWeb3().then((res: any) => {
      if (res && !isInitialized) {
        isInitialized = true;
        setAccounts(res);
        startApp(res);
      }
    });
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <h1>Web3.js with Next.js</h1>
      <div className="flex flex-row space-x-2">
        {
          accounts && accounts.map((account: Address, index: number) => {
            return <div className="flex flex-col gap-2" key={account}>
              <p>Account: {account || 'No account connected'}</p>
              <div className="flex flex-row space-x-2">
                <Button size={"sm"} onClick={() => displayZombies(account) }>Get Zombies</Button>        
              </div>
              {
                zombieModels[account] && zombieModels[account].map((zombie: ZombieModel, index: number) => {
                  return <Card key={index} onClick={() => attackZombie(account, zombie.id)}>
                    <CardHeader>
                      <CardTitle>{zombie.name}</CardTitle>
                      <CardDescription>Level: {zombie.level}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p>DNA: {zombie.dna}</p>
                      <p>WinCount: {zombie.winCount}</p>
                      <p>LoseCount: {zombie.loseCount}</p>
                      <p>ReadTime: {zombie.readyTime}</p>
                    </CardContent>
                    <CardFooter>
                      <Button size={"sm"} onClick={(events) => {
                        events.stopPropagation();
                        levelUpZombie(account, zombie.id);
                      }}>Level up</Button>
                    </CardFooter>
                  </Card>
                })
              }
            </div>
          })
        }
      </div>      
      <div className="flex flex-col gap-2">
        {
          messages && messages.map((message: string, index: number) => {
            return <Label key={index}>{message}</Label>
          })
        }
      </div>     
    </div>
  );
}

export default WebConnector;