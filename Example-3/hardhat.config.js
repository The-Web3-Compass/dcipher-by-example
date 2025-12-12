/**
 * @fileoverview Hardhat configuration for dCipher Randomness Demo
 * @description Configures Hardhat for compiling, testing, and deploying
 * the DiceRoller smart contract to various networks.
 */

require("@nomicfoundation/hardhat-toolbox");
const dotenv = require("dotenv");

// Load environment variables from .env file
dotenv.config();

/**
 * Hardhat configuration object
 * @type {import('hardhat/config').HardhatUserConfig}
 */
module.exports = {
  /**
   * Solidity compiler configuration
   */
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200  // Optimizes for ~200 function calls (balanced for deployment and runtime costs)
      }
    }
  },
  
  /**
   * Network configurations
   */
  networks: {
    /**
     * Local Hardhat network for testing
     */
    hardhat: {
      chainId: 31337
    },
    
    /**
     * Base Sepolia testnet configuration
     * @requires BASE_SEPOLIA_RPC_URL environment variable
     * @requires BASE_SEPOLIA_PRIVATE_KEY environment variable
     */
    baseSepolia: {
      url: process.env.BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org",
      accounts: process.env.BASE_SEPOLIA_PRIVATE_KEY 
        ? [process.env.BASE_SEPOLIA_PRIVATE_KEY] 
        : []
    }
  }
};