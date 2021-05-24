import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import './App.css';
import Color from './abis/Color.json';
import { useStateWithLabel } from './utils/utils';

function App() {
  const [account, setAccount] = useStateWithLabel('', 'account');
  const [contract, setContract] = useStateWithLabel(null, 'contract');
  const [totalSupply, setTotalSupply] = useStateWithLabel(0, 'totalSupply');
  const [colors, setColors] = useStateWithLabel([], 'colors');
  let colorValue = null;

  const loadWeb3 = async () => {
    if (window.ethereum) {
      // window.web3 = new Web3(window.ethereum);
      window.web3 = new Web3(
        new Web3.providers.HttpProvider('http://localhost:7545')
      );
      await window.ethereum.enable();
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
    } else {
      window.alert(
        'Non-Ethereum browser detected. You should consider trying MetaMask!'
      );
    }
  };

  const loadBlockchainData = async () => {
    const web3 = window.web3;
    const accounts = await web3.eth.getAccounts();
    setAccount(accounts[0]);
    const networkId = await web3.eth.net.getId();
    const networkData = Color.networks[networkId];
    if (networkData) {
      const abi = Color.abi;
      const address = networkData.address;
      console.log(address); // address of deployed contract
      const contract = new web3.eth.Contract(abi, address);
      setContract(contract);

      // const totalSupplyOfTokens = await contract.methods.totalSupply().call(); // TODO: fix this
      // setTotalSupply(totalSupplyOfTokens);
      // // Load Colors
      // for (var i = 1; i <= totalSupplyOfTokens; i++) {
      //   const color = await contract.methods.colors(i - 1).call();
      //   setColors((oldArray) => [...oldArray, color]);
      // }
      let totalSupplyOfTokens = 0;
      try {
        while (true) {
          const color = await contract.methods
            .colors(totalSupplyOfTokens)
            .call();
          setColors((oldArray) => [...oldArray, color]);
          totalSupplyOfTokens++;
        }
      } catch (e) {
        console.log('ended');
        setTotalSupply(totalSupplyOfTokens);
      }
    } else {
      window.alert('Smart contract not deployed to detected network.');
    }
  };

  const getTokenBalance = async () => {
    let bal = await contract.methods.balanceOf(account).call();
    console.log(bal);
    // let x = await contract.methods._colorExists(0).call();
    let x = await contract.methods.ownerOf(12).call();
    console.log(x);
  };

  function mint(color) {
    if (contract) {
      contract.methods
        .mint(color)
        .send({ from: account, gas: 1000000 })
        .once('receipt', (receipt) => {
          setColors((oldArray) => [...oldArray, color]);
        });
      // getTokenBalance();
    }
  }

  useEffect(() => {
    loadWeb3();
    loadBlockchainData();
  }, []);

  return (
    <div>
      <b>Issue Token</b> to {account}
      <hr />
      Total tokens issued till now: {totalSupply}
      <hr />
      <form
        onSubmit={(event) => {
          event.preventDefault();
          mint(colorValue.value);
        }}
      >
        <input
          type='text'
          placeholder='e.g. #FFFFFF'
          ref={(input) => {
            colorValue = input;
          }}
        />
        <input type='submit' value='MINT' />
      </form>
      <div>
        {colors.map((color, key) => {
          return (
            <div key={key} className='token' style={{ backgroundColor: color }}>
              {color}
            </div>
          );
        })}
      </div>
      <hr />
    </div>
  );
}

export default App;
