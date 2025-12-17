import { useEffect } from 'react'
import { useChainId } from 'wagmi'
import { useDrawWinner, useLottery } from '../hooks/useLottery'

export function DrawWinner({ lotteryId, onSuccess }) {
  const chainId = useChainId()
  const { lotteryAddress } = useLottery(chainId)
  const { drawWinner, isPending, isConfirming, isSuccess } = useDrawWinner()

  useEffect(() => {
    if (isSuccess) {
      onSuccess?.()
    }
  }, [isSuccess, onSuccess])

  const handleDraw = async () => {
    try {
      await drawWinner(lotteryAddress, lotteryId)
    } catch (error) {
      console.error('Draw winner failed:', error)
    }
  }

  return (
    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
      <p className="text-yellow-200 text-sm mb-3">
        ⏰ Lottery has ended! Anyone can trigger the random winner selection.
      </p>
      <button
        onClick={handleDraw}
        disabled={isPending || isConfirming}
        className="w-full px-6 py-3 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition"
      >
        {isPending || isConfirming ? 'Drawing Winner...' : 'Draw Winner (Costs ~0.001 ETH)'}
      </button>
      {isConfirming && (
        <p className="text-white/60 text-sm mt-2 text-center">
          Waiting for dcipher network to generate randomness... (1-2 minutes)
        </p>
      )}
    </div>
  )
}
