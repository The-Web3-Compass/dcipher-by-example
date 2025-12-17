import { useState } from 'react';
import { useBlockNumber, useReadContract } from 'wagmi';
import { MARKETPLACE_ADDRESS, LISTING_STATE_LABELS } from '../config/constants';
import { MARKETPLACE_ABI } from '../contracts/abi';
import ListingCard from './ListingCard';
import { formatUnits } from 'viem';

export default function BrowseListings() {
    const { data: blockNumber } = useBlockNumber({ watch: true });
    const { data: listingCounter } = useReadContract({
        address: MARKETPLACE_ADDRESS,
        abi: MARKETPLACE_ABI,
        functionName: 'listingCounter',
    });

    // In a production app, you'd use events or a subgraph to fetch all listings
    // For now, we'll fetch listings based on the counter
    const totalListings = listingCounter ? Number(listingCounter) : 0;
    const listingIds = Array.from({ length: totalListings }, (_, i) => i + 1);

    return (
        <div>
            {/* Premium Header */}
            <div className="mb-8">
                <div className="card bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-3xl font-bold mb-2 flex items-center gap-2">
                                <span>🏪</span> Active Listings
                            </h2>
                            <p className="text-blue-100">
                                Browse items and submit encrypted bids
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="text-sm text-blue-100 mb-1">Current Block</div>
                            <div className="text-3xl font-bold bg-white/20 rounded-xl px-4 py-2">
                                {blockNumber ? Number(blockNumber).toLocaleString() : '...'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {totalListings === 0 ? (
                <div className="card text-center py-20">
                    <div className="text-7xl mb-6 animate-bounce">🔒</div>
                    <h3 className="text-2xl font-bold text-slate-800 mb-3">No Listings Yet</h3>
                    <p className="text-slate-600 mb-6 max-w-md mx-auto">
                        Be the first to create a sealed bid listing and start the auction!
                    </p>
                    <div className="info-box max-w-md mx-auto">
                        <p className="text-sm text-blue-800">
                            💡 Listings will appear here once created. Click "Create" tab to get started!
                        </p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {listingIds.map((listingId) => (
                        <ListingItem key={listingId} listingId={listingId} currentBlock={Number(blockNumber)} />
                    ))}
                </div>
            )}
        </div>
    );
}

// Component to fetch and display individual listing
function ListingItem({ listingId, currentBlock }) {
    const { data: listing, isLoading, refetch } = useReadContract({
        address: MARKETPLACE_ADDRESS,
        abi: MARKETPLACE_ABI,
        functionName: 'getListing',
        args: [BigInt(listingId)],
        watch: true, // Auto-refresh when data changes
        pollingInterval: 5000, // Poll every 5 seconds
    });

    if (isLoading) {
        return (
            <div className="card card-hover">
                <div className="skeleton h-48 mb-4"></div>
                <div className="skeleton h-6 mb-2 w-3/4"></div>
                <div className="skeleton h-4 mb-4 w-full"></div>
                <div className="skeleton h-10"></div>
            </div>
        );
    }

    if (!listing || listing[0] === 0n) {
        return null;
    }

    // Contract returns tuple: [id, seller, itemName, description, imageUrl, minimumBid, revealBlockHeight, endBlockHeight, state, winner, winningBid, totalBids, paymentReceived]
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

    return <ListingCard listing={listingData} currentBlock={currentBlock} onBidSuccess={refetch} />;
}

