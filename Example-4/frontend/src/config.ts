import { createConfig, http } from 'wagmi'
import { baseSepolia } from 'wagmi/chains'
import { injected } from 'wagmi/connectors'

export const config = createConfig({
  chains: [baseSepolia],
  connectors: [injected()],
  transports: {
    [baseSepolia.id]: http(),
  },
})

export const CONTRACT_ADDRESS = "0xffC71a2e4EEEC17a4C6599C72B45160bEfd6C1A5" as `0x${string}`;

export const CONTRACT_ABI = [
  {
    "type": "function",
    "name": "buyTicket",
    "inputs": [],
    "outputs": [],
    "stateMutability": "payable"
  },
  {
    "type": "function",
    "name": "closeLotteryAndRequestRandomness",
    "inputs": [],
    "outputs": [],
    "stateMutability": "payable"
  },
  {
    "type": "function",
    "name": "ticketPrice",
    "inputs": [],
    "outputs": [{ "type": "uint256" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getPlayerCount",
    "inputs": [],
    "outputs": [{ "type": "uint256" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getPotSize",
    "inputs": [],
    "outputs": [{ "type": "uint256" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "isLotteryOpen",
    "inputs": [],
    "outputs": [{ "type": "bool" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "organizer",
    "inputs": [],
    "outputs": [{ "type": "address" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "winner",
    "inputs": [],
    "outputs": [{ "type": "address" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getPlayers",
    "inputs": [],
    "outputs": [{ "type": "address[]" }],
    "stateMutability": "view"
  },
  {
    "type": "event",
    "name": "TicketPurchased",
    "inputs": [
      { "type": "address", "name": "player", "indexed": true },
      { "type": "uint256", "name": "ticketNumber", "indexed": false }
    ]
  },
  {
    "type": "event",
    "name": "RandomnessRequested",
    "inputs": [
      { "type": "uint256", "name": "requestId", "indexed": true }
    ]
  },
  {
    "type": "event",
    "name": "WinnerPicked",
    "inputs": [
      { "type": "address", "name": "winner", "indexed": true },
      { "type": "uint256", "name": "prize", "indexed": false }
    ]
  },
  {
    "type": "event",
    "name": "LotteryClosed",
    "inputs": []
  }
] as const;