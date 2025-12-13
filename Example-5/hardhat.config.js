require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: {
    version: "0.8.27",    
    settings: {
      optimizer: {
        enabled: true,        
        runs: 200      }
    }
  },  
  
  networks: {
    hardhat: {
      chainId: 31337    },    
      baseSepolia: {
      url: process.env.BASE_SEPOLIA_RPC_URL || "",      
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
    }
  }
};