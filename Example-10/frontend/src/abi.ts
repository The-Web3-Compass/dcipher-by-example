export const PAYMENT_GATEWAY_ABI = [
  {
    "inputs": [
      { "internalType": "address", "name": "_routerAddress", "type": "address" },
      { "internalType": "uint256", "name": "_settlementChainId", "type": "uint256" },
      { "internalType": "address", "name": "_settlementToken", "type": "address" }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "merchant", "type": "address" },
      { "indexed": false, "internalType": "address", "name": "settlementAddress", "type": "address" }
    ],
    "name": "MerchantRegistered",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "merchant", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "MerchantWithdrawal",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "bytes32", "name": "paymentId", "type": "bytes32" },
      { "indexed": true, "internalType": "bytes32", "name": "orderId", "type": "bytes32" },
      { "indexed": true, "internalType": "address", "name": "merchant", "type": "address" },
      { "indexed": false, "internalType": "address", "name": "payer", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "sourceChainId", "type": "uint256" },
      { "indexed": false, "internalType": "address", "name": "sourceToken", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "amountPaid", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "expectedSettlement", "type": "uint256" },
      { "indexed": false, "internalType": "bytes32", "name": "swapRequestId", "type": "bytes32" }
    ],
    "name": "PaymentInitiated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "bytes32", "name": "paymentId", "type": "bytes32" },
      { "indexed": true, "internalType": "bytes32", "name": "orderId", "type": "bytes32" },
      { "indexed": true, "internalType": "address", "name": "merchant", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "amountSettled", "type": "uint256" }
    ],
    "name": "PaymentSettled",
    "type": "event"
  },
  {
    "inputs": [{ "internalType": "bytes32", "name": "paymentId", "type": "bytes32" }],
    "name": "getPayment",
    "outputs": [
      {
        "components": [
          { "internalType": "bytes32", "name": "orderId", "type": "bytes32" },
          { "internalType": "address", "name": "payer", "type": "address" },
          { "internalType": "address", "name": "merchant", "type": "address" },
          { "internalType": "address", "name": "sourceToken", "type": "address" },
          { "internalType": "uint256", "name": "sourceChainId", "type": "uint256" },
          { "internalType": "uint256", "name": "amountPaid", "type": "uint256" },
          { "internalType": "uint256", "name": "amountSettled", "type": "uint256" },
          { "internalType": "uint256", "name": "timestamp", "type": "uint256" },
          { "internalType": "enum CrossChainPaymentGateway.PaymentStatus", "name": "status", "type": "uint8" },
          { "internalType": "bytes32", "name": "swapRequestId", "type": "bytes32" }
        ],
        "internalType": "struct CrossChainPaymentGateway.Payment",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "merchant", "type": "address" }],
    "name": "getMerchantInfo",
    "outputs": [
      {
        "components": [
          { "internalType": "bool", "name": "isRegistered", "type": "bool" },
          { "internalType": "address", "name": "settlementAddress", "type": "address" },
          { "internalType": "uint256", "name": "totalReceived", "type": "uint256" },
          { "internalType": "uint256", "name": "pendingBalance", "type": "uint256" }
        ],
        "internalType": "struct CrossChainPaymentGateway.Merchant",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "merchant", "type": "address" }],
    "name": "getMerchantPayments",
    "outputs": [{ "internalType": "bytes32[]", "name": "", "type": "bytes32[]" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "bytes32", "name": "paymentId", "type": "bytes32" }],
    "name": "isPaymentSettled",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "merchant", "type": "address" },
      { "internalType": "bytes32", "name": "orderId", "type": "bytes32" },
      { "internalType": "address", "name": "tokenIn", "type": "address" },
      { "internalType": "uint256", "name": "amountIn", "type": "uint256" },
      { "internalType": "uint256", "name": "expectedSettlement", "type": "uint256" },
      { "internalType": "uint256", "name": "solverFee", "type": "uint256" }
    ],
    "name": "makePayment",
    "outputs": [{ "internalType": "bytes32", "name": "paymentId", "type": "bytes32" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "_settlementAddress", "type": "address" }],
    "name": "registerMerchant",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "router",
    "outputs": [{ "internalType": "contract IRouter", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "settlementChainId",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "settlementToken",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "_newAddress", "type": "address" }],
    "name": "updateSettlementAddress",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;

export const ERC20_ABI = [
  {
    "inputs": [
      { "internalType": "address", "name": "spender", "type": "address" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "approve",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "account", "type": "address" }],
    "name": "balanceOf",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "owner", "type": "address" },
      { "internalType": "address", "name": "spender", "type": "address" }
    ],
    "name": "allowance",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "symbol",
    "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
    "stateMutability": "view",
    "type": "function"
  },
] as const;
