import { useState, useEffect } from 'react'
import { useChainId } from 'wagmi'
import { useEnterLottery, useLottery } from '../hooks/useLottery'
import { useTokenBalance, useTokenAllowance, useApproveToken } from '../hooks/useToken'
import { useAccount } from 'wagmi'

export function EnterLottery({ lotteryId, entryFee, onSuccess }) {
  const { address } = useAccount()
  const chainId = useChainId()
  const { lotteryAddress, addresses } = useLottery(chainId)
  const [entries, setEntries] = useState(1)
  
  const { balance, refetch: refetchBalance } = useTokenBalance(addresses.rusd, address, chainId)
  const { allowance, refetch: refetchAllowance } = useTokenAllowance(
    addresses.rusd,
    address,
    lotteryAddress,
    chainId
  )
  
  const { approve, isPending: isApproving, isConfirming: isApprovingConfirming, isSuccess: isApproved } = useApproveToken()
  const { enterLottery, isPending: isEntering, isConfirming: isEnteringConfirming, isSuccess: isEntered } = useEnterLottery()

  const totalCost = (parseFloat(entryFee) * entries).toFixed(4)
  const needsApproval = parseFloat(allowance) < parseFloat(totalCost)

  useEffect(() => {
    if (isApproved) {
      refetchAllowance()
    }
  }, [isApproved, refetchAllowance])

  useEffect(() => {
    if (isEntered) {
      // Refetch all data after successful entry
      refetchBalance()
      refetchAllowance()
      onSuccess?.()
    }
  }, [isEntered, refetchBalance, refetchAllowance, onSuccess])

  const handleApprove = async () => {
    try {
      await approve(addresses.rusd, lotteryAddress, totalCost)
    } catch (error) {
      console.error('Approval failed:', error)
    }
  }

  const handleEnter = async () => {
    try {
      await enterLottery(lotteryAddress, lotteryId, entries)
    } catch (error) {
      console.error('Enter lottery failed:', error)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-white/80 text-sm mb-2">Number of Entries</label>
        <div className="flex gap-2">
          <button
            onClick={() => setEntries(Math.max(1, entries - 1))}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition"
          >
            -
          </button>
          <input
            type="number"
            value={entries}
            onChange={(e) => setEntries(Math.max(1, parseInt(e.target.value) || 1))}
            className="flex-1 px-4 py-2 bg-white/10 text-white rounded-lg text-center"
            min="1"
          />
          <button
            onClick={() => setEntries(entries + 1)}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition"
          >
            +
          </button>
        </div>
      </div>

      <div className="bg-white/5 rounded-lg p-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-white/60">Total Cost:</span>
          <span className="text-white font-semibold">{totalCost} RUSD</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-white/60">Your Balance:</span>
          <span className="text-white font-semibold">{parseFloat(balance).toFixed(4)} RUSD</span>
        </div>
      </div>

      {parseFloat(balance) < parseFloat(totalCost) && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
          <p className="text-red-200 text-sm">
            Insufficient RUSD balance. Get test tokens from{' '}
            <a 
              href="https://faucet.dcipher.network/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="underline hover:text-red-100"
            >
              faucet.dcipher.network
            </a>
          </p>
        </div>
      )}

      {needsApproval ? (
        <button
          onClick={handleApprove}
          disabled={isApproving || isApprovingConfirming || parseFloat(balance) < parseFloat(totalCost)}
          className="w-full px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition"
        >
          {isApproving || isApprovingConfirming ? 'Approving...' : `Approve ${totalCost} RUSD`}
        </button>
      ) : (
        <button
          onClick={handleEnter}
          disabled={isEntering || isEnteringConfirming || parseFloat(balance) < parseFloat(totalCost)}
          className="w-full px-6 py-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition"
        >
          {isEntering || isEnteringConfirming ? 'Entering...' : `Enter Lottery (${entries} ${entries === 1 ? 'entry' : 'entries'})`}
        </button>
      )}
    </div>
  )
}
