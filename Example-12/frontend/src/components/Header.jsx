import { useAccount, useConnect, useDisconnect, useChainId } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';

export default function Header() {
    const { address, isConnected } = useAccount();
    const { connect, connectors } = useConnect();
    const { disconnect } = useDisconnect();
    const chainId = useChainId();

    const formatAddress = (addr) => {
        if (!addr) return '';
        return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    };

    const getChainName = () => {
        if (chainId === baseSepolia.id) return 'Base Sepolia';
        return 'Unknown Network';
    };

    return (
        <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            🔒 Sealed Bid Marketplace
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Powered by dcipher blocklock encryption & OnlySwaps
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        {isConnected ? (
                            <>
                                <div className="text-right">
                                    <div className="text-sm font-medium text-gray-900">
                                        {formatAddress(address)}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {getChainName()}
                                    </div>
                                </div>
                                <button
                                    onClick={() => disconnect()}
                                    className="btn-secondary text-sm"
                                >
                                    Disconnect
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => connect({ connector: connectors[0] })}
                                className="btn-primary"
                            >
                                Connect Wallet
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
