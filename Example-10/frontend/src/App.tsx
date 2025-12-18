import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { MerchantPanel } from './components/MerchantPanel'
import { PaymentPanel } from './components/PaymentPanel'
import { PaymentList } from './components/PaymentList'

function Snowflakes() {
  return (
    <div className="snowflakes">
      {[...Array(20)].map((_, i) => (
        <div key={i} className="snowflake">❄</div>
      ))}
    </div>
  );
}

function App() {
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()

  if (!isConnected) {
    return (
      <>
        <Snowflakes />
        <div className="connect-wrapper">
          <div className="connect-card">
            <h1>Cross-Chain Payment Gateway</h1>
            <p className="subtitle">🎄 Send gifts across chains this holiday season! 🎁</p>
            <p className="powered-by">Powered by OnlySwaps & dcipher network</p>
            <button 
              className="btn btn-primary"
              onClick={() => connect({ connector: connectors[0] })}
            >
              🎅 Connect Wallet
            </button>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Snowflakes />
      <div className="container">
        <header className="header">
          <h1>Cross-Chain Payment Gateway</h1>
          <div className="wallet-info">
            <span>{address?.slice(0, 6)}...{address?.slice(-4)}</span>
            <button className="btn btn-secondary" onClick={() => disconnect()}>
              Disconnect
            </button>
          </div>
        </header>

        <div className="grid">
          <MerchantPanel />
          <PaymentPanel />
        </div>

        <PaymentList />

        <footer>
          <p>Built with ❤️ by Web3Compass using only swaps on dcipher network</p>
        </footer>
      </div>
    </>
  )
}

export default App
