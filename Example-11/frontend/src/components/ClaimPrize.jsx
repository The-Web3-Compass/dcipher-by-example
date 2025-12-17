import { useState, useEffect } from 'react'
import { useChainId } from 'wagmi'
import { parseUnits, parseEther } from 'viem'
import { useClaimPrize, useClaimPrizeCrossChain, useLottery } from '../hooks/useLottery'
import { ADDRESSES } from '../config/contracts'

// RUSD has 6 decimals
const RUSD_DECIMALS = 6

export function ClaimPrize({ lotteryId, prizeAmount, onSuccess }) {
  const chainId = useChainId()
  const { lotteryAddress } = useLottery(chainId)
  const [claimType, setClaimType] = useState('same-chain')
  
  const { claimPrize, isPending: isClaimingSame, isConfirming: isConfirmingSame, isSuccess: isSuccessSame } = useClaimPrize()
  const { claimPrizeCrossChain, isPending: isClaimingCross, isConfirming: isConfirmingCross, isSuccess: isSuccessCross } = useClaimPrizeCrossChain()

  const isBaseSepolia = chainId === 84532
  const currentChainName = isBaseSepolia ? 'Base Sepolia' : 'Avalanche Fuji'
  const otherChainName = isBaseSepolia ? 'Avalanche Fuji' : 'Base Sepolia'
  const otherChainId = isBaseSepolia ? 43113 : 84532
  const otherChainAddresses = isBaseSepolia ? ADDRESSES.avalancheFuji : ADDRESSES.baseSepolia

  useEffect(() => {
    if (isSuccessSame || isSuccessCross) {
      onSuccess?.()
    }
  }, [isSuccessSame, isSuccessCross, onSuccess])

  const handleClaimSameChain = async () => {
    try {
      await claimPrize(lotteryAddress, lotteryId)
    } catch (error) {
      console.error('Claim failed:', error)
    }
  }

  const handleClaimCrossChain = async () => {
    try {
      const solverFee = parseUnits('0.1', RUSD_DECIMALS)
      await claimPrizeCrossChain(
        lotteryAddress,
        lotteryId,
        otherChainId,
        otherChainAddresses.rusd,
        solverFee
      )
    } catch (error) {
      console.error('Cross-chain claim failed:', error)
    }
  }

  return (
    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-6">
      <h3 className="text-xl font-bold text-white mb-4">🎉 Claim Your Prize!</h3>
      
      <div className="mb-4">
        <p className="text-white/80 text-sm mb-2">Choose how to claim:</p>
        <div className="space-y-2">
          <label className="flex items-center gap-3 p-3 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition">
            <input
              type="radio"
              name="claimType"
              value="same-chain"
              checked={claimType === 'same-chain'}
              onChange={(e) => setClaimType(e.target.value)}
              className="w-4 h-4"
            />
            <div>
              <p className="text-white font-medium">Claim on {currentChainName}</p>
              <p className="text-white/60 text-sm">Receive {prizeAmount} RUSD on this chain</p>
            </div>
          </label>
          
          <label className="flex items-center gap-3 p-3 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition">
            <input
              type="radio"
              name="claimType"
              value="cross-chain"
              checked={claimType === 'cross-chain'}
              onChange={(e) => setClaimType(e.target.value)}
              className="w-4 h-4"
            />
            <div>
              <p className="text-white font-medium">Claim on {otherChainName}</p>
              <p className="text-white/60 text-sm">
                Receive ~{(parseFloat(prizeAmount) - 0.1).toFixed(2)} RUSD on {otherChainName}
              </p>
              <p className="text-yellow-200 text-xs mt-1">
                ⚡ Uses OnlySwaps (0.1 RUSD solver fee)
              </p>
            </div>
          </label>
        </div>
      </div>

      {claimType === 'same-chain' ? (
        <button
          onClick={handleClaimSameChain}
          disabled={isClaimingSame || isConfirmingSame}
          className="w-full px-6 py-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition"
        >
          {isClaimingSame || isConfirmingSame ? 'Claiming...' : 'Claim Prize'}
        </button>
      ) : (
        <button
          onClick={handleClaimCrossChain}
          disabled={isClaimingCross || isConfirmingCross}
          className="w-full px-6 py-3 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition"
        >
          {isClaimingCross || isConfirmingCross ? 'Initiating Cross-Chain Transfer...' : 'Claim Cross-Chain'}
        </button>
      )}

      {isConfirmingCross && (
        <p className="text-white/60 text-sm mt-3 text-center">
          Cross-chain transfer initiated. Solvers will fulfill your swap shortly.
        </p>
      )}
    </div>
  )
}
