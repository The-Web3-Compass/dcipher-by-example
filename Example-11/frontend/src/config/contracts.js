import LOTTERY_ARTIFACT from '../contracts/abi.json'

export const LOTTERY_ABI = LOTTERY_ARTIFACT.abi

export const ERC20_ABI = [
  {
    "constant": true,
    "inputs": [{"name": "owner", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"name": "", "type": "uint256"}],
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {"name": "spender", "type": "address"},
      {"name": "amount", "type": "uint256"}
    ],
    "name": "approve",
    "outputs": [{"name": "", "type": "bool"}],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {"name": "owner", "type": "address"},
      {"name": "spender", "type": "address"}
    ],
    "name": "allowance",
    "outputs": [{"name": "", "type": "uint256"}],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "decimals",
    "outputs": [{"name": "", "type": "uint8"}],
    "type": "function"
  }
];

export const LOTTERY_ADDRESS = import.meta.env.VITE_LOTTERY_ADDRESS;

export const ADDRESSES = {
  baseSepolia: {
    rusd: import.meta.env.VITE_BASE_RUSD_ADDRESS,
    router: import.meta.env.VITE_BASE_ROUTER_ADDRESS,
  },
  avalancheFuji: {
    rusd: import.meta.env.VITE_AVAX_RUSD_ADDRESS,
    router: import.meta.env.VITE_AVAX_ROUTER_ADDRESS,
  },
};

export const LOTTERY_STATE = {
  0: "OPEN",
  1: "DRAWING",
  2: "CLOSED",
};
