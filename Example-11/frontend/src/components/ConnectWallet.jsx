import { useEffect } from 'react'
import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from 'wagmi'
import { baseSepolia, avalancheFuji } from 'wagmi/chains'

export function ConnectWallet() {
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()

  const currentChain = chainId === baseSepolia.id ? 'Base Sepolia' : 
                       chainId === avalancheFuji.id ? 'Avalanche Fuji' : 'Unknown'

  useEffect(() => {
    if (isConnected && chainId !== baseSepolia.id) {
      switchChain({ chainId: baseSepolia.id })
    }
  }, [isConnected, chainId, switchChain])

  if (isConnected) {
    return (
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-white/80">Network:</span>
          <span className="px-3 py-1 bg-white/10 rounded-lg text-sm font-medium text-white">
            {currentChain}
          </span>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => switchChain({ chainId: baseSepolia.id })}
            disabled={chainId === baseSepolia.id}
            className="px-3 py-1 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm text-white transition"
          >
            Base
          </button>
          <button
            onClick={() => switchChain({ chainId: avalancheFuji.id })}
            disabled={chainId === avalancheFuji.id}
            className="px-3 py-1 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm text-white transition"
          >
            Avalanche
          </button>
        </div>

        <div className="px-4 py-2 bg-white/10 rounded-lg">
          <span className="text-sm text-white font-mono">
            {address?.slice(0, 6)}...{address?.slice(-4)}
          </span>
        </div>

        <button
          onClick={() => disconnect()}
          className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-200 rounded-lg text-sm font-medium transition"
        >
          Disconnect
        </button>
      </div>
    )
  }

  const handleConnect = async () => {
    await connect({ connector: connectors[0] })
  }

  return (
    <button
      onClick={handleConnect}
      className="px-6 py-3 bg-white text-purple-600 rounded-lg font-semibold hover:bg-white/90 transition shadow-lg"
    >
      Connect Wallet
    </button>
  )
}
