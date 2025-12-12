# dCipher Randomness Demo - DiceRoller

A demonstration project showcasing how to integrate [dCipher's verifiable randomness oracle](https://dcipher.io) into Ethereum smart contracts. This project implements a simple dice rolling application that uses cryptographically secure, verifiable random numbers on-chain.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Smart Contract Details](#smart-contract-details)
- [How It Works](#how-it-works)
- [Testing](#testing)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Security Considerations](#security-considerations)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

This project demonstrates the integration of dCipher's randomness oracle to create a provably fair dice rolling smart contract. The DiceRoller contract requests verifiable random numbers from the dCipher oracle and converts them into dice rolls (numbers 1-6).

### Why Verifiable Randomness?

Traditional smart contracts cannot generate truly random numbers because blockchain execution must be deterministic. dCipher solves this by providing:

- **Verifiable randomness**: Cryptographically proven random values
- **Tamper-proof**: Cannot be manipulated by miners or validators
- **On-chain verification**: Randomness can be verified directly on the blockchain
- **Asynchronous delivery**: Oracle fulfills requests after block confirmation

## ✨ Features

- **Simple dice rolling**: Request a random dice roll (1-6) on-chain
- **Verifiable randomness**: Uses dCipher's oracle for cryptographically secure random numbers
- **Event-driven**: Emits events for dice rolls and randomness receipt
- **Gas-efficient**: Optimized Solidity code with minimal storage
- **Well-documented**: Comprehensive NatSpec and JSDoc comments throughout
- **Production-ready**: Deployed and tested on Base Sepolia testnet

## 🏗️ Architecture

```
┌─────────────┐         ┌──────────────────┐         ┌─────────────────┐
│   User      │────────▶│  DiceRoller      │────────▶│  dCipher Oracle │
│             │         │  Contract        │         │  (RandomnessSender)
└─────────────┘         └──────────────────┘         └─────────────────┘
                               │                              │
                               │                              │
                               │      ◀───────────────────────┘
                               │      (Callback with randomness)
                               │
                               ▼
                        ┌──────────────┐
                        │  Dice Result │
                        │    (1-6)     │
                        └──────────────┘
```

### Flow:

1. User calls `rollDice()` with payment for oracle fee
2. Contract requests randomness from dCipher oracle
3. Oracle generates verifiable random number
4. Oracle calls back contract with randomness
5. Contract stores randomness and emits event
6. User queries `getLatestDiceRoll()` to see result

## 📦 Prerequisites

- **Node.js**: v16.x or higher
- **npm**: v7.x or higher
- **Hardhat**: Installed via npm (included in dependencies)
- **Base Sepolia ETH**: For deploying and testing (get from [faucet](https://www.coinbase.com/faucets/base-ethereum-goerli-faucet))
- **Wallet**: MetaMask or similar with private key for deployment

## 🚀 Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/dcipher-randomness-demo.git
   cd dcipher-randomness-demo
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Verify installation**:
   ```bash
   npx hardhat --version
   ```

## ⚙️ Configuration

1. **Create environment file**:
   ```bash
   cp .env.example .env
   ```

2. **Configure environment variables** in `.env`:
   ```env
   BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
   BASE_SEPOLIA_PRIVATE_KEY=your_private_key_here
   ```

   ⚠️ **Security Warning**: Never commit your `.env` file or share your private key!

3. **Update contract addresses** in scripts:
   - After deployment, update the `diceRollerAddress` in:
     - `scripts/rollDice.js`
     - `scripts/checkRandomness.js`

## 📖 Usage

### Deploy the Contract

Deploy to Base Sepolia testnet:

```bash
npx hardhat run scripts/deploy.js --network baseSepolia
```

**Expected output**:
```
Deploying DiceRoller...
Deployer: 0x1234...5678
RandomnessSender: 0xf4e080Db4765C856c0af43e4A8C4e31aA3b48779
DiceRoller deployed to: 0xABCD...EF01
Roll count: 0
Latest request ID: 0
✅ Deployment complete
```

**Important**: Copy the deployed contract address and update it in `rollDice.js` and `checkRandomness.js`.

### Roll the Dice

Execute a dice roll:

```bash
npx hardhat run scripts/rollDice.js --network baseSepolia
```

**Expected output**:
```
Rolling the dice...

tx hash: 0x9876...5432
confirmed in block: 12345678
Request ID: 1
Now wait 10–30 seconds, then run checkRandomness.js
```

### Check the Result

After waiting 10-30 seconds for oracle fulfillment:

```bash
npx hardhat run scripts/checkRandomness.js --network baseSepolia
```

**Expected output**:
```
Randomness received: 0x1a2b3c4d...
Dice roll: 4
```

If randomness hasn't arrived yet:
```
Randomness not received yet. Wait a bit longer...
```

## 📁 Project Structure

```
dcipher-randomness-demo/
├── contracts/
│   └── DiceRoller.sol          # Main smart contract
├── scripts/
│   ├── deploy.js               # Deployment script
│   ├── rollDice.js             # Script to roll dice
│   └── checkRandomness.js      # Script to check result
├── hardhat.config.js           # Hardhat configuration
├── package.json                # Node.js dependencies
├── .env.example                # Environment template
├── .gitignore                  # Git ignore rules
└── README.md                   # This file
```

## 🔍 Smart Contract Details

### DiceRoller.sol

**Inherits**: `RandomnessReceiverBase` (from `randomness-solidity` package)

**State Variables**:
- `latestRandomness`: Stores the most recent random value (bytes32)
- `latestRequestId`: Tracks the current randomness request ID
- `rollCount`: Total number of dice rolls performed

**Functions**:

| Function | Visibility | Description |
|----------|-----------|-------------|
| `constructor(address _randomnessSender, address _owner)` | Public | Initializes contract with oracle and owner addresses |
| `rollDice(uint32 callbackGasLimit)` | External, Payable | Requests randomness and initiates dice roll |
| `onRandomnessReceived(uint256 requestId, bytes32 randomness)` | Internal | Callback function for oracle to deliver randomness |
| `getLatestDiceRoll()` | External, View | Returns dice result (1-6) from latest randomness |

**Events**:
- `DiceRolled(uint256 indexed requestId, address indexed roller)`: Emitted when dice roll is initiated
- `RandomnessReceived(uint256 indexed requestId, bytes32 randomValue)`: Emitted when randomness is received

## 🔧 How It Works

### 1. Requesting Randomness

When `rollDice()` is called:
```solidity
function rollDice(uint32 callbackGasLimit) external payable returns (uint256) {
    (uint256 requestId, uint256 requestPrice) = _requestRandomnessPayInNative(callbackGasLimit);
    latestRequestId = requestId;
    rollCount++;
    emit DiceRolled(requestId, msg.sender);
    return requestId;
}
```

- User sends ETH to cover oracle fee
- Contract calls `_requestRandomnessPayInNative()` from parent contract
- Request ID is stored for validation
- `DiceRolled` event is emitted

### 2. Receiving Randomness

The oracle calls back with randomness:
```solidity
function onRandomnessReceived(uint256 requestId, bytes32 randomness) internal override {
    require(latestRequestId == requestId, "Unexpected request ID");
    latestRandomness = randomness;
    emit RandomnessReceived(requestId, randomness);
}
```

- Validates request ID matches
- Stores randomness value
- Emits `RandomnessReceived` event

### 3. Getting Dice Result

Users query the result:
```solidity
function getLatestDiceRoll() external view returns (uint256) {
    return (uint256(latestRandomness) % 6) + 1;
}
```

- Converts bytes32 to uint256
- Applies modulo 6 to get 0-5
- Adds 1 to get 1-6 range

## 🧪 Testing

Currently, this project focuses on testnet deployment. To add tests:

1. Create `test/DiceRoller.test.js`
2. Write unit tests using Hardhat's testing framework
3. Run tests:
   ```bash
   npx hardhat test
   ```

Example test structure:
```javascript
describe("DiceRoller", function () {
  it("Should deploy successfully", async function () {
    // Test deployment
  });
  
  it("Should increment roll count", async function () {
    // Test rollDice function
  });
});
```

## 🚢 Deployment

### Supported Networks

- **Base Sepolia** (Testnet): Configured and tested
- **Base Mainnet**: Update `hardhat.config.js` with mainnet RPC and oracle address

### Adding New Networks

1. Update `hardhat.config.js`:
   ```javascript
   networks: {
     newNetwork: {
       url: process.env.NEW_NETWORK_RPC_URL,
       accounts: [process.env.PRIVATE_KEY]
     }
   }
   ```

2. Update `.env` with new RPC URL

3. Get the correct RandomnessSender address from [dCipher docs](https://docs.dcipher.io)

4. Update `deploy.js` with the new oracle address

## 🐛 Troubleshooting

### Common Issues

**Issue**: Transaction reverts with "price was too low"
- **Solution**: Increase `valueToSend` in `rollDice.js` (try 0.0005 ETH)

**Issue**: "Randomness not received yet" persists
- **Solution**: Wait longer (up to 60 seconds during high network congestion)
- **Check**: Verify oracle is operational on [dCipher status page](https://status.dcipher.io)

**Issue**: Deployment fails
- **Solution**: Ensure you have enough Base Sepolia ETH
- **Check**: Verify RPC URL is correct in `.env`

**Issue**: Cannot find contract address
- **Solution**: Check deployment script output for contract address
- **Verify**: Contract exists on [Base Sepolia explorer](https://sepolia.basescan.org/)

## 🔒 Security Considerations

- **Private Keys**: Never commit private keys to version control
- **Environment Variables**: Use `.env` for sensitive data
- **Oracle Trust**: This demo trusts dCipher oracle; verify oracle security for production
- **Gas Limits**: Set appropriate callback gas limits to prevent DoS
- **Reentrancy**: Not applicable in this simple contract, but consider for complex logic
- **Access Control**: Owner-only functions inherited from `RandomnessReceiverBase`

## 🤝 Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Resources

- [dCipher Documentation](https://docs.dcipher.io)
- [Hardhat Documentation](https://hardhat.org/docs)
- [Base Network](https://base.org)
- [Solidity Documentation](https://docs.soliditylang.org)

## 📧 Support

For issues and questions:
- Open an issue on [GitHub Issues](https://github.com/yourusername/dcipher-randomness-demo/issues)
- Check [dCipher Discord](https://discord.gg/dcipher)
- Review [dCipher Documentation](https://docs.dcipher.io)

---

**Built with ❤️ using dCipher Randomness Oracle**
