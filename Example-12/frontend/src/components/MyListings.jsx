import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useBlockNumber } from 'wagmi';
import { MARKETPLACE_ADDRESS } from '../config/constants';
import { MARKETPLACE_ABI } from '../contracts/abi';
import { formatUnits } from 'viem';
import { useState } from 'react';
import { LISTING_STATE_LABELS, LISTING_STATES } from '../config/constants';

export default function MyListings() {
    const { address } = useAccount();
    const { data: blockNumber } = useBlockNumber({ watch: true });

    const { data: userListingIds } = useReadContract({
        address: MARKETPLACE_ADDRESS,
        abi: MARKETPLACE_ABI,
        functionName: 'getUserListings',
        args: address ? [address] : undefined,
        watch: true,
        pollingInterval: 5000,
    });

    const currentBlock = blockNumber ? Number(blockNumber) : 0;
    const listingIds = userListingIds || [];

    if (!address) {
        return (
            <div className="card text-center py-16">
                <div className="text-6xl mb-4">🔌</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Connect Your Wallet</h3>
                <p className="text-gray-500">
                    Connect your wallet to view your listings
                </p>
            </div>
        );
    }

    if (listingIds.length === 0) {
        return (
            <div className="card text-center py-16">
                <div className="text-6xl mb-4">📦</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No Listings Yet</h3>
                <p className="text-gray-500 mb-6">
                    You haven't created any listings yet
                </p>
                <p className="text-sm text-gray-400">
                    Go to "Create" tab to list your first item!
                </p>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-6">
                <h2 className="text-2xl font-bold">📋 My Listings</h2>
                <p className="text-gray-600 mt-1">
                    Manage your marketplace listings
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {listingIds.map((listingId) => (
                    <MyListingCard key={Number(listingId)} listingId={Number(listingId)} currentBlock={currentBlock} />
                ))}
            </div>
        </div>
    );
}

function MyListingCard({ listingId, currentBlock }) {
    const { data: listing, isLoading } = useReadContract({
        address: MARKETPLACE_ADDRESS,
        abi: MARKETPLACE_ABI,
        functionName: 'getListing',
        args: [BigInt(listingId)],
        watch: true,
        pollingInterval: 5000,
    });

    const { writeContract, data: hash, isPending } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

    const handleSelectWinner = async () => {
        try {
            await writeContract({
                address: MARKETPLACE_ADDRESS,
                abi: MARKETPLACE_ABI,
                functionName: 'selectWinner',
                args: [BigInt(listingId)],
            });
        } catch (error) {
            console.error('Error selecting winner:', error);
            alert('Failed to select winner: ' + error.message);
        }
    };

    if (isLoading) {
        return (
            <div className="card animate-pulse">
                <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-4"></div>
            </div>
        );
    }

    if (!listing || listing[0] === BigInt(0)) {
        return null;
    }

    const [id, seller, itemName, description, imageUrl, minimumBid, revealBlockHeight, endBlockHeight, state, winner, winningBid, totalBids, paymentReceived] = listing;

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

    const blocksUntilEnd = listingData.endBlockHeight - currentBlock;
    const canSelectWinner = blocksUntilEnd <= 0 && listingData.state === LISTING_STATES.ACTIVE && listingData.totalBids > 0;

    const getStatusColor = () => {
        switch (listingData.state) {
            case LISTING_STATES.ACTIVE:
                return 'bg-gradient-to-r from-green-500 to-emerald-600 text-white';
            case LISTING_STATES.ENDED:
                return 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white';
            case LISTING_STATES.SETTLED:
                return 'bg-gradient-to-r from-gray-400 to-gray-600 text-white';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="card border-2 border-primary-200">
            {listingData.imageUrl ? (
                <img
                    src={listingData.imageUrl}
                    alt={listingData.itemName}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                />
            ) : (
                <div className="w-full h-48 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg mb-4 flex items-center justify-center">
                    <span className="text-6xl">🎁</span>
                </div>
            )}

            <div className="flex justify-between items-start mb-3">
                <h3 className="text-xl font-bold text-gray-900">{listingData.itemName}</h3>
                <span className={`text-xs px-3 py-1 rounded-full font-semibold ${getStatusColor()}`}>
                    {LISTING_STATE_LABELS[listingData.state]}
                </span>
            </div>

            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{listingData.description}</p>

            <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm bg-gray-50 p-2 rounded">
                    <span className="text-gray-600">💰 Minimum Bid:</span>
                    <span className="font-bold text-primary-600">{listingData.minimumBid} RUSD</span>
                </div>

                <div className="flex justify-between text-sm bg-gray-50 p-2 rounded">
                    <span className="text-gray-600">📊 Total Bids:</span>
                    <span className="font-bold text-gray-900">{listingData.totalBids}</span>
                </div>

                {listingData.state === LISTING_STATES.ACTIVE && (
                    <div className="flex justify-between text-sm bg-blue-50 p-2 rounded border border-blue-200">
                        <span className="text-blue-800">⏰ Ends in:</span>
                        <span className="font-bold text-blue-900">
                            {blocksUntilEnd > 0 ? `${blocksUntilEnd.toLocaleString()} blocks` : 'Ended'}
                        </span>
                    </div>
                )}

                {listingData.state === LISTING_STATES.ENDED && listingData.winner && (
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-2xl">🏆</span>
                            <span className="font-bold text-green-900">Winner Selected</span>
                        </div>
                        <div className="text-green-700 text-xs font-mono mb-1">{listingData.winner.slice(0, 20)}...</div>
                        <div className="text-green-900 font-bold text-lg">{listingData.winningBid} RUSD</div>
                    </div>
                )}
            </div>

            {canSelectWinner && (
                <button
                    onClick={handleSelectWinner}
                    disabled={isPending || isConfirming}
                    className="btn-primary w-full text-lg font-semibold py-3 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700"
                >
                    {isPending ? '⏳ Approving...' : isConfirming ? '⏳ Selecting...' : '🏆 Select Winner'}
                </button>
            )}

            {isSuccess && (
                <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-3 text-green-800 text-sm">
                    ✅ Winner selected successfully!
                </div>
            )}

            {listingData.state === LISTING_STATES.ENDED && !listingData.paymentReceived && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
                    ⏳ Waiting for payment from winner
                </div>
            )}

            {listingData.state === LISTING_STATES.SETTLED && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800">
                    ✅ Payment received - Listing complete!
                </div>
            )}
        </div>
    );
}
