import { useState } from 'react';
import { useAccount, useReadContract, useBlockNumber, useWriteContract, useWaitForTransactionReceipt, useChainId } from 'wagmi';
import { MARKETPLACE_ADDRESS, LISTING_STATE_LABELS, LISTING_STATES, RUSD_TOKEN } from '../config/constants';
import { MARKETPLACE_ABI } from '../contracts/abi';
import { formatUnits, parseUnits } from 'viem';

export default function MyBids() {
    const { address } = useAccount();
    const { data: blockNumber } = useBlockNumber({ watch: true });

    const { data: userBidIds } = useReadContract({
        address: MARKETPLACE_ADDRESS,
        abi: MARKETPLACE_ABI,
        functionName: 'getUserBids',
        args: address ? [address] : undefined,
        watch: true,
        pollingInterval: 5000,
    });

    const currentBlock = blockNumber ? Number(blockNumber) : 0;
    const bidIds = userBidIds || [];

    if (!address) {
        return (
            <div className="card text-center py-16">
                <div className="text-6xl mb-4">🔌</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Connect Your Wallet</h3>
                <p className="text-gray-500">
                    Connect your wallet to view your bids
                </p>
            </div>
        );
    }

    if (bidIds.length === 0) {
        return (
            <div className="card text-center py-16">
                <div className="text-6xl mb-4">🎯</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No Bids Yet</h3>
                <p className="text-gray-500 mb-6">
                    You haven't placed any bids yet
                </p>
                <p className="text-sm text-gray-400">
                    Go to "Browse" tab to bid on items!
                </p>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-6">
                <h2 className="text-2xl font-bold">🎯 My Bids</h2>
                <p className="text-gray-600 mt-1">
                    Track your bids and see if you're winning
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {bidIds.map((bidId) => (
                    <MyBidCard key={Number(bidId)} bidId={Number(bidId)} currentBlock={currentBlock} />
                ))}
            </div>
        </div>
    );
}

function MyBidCard({ bidId, currentBlock }) {
    const { data: bid, isLoading: bidLoading } = useReadContract({
        address: MARKETPLACE_ADDRESS,
        abi: MARKETPLACE_ABI,
        functionName: 'getBid',
        args: [BigInt(bidId)],
        watch: true,
        pollingInterval: 5000,
    });

    const listingId = bid ? Number(bid[0]) : 0;

    const { data: listing, isLoading: listingLoading } = useReadContract({
        address: MARKETPLACE_ADDRESS,
        abi: MARKETPLACE_ABI,
        functionName: 'getListing',
        args: listingId > 0 ? [BigInt(listingId)] : undefined,
        watch: true,
        pollingInterval: 5000,
    });

    if (bidLoading || listingLoading) {
        return (
            <div className="card animate-pulse">
                <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
            </div>
        );
    }

    if (!bid || !listing) {
        return null;
    }

    const [, bidder, revealedAmount, revealed, timestamp] = bid;
    const [id, seller, itemName, description, imageUrl, minimumBid, revealBlockHeight, endBlockHeight, state, winner, winningBid, totalBids, paymentReceived] = listing;

    const bidData = {
        bidId,
        listingId: Number(id),
        bidder,
        revealedAmount: formatUnits(revealedAmount, 6),
        revealed,
        timestamp: Number(timestamp),
    };

    const listingData = {
        id: Number(id),
        seller,
        itemName,
        description,
        imageUrl,
        minimumBid: formatUnits(minimumBid, 6),
        revealBlockHeight: Number(revealBlockHeight),
        endBlockHeight: Number(endBlockHeight),
        state: Number(state),
        winner,
        winningBid: formatUnits(winningBid, 6),
        totalBids: Number(totalBids),
        paymentReceived,
    };

    const blocksUntilReveal = listingData.revealBlockHeight - currentBlock;
    const isWinner = listingData.winner && listingData.winner.toLowerCase() === bidder.toLowerCase();

    const getBidStatus = () => {
        if (listingData.state === LISTING_STATES.SETTLED) {
            return isWinner ? '🏆 Won & Paid' : '❌ Lost';
        }
        if (listingData.state === LISTING_STATES.ENDED) {
            return isWinner ? '🏆 Winner!' : '❌ Lost';
        }
        if (revealed) {
            return isWinner ? '🎯 Winning' : '📊 Revealed';
        }
        return '🔒 Sealed';
    };

    const getStatusColor = () => {
        if (isWinner) return 'bg-gradient-to-r from-green-500 to-emerald-600 text-white';
        if (revealed) return 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white';
        return 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white';
    };

    return (
        <div className="card border-2 border-blue-200">
            <div className="flex justify-between items-start mb-3">
                <div>
                    <h3 className="text-lg font-bold text-gray-900">{listingData.itemName}</h3>
                    <p className="text-xs text-gray-500">Listing #{listingData.id}</p>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full font-semibold ${getStatusColor()}`}>
                    {getBidStatus()}
                </span>
            </div>

            <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm bg-gray-50 p-2 rounded">
                    <span className="text-gray-600">Your Bid:</span>
                    <span className="font-bold text-primary-600">
                        {revealed ? `${bidData.revealedAmount} RUSD` : '🔒 Hidden'}
                    </span>
                </div>

                {revealed && listingData.state !== LISTING_STATES.SETTLED && (
                    <div className="flex justify-between text-sm bg-gray-50 p-2 rounded">
                        <span className="text-gray-600">Current Highest:</span>
                        <span className="font-bold text-gray-900">
                            {listingData.winningBid > 0 ? `${listingData.winningBid} RUSD` : 'N/A'}
                        </span>
                    </div>
                )}

                <div className="flex justify-between text-sm bg-gray-50 p-2 rounded">
                    <span className="text-gray-600">Listing Status:</span>
                    <span className="font-semibold text-gray-900">
                        {LISTING_STATE_LABELS[listingData.state]}
                    </span>
                </div>

                {!revealed && blocksUntilReveal > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 text-xs text-yellow-800">
                        🔓 Reveals in {blocksUntilReveal.toLocaleString()} blocks
                    </div>
                )}

                {isWinner && listingData.state === LISTING_STATES.ENDED && !listingData.paymentReceived && (
                    <div className="space-y-3">
                        <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-2xl">🎉</span>
                                <p className="text-green-900 font-bold text-lg">You Won!</p>
                            </div>
                            <div className="bg-white rounded p-2 mb-2">
                                <p className="text-xs text-gray-600">Payment Required:</p>
                                <p className="text-green-900 font-bold text-xl">{listingData.winningBid} RUSD</p>
                            </div>
                            <p className="text-green-700 text-xs mb-3">
                                Complete payment to claim your item
                            </p>
                            <PaymentButton listingId={listingData.id} winningBid={listingData.winningBid} />
                        </div>
                    </div>
                )}

                {isWinner && listingData.state === LISTING_STATES.SETTLED && (
                    <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4 text-center">
                        <span className="text-4xl mb-2 block">✅</span>
                        <p className="text-green-900 font-bold text-lg">Purchase Complete!</p>
                        <p className="text-green-700 text-sm mt-1">The seller will deliver your item</p>
                    </div>
                )}

                {!isWinner && listingData.state === LISTING_STATES.ENDED && (
                    <div className="bg-gray-50 border border-gray-300 rounded-lg p-3 text-center">
                        <p className="text-gray-600 text-sm">Better luck next time!</p>
                        <p className="text-xs text-gray-500 mt-1">Winner: {listingData.winner.slice(0, 10)}...</p>
                    </div>
                )
                }
            </div>
        </div>
    );
}


