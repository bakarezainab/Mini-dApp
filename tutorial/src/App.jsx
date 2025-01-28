import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import abi from "./abi.json";
import './App.css'

const CONTRACT_ADDRESS = "0x4a9C121080f6D9250Fc0143f41B595fD172E31bf"; 

const App = () => {
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState("");
  const [contract, setContract] = useState(null);
  const [provider, setProvider] = useState(null);
  const [account, setAccount] = useState("");

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);

        setProvider(provider);
        setContract(contract);

        const accounts = await provider.send("eth_requestAccounts", []);
        setAccount(accounts[0]);

        const currentBalance = await contract.getBalance();
        setBalance(ethers.formatEther(currentBalance));
      } else {
        alert("Kindly install MetaMask to interact with this app.");
      }
    };

    init();
  }, []);

  const handleDeposit = async () => {
    if (contract && amount) {
      try {
        const tx = await contract.deposit(ethers.parseEther(amount), {
          value: ethers.parseEther(amount),
        });
        await tx.wait();
        const updatedBalance = await contract.getBalance();
        setBalance(ethers.formatEther(updatedBalance));
        setAmount("");
      } catch (err) {
        console.error(err);
        alert("Transaction failed!");
      }
    }
  };

  const handleWithdraw = async () => {
    if (contract && amount) {
      try {
        const tx = await contract.withdraw(ethers.parseEther(amount));
        await tx.wait();
        const updatedBalance = await contract.getBalance();
        setBalance(ethers.formatEther(updatedBalance));
        setAmount("");
      } catch (err) {
        console.error(err);
        if (err.data?.message) {
          alert(err.data.message);
        } else {
          alert("Transaction failed!");
        }
      }
    }
  };

  return (
    <div className="App" style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>Assessment Contract Interaction</h1>
      <p>
        <strong>Connected Account:</strong> {account}
      </p>
      <p>
        <strong>Current Balance:</strong> {balance} ETH
      </p>

      <div>
        <input
          type="number"
          placeholder="Enter amount in ETH"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          style={{ marginRight: "10px", padding: "5px" }}
        />
        <button onClick={handleDeposit} style={{ marginRight: "10px" }}>
          Deposit
        </button>
        <button onClick={handleWithdraw}>Withdraw</button>
      </div>
    </div>
  );
};

export default App;
