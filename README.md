# Document Verification System

A blockchain-based document verification system using Hardhat, Ganache, and React.

## Prerequisites

- Node.js v22+
- [Ganache UI](https://trufflesuite.com/ganache/) desktop app
- MetaMask browser extension

## Setup & Run

### 1. Install dependencies
```bash
npm install
cd frontend && npm install && cd ..
```

### 2. Start Ganache
Open Ganache UI and start a workspace on `http://127.0.0.1:7545` with Chain ID `1337`.

### 3. Connect MetaMask to Ganache
Add a network manually in MetaMask:
- RPC URL: `http://127.0.0.1:7545`
- Chain ID: `1337`
- Currency Symbol: `ETH`

Then import an account using a private key from Ganache.

### 4. Deploy the contract
```bash
npx hardhat run scripts/deploy.js --network ganache
```
If `hre.ethers.getContractFactory` throws undefined, run:
```bash
  npm install --save-dev hardhat@^2.22.0 @nomicfoundation/hardhat-ethers@^3.0.8
```
  Hardhat v3 ships with `hardhat-ethers@^4.x` which breaks the ethers API.

### 5. Start the frontend
```bash
cd frontend && npm run dev
```

Open `http://localhost:5173`.

## Important Notes
- Uses **Hardhat v2** + `@nomicfoundation/hardhat-ethers@^3.0.8` — do not upgrade to Hardhat v3, it breaks the ethers plugin.
- Ganache must be running **before** deploying.
- Redeploying generates a new contract address — `frontend/src/ContractInfo.js` is updated automatically.