// Payment button component for winners
function PaymentButton({ listingId, winningBid }) {
    const chainId = useChainId();
    const [step, setStep] = useState('select'); // 'select', 'approve', 'pay'
    const [paymentChain, setPaymentChain] = useState(chainId); // Default to current chain
    const [isCrossChain, setIsCrossChain] = useState(false);

    const { writeContract: approveWrite, data: approveHash, isPending: approveIsPending } = useWriteContract();
    const { isLoading: approveIsConfirming, isSuccess: approveIsSuccess } = useWaitForTransactionReceipt({ hash: approveHash });

    const { writeContract: payWrite, data: payHash, isPending: payIsPending } = useWriteContract();
    const { isLoading: payIsConfirming, isSuccess: payIsSuccess } = useWaitForTransactionReceipt({ hash: payHash });

    // Available chains for payment
    const availableChains = [
        { id: 84532, name: 'Base Sepolia', icon: '🔵' },
        { id: 43113, name: 'Avalanche Fuji', icon: '🔺' }
    ];

    // Auto-advance to payment step after approval
    if (approveIsSuccess && step === 'approve') {
        setStep('pay');
    }

    const handleChainSelect = (selectedChainId) => {
        setPaymentChain(selectedChainId);
        setIsCrossChain(selectedChainId !== chainId);
        setStep('approve');
    };

    const handleApprove = async () => {
        try {
            const RUSD_ADDRESS = RUSD_TOKEN[paymentChain];

            if (!RUSD_ADDRESS) {
                alert('RUSD token not supported on this chain');
                return;
            }

            await approveWrite({
                address: RUSD_ADDRESS,
                abi: [
                    {
                        name: 'approve',
                        type: 'function',
                        stateMutability: 'nonpayable',
                        inputs: [
                            { name: 'spender', type: 'address' },
                            { name: 'amount', type: 'uint256' }
                        ],
                        outputs: [{ type: 'bool' }]
                    }
                ],
                functionName: 'approve',
                args: [MARKETPLACE_ADDRESS, parseUnits(winningBid, 6)],
            });
        } catch (error) {
            console.error('Error approving RUSD:', error);
            alert('Failed to approve RUSD: ' + error.message);
        }
    };

    const handlePayment = async () => {
        try {
            if (isCrossChain) {
                // Cross-chain payment via OnlySwaps
                const destinationToken = RUSD_TOKEN[paymentChain];
                const solverFee = parseUnits('0.1', 6); // 0.1 RUSD solver fee

                await payWrite({
                    address: MARKETPLACE_ADDRESS,
                    abi: MARKETPLACE_ABI,
                    functionName: 'payForItemCrossChain',
                    args: [
                        BigInt(listingId),
                        BigInt(paymentChain),
                        destinationToken,
                        solverFee
                    ],
                });
            } else {
                // Same-chain payment
                await payWrite({
                    address: MARKETPLACE_ADDRESS,
                    abi: MARKETPLACE_ABI,
                    functionName: 'payForItem',
                    args: [BigInt(listingId)],
                });
            }
        } catch (error) {
            console.error('Error making payment:', error);
            alert('Failed to process payment: ' + error.message);
        }
    };

    const selectedChain = availableChains.find(c => c.id === paymentChain);

    return (
        <div className="space-y-3">
            {/* Step 1: Chain Selection */}
            {step === 'select' && (
                <div className="space-y-3">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-blue-900 font-semibold text-sm mb-1">Choose Payment Chain</p>
                        <p className="text-blue-700 text-xs">Select which blockchain you want to pay from</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        {availableChains.map((chain) => (
                            <button
                                key={chain.id}
                                onClick={() => handleChainSelect(chain.id)}
                                className={`p-4 rounded-lg border-2 transition-all ${chain.id === chainId
                                    ? 'border-green-500 bg-green-50 hover:bg-green-100'
                                    : 'border-blue-500 bg-blue-50 hover:bg-blue-100'
                                    }`}
                            >
                                <div className="text-3xl mb-1">{chain.icon}</div>
                                <div className="font-semibold text-sm">{chain.name}</div>
                                {chain.id === chainId && (
                                    <div className="text-xs text-green-700 mt-1">✓ Current Chain</div>
                                )}
                                {chain.id !== chainId && (
                                    <div className="text-xs text-blue-700 mt-1">Cross-Chain</div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Step 2: Approve */}
            {step === 'approve' && (
                <div className="space-y-3">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl">{selectedChain?.icon}</span>
                            <div>
                                <p className="font-bold text-blue-900">Step 1: Approve RUSD</p>
                                <p className="text-xs text-blue-700">On {selectedChain?.name}</p>
                            </div>
                        </div>
                        {isCrossChain && (
                            <div className="bg-yellow-50 border border-yellow-300 rounded p-2 mt-2">
                                <p className="text-xs text-yellow-800">
                                    <strong>Cross-Chain Payment:</strong> OnlySwaps will handle the transfer
                                </p>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={handleApprove}
                        disabled={approveIsPending || approveIsConfirming}
                        className="btn-primary w-full text-lg font-semibold py-3 flex items-center justify-center gap-2"
                    >
                        {approveIsPending ? (
                            <>⏳ Approving...</>
                        ) : approveIsConfirming ? (
                            <>⏳ Confirming...</>
                        ) : (
                            <>✅ Approve {winningBid} RUSD</>
                        )}
                    </button>

                    <button
                        onClick={() => setStep('select')}
                        className="btn-secondary w-full text-sm py-2"
                    >
                        ← Change Chain
                    </button>
                </div>
            )}

            {/* Step 3: Pay */}
            {step === 'pay' && (
                <div className="space-y-3">
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl">{selectedChain?.icon}</span>
                            <div>
                                <p className="font-bold text-green-900">Step 2: Complete Payment</p>
                                <p className="text-xs text-green-700">Transfer to seller</p>
                            </div>
                        </div>
                        <div className="bg-white rounded p-3 mt-2">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Amount:</span>
                                <span className="font-bold text-lg text-green-900">{winningBid} RUSD</span>
                            </div>
                            {isCrossChain && (
                                <div className="flex justify-between items-center mt-1 pt-1 border-t">
                                    <span className="text-xs text-gray-500">Solver Fee:</span>
                                    <span className="text-xs text-gray-700">~0.1 RUSD</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={handlePayment}
                        disabled={payIsPending || payIsConfirming}
                        className="btn-primary w-full text-lg font-semibold py-3 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700"
                    >
                        {payIsPending ? (
                            <>⏳ Approving...</>
                        ) : payIsConfirming ? (
                            <>⏳ Processing...</>
                        ) : isCrossChain ? (
                            <>🌉 Pay Cross-Chain</>
                        ) : (
                            <>💳 Pay & Claim</>
                        )}
                    </button>
                </div>
            )}

            {/* Success Message */}
            {payIsSuccess && (
                <div className="bg-gradient-to-r from-green-100 to-emerald-100 border-2 border-green-400 rounded-lg p-4 text-center">
                    <span className="text-4xl block mb-2">🎉</span>
                    <p className="font-bold text-green-900 text-lg mb-1">Payment Successful!</p>
                    <p className="text-green-700 text-sm">The item is yours!</p>
                    {isCrossChain && (
                        <p className="text-green-600 text-xs mt-2">
                            Cross-chain transfer completed via OnlySwaps
                        </p>
                    )}
                    <p className="text-green-600 text-xs mt-2">
                        The seller will deliver your item
                    </p>
                </div>
            )}
        </div>
    );
}
