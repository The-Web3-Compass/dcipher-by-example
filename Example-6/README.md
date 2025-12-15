# 🎁 Secret Santa Time-Locked Messages

A decentralized application demonstrating **blocklock encryption** using the dcipher network. Send encrypted gift messages that automatically decrypt at a future block height!

## ✨ What You'll Learn

This educational example teaches:

1. **Block-based encryption** - How to encrypt data that unlocks at a specific block height
2. **Setting conditions** - How block height becomes the decryption condition
3. **Encryption process** - Using `blocklock-js` to encrypt messages on the frontend
4. **Decryption process** - How dcipher automatically delivers decryption keys when conditions are met
5. **Privacy** - Only the recipient can decrypt and read the message

## 🏗️ Tech Stack

### Smart Contract
- **Solidity** ^0.8.28
- **Hardhat** - Development environment
- **blocklock-solidity** - Contract inheritance for blocklock integration
- **Base Sepolia** - Testnet deployment

### Frontend
- **React 18** with TypeScript
- **Vite** - Fast build tool
- **wagmi + viem** - Ethereum interactions
- **blocklock-js** - Frontend encryption library

## 📋 Prerequisites

- Node.js >= 18
- MetaMask or compatible Web3 wallet
- Base Sepolia testnet ETH ([Get from faucet](https://www.coinbase.com/faucets/base-ethereum-goerli-faucet))

## 🚀 Getting Started

### 1. Install Dependencies

```bash
cd Example-6
npm install
cd frontend && npm install && cd ..
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your values:
```env
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
PRIVATE_KEY=your_private_key_here
BASESCAN_API_KEY=your_basescan_api_key  # Optional, for verification
```

⚠️ **NEVER commit your `.env` file!**

### 3. Compile Contract

```bash
npm run compile
```

### 4. Deploy to Base Sepolia

```bash
npm run deploy
```

Save the deployed contract address from the output.

### 5. Copy ABI to Frontend

```bash
npm run copy-abi
```

### 6. Update Frontend Config

Edit `frontend/src/config.ts`:
```typescript
export const CONTRACT_ADDRESS = 'YOUR_DEPLOYED_ADDRESS' as `0x${string}`;
```

### 7. Run Frontend

```bash
npm run frontend:dev
```

Open [http://localhost:5173](http://localhost:5173)

## 📁 Project Structure

```
Example-6/
├── contracts/
│   └── GiftMessage.sol      # Main contract with blocklock integration
├── scripts/
│   ├── deploy.js            # Deployment script
│   └── copyAbi.js           # ABI copy utility
├── frontend/
│   ├── src/
│   │   ├── hooks/
│   │   │   └── useGiftMessages.ts   # Blockchain interactions
│   │   ├── components/
│   │   │   ├── CreateMessage.tsx    # Message creation form
│   │   │   └── MessageList.tsx      # Display messages
│   │   ├── utils/
│   │   │   └── blocktime.ts         # Block/date conversion
│   │   ├── config.ts                # Contract address & config
│   │   ├── abi.ts                   # Contract ABI
│   │   └── App.tsx                  # Main app component
│   └── ...
├── hardhat.config.js
├── package.json
└── README.md
```

## 📚 Learn More

- [dcipher Documentation](https://docs.dcipher.network/)
- [blocklock-js GitHub](https://github.com/dcipher-network/blocklock-js)
- [blocklock-solidity GitHub](https://github.com/dcipher-network/blocklock-solidity)

## ⚠️ Important Notes

- This is an **educational example** - not production-ready
- Decryption requests require a small ETH payment (~0.001 ETH)
- Block time estimates are approximate (~2 seconds per block on Base Sepolia)
- Messages are stored on-chain permanently

## 📄 License

MIT License - feel free to use for learning and development.

---

**Built with ❤️ by Web3compass using dcipher blocklock encryption**
