import { useLottery } from '../hooks/useLottery'

export function LotteryCard() {
  const { ticketPrice, playerCount, potSize, isOpen, winner } = useLottery()

  const getStatus = () => {
    if (winner && winner !== '0x0000000000000000000000000000000000000000') {
      return 'Completed'
    }
    if (isOpen) return 'Open'
    return 'Awaiting randomness...'
  }

  return (
    <div className="lottery-card">
      <div className="stat-row">
        <span className="stat-label">Ticket Price:</span>
        <span className="stat-value">{ticketPrice || '-'} ETH</span>
      </div>
      <div className="stat-row">
        <span className="stat-label">Players:</span>
        <span className="stat-value">{playerCount}</span>
      </div>
      <div className="stat-row">
        <span className="stat-label">Prize Pool:</span>
        <span className="stat-value">{potSize || '-'} ETH</span>
      </div>
      <div className="stat-row">
        <span className="stat-label">Status:</span>
        <span className="stat-value">{getStatus()}</span>
      </div>
    </div>
  )
}