# ConsentChain Algorand - DPDP Act 2023 Implementation

ConsentChain is a decentralized application (dApp) built on the Algorand blockchain designed to manage data consent in compliance with the **Digital Personal Data Protection (DPDP) Act of 2023** of India. 

It provides an immutable, transparent, and fair ecosystem for end-users to manage who accesses their data, and it allows companies to properly request and pay for such access.

## Features

- **DPDP Act Compliance**: Users can easily choose to **Give**, **Pause**, or **Revoke** consent at any given time.
- **50/50 Escrow Micro-Payments**: Companies pay a small ALGO fee to an Escrow Smart Contract to access data. The smart contract automatically splits this fee 50% to the Platform Admin and 50% to the specific User.
- **Pera Wallet Integration**: Secure login and transaction signing using Pera Wallet Connect.
- **High-Speed Architecture**: Leveraging Algorand's ~3.3-second finality and microscopic transaction costs to make per-request escrow payments viable.
- **Next.js & Glassmorphism Design**: A hyper-modern, sleek web portal for Users, Companies, and Admins.
- **Node.js Express Backend**: Off-chain backend storage protected by `express-rate-limit` that directly verifies Algorand Smart Contract BoxMap states before releasing simulated user data.

## Project Structure

- **`/frontend`**: Next.js 15 application utilizing standard React patterns and Pera Wallet (`@txnlab/use-wallet`).
- **`/backend`**: Express Node.js application acting as the off-chain data provider. Connects natively to an Algorand node (`algosdk`) to verify consent statuses.
- **`/consentchain-algorand`**: Algokit Smart Contract project. Contains the `ConsentManager` TEALScript (PuyaTS) codebase mapped to Box Storage arrays.

## Tech Stack
- Frontend: Next.js (App Router), Tailwind CSS v4, Lucide React
- Backend: Node.js, Express, `algosdk`
- Blockchain/Smart Contracts: Algorand, PuyaTS, AlgoKit CLI
- Wallets: Pera Wallet

## Prerequisites

To run this repository locally, you will need:
- Node.js (v18+)
- Docker (for AlgoKit LocalNet)
- [AlgoKit CLI](https://github.com/algorandfoundation/algokit-cli) 

## Quick Start

### 1. Start LocalNet
```bash
algokit localnet start
```

### 2. Deploy the Smart Contract
```bash
cd consentchain-algorand/projects/consentchain-algorand
npm install
npm run build
npm run deploy
```

### 3. Run the Backend API
```bash
cd backend
npm install
npm start
```
*(The backend defaults to port 5000)*

### 4. Run the Frontend portal
```bash
cd frontend
npm install
npm run dev
```
*(The frontend defaults to port 3000)*

---
*Built for the future of data sovereignty.*
