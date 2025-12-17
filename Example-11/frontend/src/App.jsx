import { useAccount, useChainId } from 'wagmi'
import { ConnectWallet } from './components/ConnectWallet'
import { LotteryCard } from './components/LotteryCard'
import { useLottery } from './hooks/useLottery'
import { LOTTERY_ADDRESS } from './config/contracts'

function App() {
  const { isConnected } = useAccount()
  const chainId = useChainId()
  const { currentLotteryId, lotteryAddress } = useLottery(chainId)

  console.log('=== DEBUG INFO ===')
  console.log('LOTTERY_ADDRESS from env:', LOTTERY_ADDRESS)
  console.log('lotteryAddress from hook:', lotteryAddress)
  console.log('currentLotteryId:', currentLotteryId)
  console.log('currentLotteryId type:', typeof currentLotteryId)
  console.log('chainId:', chainId)
  console.log('isConnected:', isConnected)

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            Cross-Chain Lottery
          </h1>
          <p className="text-xl text-white/80 mb-8">
            Win prizes on one chain, claim them on another using dcipher
          </p>
          {LOTTERY_ADDRESS && (
            <div className="mb-4 flex items-center justify-center gap-2">
              <span className="text-sm text-white/60">Contract:</span>
              <a
                href={`https://sepolia.basescan.org/address/${LOTTERY_ADDRESS}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-white/80 hover:text-white font-mono bg-white/10 px-3 py-1 rounded-lg hover:bg-white/20 transition"
              >
                {LOTTERY_ADDRESS.slice(0, 6)}...{LOTTERY_ADDRESS.slice(-4)}
              </a>
            </div>
          )}
          <div className="flex justify-center">
            <ConnectWallet />
          </div>
        </header>

        {!isConnected ? (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-12 text-center">
            <p className="text-white/80 text-lg">
              Connect your wallet to participate in the lottery
            </p>
          </div>
        ) : !currentLotteryId || currentLotteryId === 0n ? (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-12 text-center">
            <p className="text-white/80 text-lg">
              No active lottery on this network
            </p>
            <p className="text-white/60 text-sm mt-2">
              Contract owner needs to create a lottery first
            </p>
            <div className="mt-4 p-4 bg-white/5 rounded-lg text-left text-xs font-mono">
              <p className="text-white/60">Debug Info:</p>
              <p className="text-white/80">Contract: {LOTTERY_ADDRESS || 'NOT SET'}</p>
              <p className="text-white/80">Lottery ID: {currentLotteryId?.toString() || 'undefined'}</p>
              <p className="text-white/80">Chain ID: {chainId}</p>
              <p className="text-white/80">Type: {typeof currentLotteryId}</p>
            </div>
          </div>
        ) : (
          <LotteryCard lotteryId={currentLotteryId} />
        )}

        <footer className="mt-12 text-center">
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6">
            <h3 className="text-white font-semibold mb-3">How it works</h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm text-white/80">
              <div>
                <p className="font-medium text-white mb-1">1. Enter</p>
                <p>Buy entries with RUSD tokens</p>
              </div>
              <div>
                <p className="font-medium text-white mb-1">2. Draw</p>
                <p>dcipher randomness picks winner</p>
              </div>
              <div>
                <p className="font-medium text-white mb-1">3. Claim</p>
                <p>Winner claims on any supported chain</p>
              </div>
            </div>
          </div>
          <p className="text-white/60 text-sm mt-6">
            Powered by{' '}
            <a 
              href="https://docs.dcipher.network" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-white hover:underline"
            >
              dcipher network
            </a>
          </p>
        </footer>
      </div>
    </div>
  )
}

export default App
