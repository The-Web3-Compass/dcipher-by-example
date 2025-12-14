# 🎰 Fair Lottery dApp

A decentralized lottery application powered by **dcipher verifiable randomness** on Base Sepolia testnet. This project demonstrates provably fair winner selection using on-chain randomness.

## ✨ Features

- 🎲 **Provably Fair Randomness** - Uses dcipher's verifiable random number generation
- 🎫 **Simple Ticket Purchase** - Buy lottery tickets with ETH
- 🏆 **Automatic Winner Selection** - Winner is selected randomly when lottery closes
- 💰 **Transparent Prize Distribution** - 95% to winner, 5% house fee
- 🔄 **Reusable Lottery** - Organizer can restart lottery after completion
- 🎨 **Modern UI** - Beautiful gradient design with confetti animations

## 🏗️ Tech Stack

### Smart Contracts
- **Solidity** ^0.8.20
- **Hardhat** - Development environment
- **dcipher Randomness** - Verifiable random number generation
- **Base Sepolia** - Testnet deployment

### Frontend
- **React** 18 with TypeScript
- **Vite** - Fast build tool
- **Wagmi** - React hooks for Ethereum
- **Viem** - TypeScript interface for Ethereum
- **TailwindCSS** - Styling (via custom CSS)

## 📋 Prerequisites

- Node.js >= 16
- MetaMask or compatible Web3 wallet
- Base Sepolia testnet ETH ([Get from faucet](https://www.coinbase.com/faucets/base-ethereum-goerli-faucet))

## 🚀 Getting Started

### 1. Clone and Install

```bash
cd Example-4
npm install
cd frontend && npm install && cd ..
```

### 2. Configure Environment

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` and add your values:

```env
SEPOLIA_RPC_URL=https://sepolia.base.org
PRIVATE_KEY=your_private_key_here
ETHERSCAN_API_KEY=your_basescan_api_key
RANDOMNESS_SENDER_ADDRESS=0xf4e080Db4765C856c0af43e4A8C4e31aA3b48779
```

⚠️ **NEVER commit your `.env` file!** It contains sensitive information.

### 3. Compile Contracts

```bash
npm run compile
```

### 4. Deploy Contract

Deploy to Base Sepolia testnet:

```bash
npm run deploy:sepolia
```

Save the deployed contract address from the output.

### 5. Update Frontend Config

Edit `frontend/src/config.ts` and update the contract address:

```typescript
export const CONTRACT_ADDRESS = "YOUR_DEPLOYED_CONTRACT_ADDRESS" as `0x${string}`;
```

### 6. Run Frontend

```bash
npm run frontend:dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## 🎮 How to Use

### For Players:
1. Connect your MetaMask wallet to Base Sepolia
2. Click "Buy Ticket" and pay 0.01 ETH
3. Wait for the organizer to close the lottery
4. If you win, prize is automatically sent to your wallet! 🎉

### For Organizer:
1. Deploy the contract (you become the organizer)
2. Wait for players to buy tickets
3. Click "Close Lottery & Pick Winner"
4. Send 0.001 ETH to pay for dcipher randomness
5. Wait for dcipher oracle to provide randomness (~30-60 seconds)
6. Winner is automatically selected and paid
7. Click "🔄 Start New Lottery" to restart

## 📝 Smart Contract Functions

### Public Functions
- `buyTicket()` - Purchase a lottery ticket
- `closeLotteryAndRequestRandomness()` - Close lottery and request random winner (organizer only)
- `restartLottery()` - Reset lottery for new round (organizer only)
- `cancelAndRefund()` - Refund all players if randomness times out

### View Functions
- `ticketPrice()` - Get ticket price (0.01 ETH)
- `getPlayerCount()` - Get number of players
- `getPotSize()` - Get current prize pool
- `isLotteryOpen()` - Check if lottery is accepting tickets
- `winner()` - Get winner address (after selection)

## 🔐 Security Features

- ✅ Only organizer can close lottery
- ✅ Verifiable randomness from dcipher
- ✅ Automatic prize distribution
- ✅ Timeout protection with refund mechanism
- ✅ No central point of failure

## 🌐 Network Information

**Base Sepolia Testnet**
- Chain ID: `84532`
- RPC URL: `https://sepolia.base.org`
- Block Explorer: [https://sepolia.basescan.org](https://sepolia.basescan.org)
- dcipher RandomnessSender: `0xf4e080Db4765C856c0af43e4A8C4e31aA3b48779`

## 📚 Learn More

- [dcipher Documentation](https://docs.dcipher.network/)
- [Base Network](https://base.org/)
- [Hardhat Documentation](https://hardhat.org/)
- [Wagmi Documentation](https://wagmi.sh/)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - feel free to use this project for learning and development.

## 🙏 Acknowledgments

- Built with [dcipher](https://dcipher.network) verifiable randomness
- Inspired by the dcipher community examples
- UI design inspired by modern Web3 applications

---

**⚠️ Disclaimer**: This is a demo project for educational purposes. Use at your own risk on testnet only.
