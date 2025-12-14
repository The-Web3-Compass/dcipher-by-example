import { useAccount, useConnect, useDisconnect, useBalance } from 'wagmi'
import { useLottery } from './hooks/useLottery'
import { LotteryCard } from './components/LotteryCard'
import { BuyTicketButton } from './components/BuyTicketButton'
import { WinnerAnnouncement } from './components/WinnerAnnouncement'
import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const { isOrganizer, closeLottery, isClosing, isOpen, playerCount, latestWinner } = useLottery()
  const { data: balance } = useBalance({ address, chainId: 84532 })
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    if (latestWinner) {
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 5000)
    }
  }, [latestWinner])

  if (!isConnected) {
    return (
      <div className="container">
        <h1>🎰 Fair Lottery</h1>
        <p className="subtitle">Powered by dcipher verifiable randomness</p>
        <button 
          onClick={() => connect({ connector: connectors[0] })}
          className="btn btn-primary"
        >
          Connect Wallet
        </button>
      </div>
    )
  }

  return (
    <>
      {showConfetti && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 9999 }}>
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="confetti"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-${Math.random() * 20}px`,
                background: ['#ff5000', '#ff7700', '#ffaa00', '#ffffff', '#000000'][Math.floor(Math.random() * 5)],
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      )}
      <div className="container">
        <h1>🎰 Fair Lottery</h1>
        <p className="subtitle">Powered by dcipher verifiable randomness</p>

        <div className="wallet-info">
          <div className="wallet-header">
            <span className="wallet-address">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
            <button onClick={() => disconnect()} className="btn-link">
              Disconnect
            </button>
          </div>
          <div className="wallet-balance">
            <span className="balance-label">Balance</span>
            <span className="balance-value">
              {balance ? `${parseFloat(balance.formatted).toFixed(4)} ${balance.symbol}` : '0.0000 ETH'}
            </span>
          </div>
        </div>

        <WinnerAnnouncement />
        
        <LotteryCard />

        <BuyTicketButton />

        {isOrganizer && (
          <button
            onClick={closeLottery}
            disabled={!isOpen || playerCount === 0 || isClosing}
            className="btn btn-secondary"
          >
            {isClosing ? 'Processing...' : 'Close Lottery & Pick Winner'}
          </button>
        )}

        <div className="footer">
          <p>Built on <a href="https://dcipher.network" target="_blank" rel="noopener noreferrer">dcipher</a> by <a href="https://web3compass.xyz" target="_blank" rel="noopener noreferrer">web3compass</a></p>
        </div>
      </div>
    </>
  )
}

export default App