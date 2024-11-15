# EVM Auto Transfer

Welcome to the `evm-auto-transfer` repository! This script allows you to automate transactions across multiple EVM-compatible networks. Whether you're interacting with testnets or mainnets, this tool simplifies the process, especially for tasks requiring multiple transfers.

## Features

- 📡 Dynamic RPC URL, chain ID, and explorer integration from JSON files.
- 🔄 Automated transaction processing for multiple addresses.
- 🎯 Targeted transfers to specified addresses from `addresses.json`.
- 🚀 Easily configurable for various networks (testnets and mainnets).
- 🔒 Secure handling of private keys.

## Getting Started

### Prerequisites

Ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v14 or higher)
- npm (Node Package Manager)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/Voztoy/evm-auto-transfer-with-hex.git
   cd evm-auto-transfer-with-hex
   ```

2. Install the necessary packages:

   ```bash
   npm install
   npm install xlsx


### Configuration

1. **Define the Chains**:

   - You'll need to specify the network details in JSON files located in the `/chains` directory. Create two JSON files: `testnet.json` and `mainnet.json`.
   - Each file should contain an array of objects with the following structure:

     ```json
     [
         {
             "name": "Network Name",
             "rpcUrl": "https://rpc-url",
             "chainId": "1234",
             "symbol": "TOKEN",
             "explorer": "https://explorer-url"
         }
     ]
     ```

   - Example for `testnet.json`:

     ```json
     [
         {
             "name": "Plume Testnet",
             "rpcUrl": "https://plume-testnet-rpc.example.com",
             "chainId": "8888",
             "symbol": "PLUME",
             "explorer": "https://plume-testnet-explorer.example.com"
         }
     ]
     ```

2. **Define Private Keys**:

   -Creare data.xlsx
    A: Private key
    B: Addrexx
    C: Hex data
 
     ```
3. ** change
    const contractAddress = "0x85F85B90783E5C2E59b785458143d08De959b4e9" to contract
    gasLimit: 1121000

### Usage

1. Run the script for random address generation and transactions:

   ```bash
   npm start
   ```

2. To use the targeted address feature, run:

   ```bash
   npm run target
   ```

   - You will be prompted to select your network environment (Testnet/Mainnet) and choose the chain from the provided list using the arrow keys.
   - Define the number of transactions you want to process and let the script handle the rest!

### Contribution

Contributions are welcome! Please fork the repository and submit a pull request with your improvements.

### Souce

https://github.com/dante4rt/evm-auto-transfer.git

### Donations

If you would like to support the development of this project, you can make a donation using the following addresses:

- **EVM**: `00xADE4FBED97eF37F3BfbaF36B575a1B114DA92155`

### License

This project is licensed under the MIT License. See the `LICENSE` file for details.
