import { useLottery } from '../hooks/useLottery'

export function BuyTicketButton() {
  const { buyTicket, isBuying, isOpen } = useLottery()

  return (
    <button
      onClick={buyTicket}
      disabled={!isOpen || isBuying}
      className="btn btn-primary"
    >
      {isBuying ? 'Processing...' : 'Buy Ticket'}
    </button>
  )
}