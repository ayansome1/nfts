import React, { Component } from 'react';
import Web3 from 'web3';
import './App.css';
import Color from './abis/Color.json';

class App extends Component {
  async UNSAFE_componentWillMount() {
    await this.loadWeb3();
    await this.loadBlockchainData();
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(
        new Web3.providers.HttpProvider('http://localhost:7545')
      );

      // window.web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
    } else {
      window.alert(
        'Non-Ethereum browser detected. You should consider trying MetaMask!'
      );
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3;
    // Load account
    const accounts = await web3.eth.getAccounts();
    console.log(accounts);
    this.setState({ account: accounts[0] });

    // const networkId = await web3.eth.net.getId();
    const networkId = await web3.eth.net.getId();
    // const networkId = '5777';

    console.log(networkId);

    console.log(Color.networks);
    const networkData = Color.networks[networkId];
    if (networkData) {
      const abi = Color.abi;
      const address = networkData.address;
      const contract = new web3.eth.Contract(abi, address);
      this.setState({ contract });
      console.log(contract.methods);
      const totalSupply = await contract.methods.totalSupply().call();
      this.setState({ totalSupply });
      // Load Colors
      for (var i = 1; i <= totalSupply; i++) {
        const color = await contract.methods.colors(i - 1).call();
        this.setState({
          colors: [...this.state.colors, color],
        });
      }
    } else {
      window.alert('Smart contract not deployed to detected network.');
    }
  }

  mint = (color) => {
    if (this.state.contract) {
      this.state.contract.methods
        .mint(color)
        .send({ from: this.state.account, gas: 1000000 })
        .once('receipt', (receipt) => {
          this.setState({
            colors: [...this.state.colors, color],
          });
        });
      this.getTokenBalance();
    }
  };

  async getTokenBalance() {
    let bal = await this.state.contract.methods
      .balanceOf(this.state.account)
      .call();
    console.log(bal);
    // let x = await this.state.contract.methods._colorExists(0).call();
    let x = await this.state.contract.methods.ownerOf(12).call();
    console.log(x);
  }

  constructor(props) {
    super(props);
    this.state = {
      account: '',
      contract: null,
      totalSupply: 0,
      colors: [],
    };
  }

  render() {
    return (
      <div>
        <nav className='navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow'>
          <a
            className='navbar-brand col-sm-3 col-md-2 mr-0'
            href='http://www.dappuniversity.com/bootcamp'
            target='_blank'
            rel='noopener noreferrer'
          >
            Color Tokens
          </a>
          <ul className='navbar-nav px-3'>
            <li className='nav-item text-nowrap d-none d-sm-none d-sm-block'>
              <small className='text-white'>
                <span id='account'>{this.state.account}</span>
              </small>
            </li>
          </ul>
        </nav>
        <div className='container-fluid mt-5'>
          <div className='row'>
            <main role='main' className='col-lg-12 d-flex text-center'>
              <div className='content mr-auto ml-auto'>
                <h1>Issue Token</h1>
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    const color = this.color.value;
                    this.mint(color);
                  }}
                >
                  <input
                    type='text'
                    className='form-control mb-1'
                    placeholder='e.g. #FFFFFF'
                    ref={(input) => {
                      this.color = input;
                    }}
                  />
                  <input
                    type='submit'
                    className='btn btn-block btn-primary'
                    value='MINT'
                  />
                </form>
              </div>
            </main>
          </div>
          <hr />
          <div className='row text-center'>
            {this.state.colors.map((color, key) => {
              return (
                <div key={key} className='col-md-3 mb-3'>
                  <div
                    className='token'
                    style={{ backgroundColor: color }}
                  ></div>
                  <div>{color}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
}

export default App;

// import logo from './logo.svg';
// import './App.css';

// function App() {
//   return (
//     <div className="App">
//       <header className="App-header">
//         <img src={logo} className="App-logo" alt="logo" />
//         <p>
//           Edit <code>src/App.js</code> and save to reload.
//         </p>
//         <a
//           className="App-link"
//           href="https://reactjs.org"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Learn React
//         </a>
//       </header>
//     </div>
//   );
// }

// export default App;
