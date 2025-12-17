import { useState, useEffect } from 'react'
import { useAccount, useChainId } from 'wagmi'
import { useLottery, useLotteryDetails, useUserEntries, useCanDraw } from '../hooks/useLottery'
import { LOTTERY_STATE } from '../config/contracts'
import { EnterLottery } from './EnterLottery'
import { DrawWinner } from './DrawWinner'
import { ClaimPrize } from './ClaimPrize'

export function LotteryCard({ lotteryId }) {
  const { address } = useAccount()
  const chainId = useChainId()
  const { lotteryAddress } = useLottery(chainId)
  const { lottery, isLoading, refetch } = useLotteryDetails(lotteryId, chainId)
  const { entryCount } = useUserEntries(lotteryId, address, lotteryAddress, chainId)
  const { canDraw } = useCanDraw(lotteryId, lotteryAddress, chainId)
  const [timeRemaining, setTimeRemaining] = useState('')

  useEffect(() => {
    if (!lottery) return

    const interval = setInterval(() => {
      const now = Math.floor(Date.now() / 1000)
      const remaining = lottery.endTime - now

      if (remaining <= 0) {
        setTimeRemaining('Ended')
        clearInterval(interval)
      } else {
        const hours = Math.floor(remaining / 3600)
        const minutes = Math.floor((remaining % 3600) / 60)
        const seconds = remaining % 60
        setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [lottery])

  if (isLoading) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-white">
        <div className="animate-pulse">Loading lottery...</div>
      </div>
    )
  }

  if (!lottery) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-white">
        <p>No active lottery found</p>
      </div>
    )
  }

  const isWinner = address && lottery.winner?.toLowerCase() === address.toLowerCase()
  const winningChance = lottery.participantCount > 0 
    ? ((entryCount / lottery.participantCount) * 100).toFixed(2) 
    : 0

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Lottery #{lottery.id}</h2>
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
            lottery.state === 0 ? 'bg-green-500/20 text-green-200' :
            lottery.state === 1 ? 'bg-yellow-500/20 text-yellow-200' :
            'bg-gray-500/20 text-gray-200'
          }`}>
            {LOTTERY_STATE[lottery.state]}
          </span>
        </div>
        <div className="text-right">
          <p className="text-white/60 text-sm">Prize Pool</p>
          <p className="text-4xl font-bold text-white">{lottery.prizePool} RUSD</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white/5 rounded-lg p-4">
          <p className="text-white/60 text-sm mb-1">Entry Fee</p>
          <p className="text-xl font-semibold text-white">{lottery.entryFee} RUSD</p>
        </div>
        <div className="bg-white/5 rounded-lg p-4">
          <p className="text-white/60 text-sm mb-1">Participants</p>
          <p className="text-xl font-semibold text-white">{lottery.participantCount}</p>
        </div>
        <div className="bg-white/5 rounded-lg p-4">
          <p className="text-white/60 text-sm mb-1">Your Entries</p>
          <p className="text-xl font-semibold text-white">{entryCount}</p>
        </div>
        <div className="bg-white/5 rounded-lg p-4">
          <p className="text-white/60 text-sm mb-1">Win Chance</p>
          <p className="text-xl font-semibold text-white">{winningChance}%</p>
        </div>
      </div>

      <div className="bg-white/5 rounded-lg p-4 mb-6">
        <p className="text-white/60 text-sm mb-1">Time Remaining</p>
        <p className="text-2xl font-bold text-white">{timeRemaining}</p>
      </div>

      {lottery.state === 2 && lottery.winner && (
        <div className="bg-white/5 rounded-lg p-4 mb-6">
          <p className="text-white/60 text-sm mb-1">Winner</p>
          <p className="text-lg font-mono text-white break-all">{lottery.winner}</p>
          {isWinner && !lottery.prizeClaimed && (
            <p className="text-green-400 font-semibold mt-2">🎉 You won! Claim your prize below</p>
          )}
          {lottery.prizeClaimed && (
            <p className="text-white/60 mt-2">Prize has been claimed</p>
          )}
        </div>
      )}

      <div className="space-y-4">
        {lottery.state === 0 && (
          <EnterLottery lotteryId={lottery.id} entryFee={lottery.entryFee} onSuccess={refetch} />
        )}
        
        {lottery.state === 0 && canDraw && (
          <DrawWinner lotteryId={lottery.id} onSuccess={refetch} />
        )}

        {lottery.state === 2 && isWinner && !lottery.prizeClaimed && (
          <ClaimPrize lotteryId={lottery.id} prizeAmount={lottery.prizePool} onSuccess={refetch} />
        )}
      </div>
    </div>
  )
}
