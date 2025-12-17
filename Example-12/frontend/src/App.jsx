import { useState } from 'react';
import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';
import Header from './components/Header';
import BrowseListings from './components/BrowseListings';
import CreateListing from './components/CreateListing';
import MyBids from './components/MyBids';
import MyListings from './components/MyListings';

function App() {
    const [activeTab, setActiveTab] = useState('browse');
    const { address, isConnected } = useAccount();
    const chainId = useChainId();
    const { switchChain } = useSwitchChain();

    // Ensure user is on Base Sepolia for creating listings/bids
    const ensureCorrectChain = async () => {
        if (chainId !== baseSepolia.id) {
            await switchChain({ chainId: baseSepolia.id });
        }
    };

    const tabs = [
        { id: 'browse', label: 'Browse', icon: '🔍' },
        { id: 'create', label: 'Create', icon: '➕' },
        { id: 'mybids', label: 'My Bids', icon: '🎯' },
        { id: 'mylistings', label: 'My Listings', icon: '📋' }
    ];

    return (
        <div className="min-h-screen">
            <Header />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {!isConnected ? (
                    <div className="flex items-center justify-center min-h-[70vh]">
                        <div className="card max-w-2xl w-full text-center transform hover:scale-105 transition-transform duration-300">
                            <div className="mb-6">
                                <div className="text-6xl mb-4">🔒</div>
                                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3">
                                    Sealed Bid Marketplace
                                </h1>
                                <p className="text-lg text-slate-600">
                                    Powered by dcipher's blocklock encryption
                                </p>
                            </div>

                            <div className="space-y-4 mb-8">
                                <div className="info-box text-left">
                                    <h3 className="font-semibold text-blue-900 mb-2">🎯 How It Works</h3>
                                    <ul className="text-sm text-blue-800 space-y-1">
                                        <li>• Bids are encrypted and hidden until the auction ends</li>
                                        <li>• No front-running - fair auctions for everyone</li>
                                        <li>• Cross-chain payments via OnlySwaps</li>
                                    </ul>
                                </div>

                                <div className="success-box text-left">
                                    <h3 className="font-semibold text-emerald-900 mb-2">✨ Features</h3>
                                    <ul className="text-sm text-emerald-800 space-y-1">
                                        <li>• Time-locked bid reveals using blocklock</li>
                                        <li>• Secure on-chain winner selection</li>
                                        <li>• Pay from any supported chain</li>
                                    </ul>
                                </div>
                            </div>

                            <p className="text-slate-500 text-sm">
                                Connect your wallet to get started
                            </p>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Premium Tab Navigation */}
                        <div className="mb-8">
                            <div className="card p-2">
                                <nav className="flex space-x-2">
                                    {tabs.map((tab) => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold transition-all duration-200 ${activeTab === tab.id
                                                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                                }`}
                                        >
                                            <span className="text-lg">{tab.icon}</span>
                                            <span className="hidden sm:inline">{tab.label}</span>
                                        </button>
                                    ))}
                                </nav>
                            </div>
                        </div>

                        {/* Tab Content with Fade Transition */}
                        <div className="animate-fadeIn">
                            {activeTab === 'browse' && <BrowseListings />}
                            {activeTab === 'create' && <CreateListing onSuccess={() => setActiveTab('mylistings')} />}
                            {activeTab === 'mybids' && <MyBids />}
                            {activeTab === 'mylistings' && <MyListings />}
                        </div>
                    </>
                )}
            </main>

            {/* Footer */}
            <footer className="mt-16 py-8 border-t border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center text-slate-500 text-sm">
                        <p className="mb-2">Powered by dcipher primitives: blocklock + OnlySwaps</p>
                        <p className="text-xs">Example 12 - Sealed Bid Marketplace</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default App;
