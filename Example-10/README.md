# Example 10: Cross-Chain Payment Gateway

Accept payments on one chain, settle to another using OnlySwaps.

## Overview

A payment gateway that accepts payments on Avalanche Fuji and settles to Base Sepolia via OnlySwaps cross-chain protocol.

## Architecture

```
Avalanche Fuji (43113)  →  OnlySwaps  →  Base Sepolia (84532)
     [Payer]                              [Merchant]
```

## Networks

| Network | Chain ID | Router | RUSD Token |
|---------|----------|--------|------------|
| Avalanche Fuji | 43113 | `0x16323707e61d20A39AaE5ab64808e480B91658aB` | `0xFDdcB87aFED6B20cF7616A7339Bc5f8aC37154C3` |
| Base Sepolia | 84532 | `0x16323707e61d20A39AaE5ab64808e480B91658aB` | `0x9Eb392A6286138E5d59a40Da5398e567Ab3AAd7c` |

## Setup

```bash
npm install
cp .env.example .env
```

## Usage

```bash
npm run deploy:avax      # Deploy to Avalanche Fuji
npm run test:payment     # Test payment flow
npm run check:status     # Check payment status
```

## Contract Functions

- `registerMerchant(address settlementAddress)` - Register as merchant
- `makePayment(...)` - Make a cross-chain payment
- `getPayment(bytes32 paymentId)` - Get payment details
- `isPaymentSettled(bytes32 paymentId)` - Check if payment settled

## Frontend

```bash
cd frontend
npm install
npm run dev
```
