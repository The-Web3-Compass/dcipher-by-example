import { useLottery } from '../hooks/useLottery'

export function WinnerAnnouncement() {
  const { latestWinner, latestPrize, isWinner } = useLottery()

  if (!latestWinner) return null

  return (
    <div className="winner-card">
      <h2>{isWinner ? '🎊 You Won! 🎊' : '🎉 Winner Announced! 🎉'}</h2>
      <div className="winner-address">
        {latestWinner.slice(0, 6)}...{latestWinner.slice(-4)}
      </div>
      <p className="winner-prize">Prize: {latestPrize} ETH</p>
    </div>
  )
}