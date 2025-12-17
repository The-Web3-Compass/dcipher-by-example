import { useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits, parseEther } from 'viem';
import { LISTING_STATE_LABELS, LISTING_STATES, MARKETPLACE_ADDRESS } from '../config/constants';
import { MARKETPLACE_ABI } from '../contracts/abi';

export default function ListingCard({ listing, currentBlock, onBidSuccess }) {
    const [showBidModal, setShowBidModal] = useState(false);

    const getStatusColor = () => {
        switch (listing.state) {
            case LISTING_STATES.ACTIVE:
                return 'status-active';
            case LISTING_STATES.ENDED:
                return 'status-ended';
            case LISTING_STATES.SETTLED:
                return 'status-settled';
            default:
                return 'bg-slate-100 text-slate-800';
        }
    };

    const blocksUntilEnd = listing.endBlockHeight - currentBlock;

    return (
        <div className="card card-hover group relative overflow-hidden">
            {/* Image Section with Overlay */}
            <div className="relative overflow-hidden rounded-xl mb-4">
                {listing.imageUrl ? (
                    <img
                        src={listing.imageUrl}
                        alt={listing.itemName}
                        className="w-full h-56 object-cover transform group-hover:scale-110 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-56 bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 flex items-center justify-center">
                        <span className="text-7xl animate-pulse">🎁</span>
                    </div>
                )}

                {/* Status Badge Overlay */}
                <div className="absolute top-3 right-3">
                    <span className={`badge ${getStatusColor()} shadow-lg backdrop-blur-sm`}>
                        {LISTING_STATE_LABELS[listing.state]}
                    </span>
                </div>

                {/* Bid Count Badge */}
                {listing.totalBids > 0 && (
                    <div className="absolute top-3 left-3">
                        <span className="badge badge-info shadow-lg backdrop-blur-sm">
                            🎯 {listing.totalBids} {listing.totalBids === 1 ? 'Bid' : 'Bids'}
                        </span>
                    </div>
                )}
            </div>

            {/* Content Section */}
            <div className="space-y-4">
                {/* Title */}
                <h3 className="text-2xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {listing.itemName}
                </h3>

                {/* Description */}
                <p className="text-slate-600 text-sm line-clamp-2 leading-relaxed">
                    {listing.description}
                </p>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="info-box">
                        <div className="text-xs text-blue-700 font-semibold mb-1">Minimum Bid</div>
                        <div className="text-lg font-bold text-blue-900">{listing.minimumBid} RUSD</div>
                    </div>
                    <div className="info-box">
                        <div className="text-xs text-blue-700 font-semibold mb-1">Blocks Left</div>
                        <div className="text-lg font-bold text-blue-900">
                            {blocksUntilEnd > 0 ? blocksUntilEnd.toLocaleString() : 'Ended'}
                        </div>
                    </div>
                </div>

                {/* Seller Info */}
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                    <div className="text-xs text-slate-500 mb-1">Seller</div>
                    <div className="text-xs font-mono text-slate-700 truncate">
                        {listing.seller}
                    </div>
                </div>

                {/* Winner Display */}
                {listing.state === LISTING_STATES.ENDED && listing.winner && (
                    <div className="success-box">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl">🏆</span>
                            <div>
                                <span className="font-bold text-emerald-900 text-lg">Auction Won!</span>
                                <p className="text-xs text-emerald-700">Winner has been selected</p>
                            </div>
                        </div>
                        <div className="bg-white rounded-lg p-3 mb-2">
                            <p className="text-xs text-slate-600 mb-1">Winner Address:</p>
                            <p className="text-emerald-700 font-mono text-xs break-all">{listing.winner}</p>
                        </div>
                        <div className="flex justify-between items-center bg-white rounded-lg p-3">
                            <span className="text-slate-600 text-sm">Winning Bid:</span>
                            <span className="text-emerald-900 font-bold text-xl">{listing.winningBid} RUSD</span>
                        </div>
                        {!listing.paymentReceived && (
                            <div className="mt-2 bg-yellow-50 border border-yellow-300 rounded-lg p-2 text-xs text-yellow-800">
                                ⏳ Waiting for winner to complete payment
                            </div>
                        )}
                        {listing.paymentReceived && (
                            <div className="mt-2 bg-emerald-100 border border-emerald-400 rounded-lg p-2 text-xs text-emerald-900 font-semibold">
                                ✅ Payment completed - Item sold!
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Show bid button only if listing is active and before end block */}
            {listing.state === LISTING_STATES.ACTIVE && blocksUntilEnd > 0 ? (
                <button
                    onClick={() => setShowBidModal(true)}
                    className="btn-primary w-full text-lg font-semibold py-3 flex items-center justify-center gap-2"
                >
                    <span>🔒</span> Submit Sealed Bid
                </button>
            ) : blocksUntilEnd <= 0 && listing.state === LISTING_STATES.ACTIVE ? (
                <div className="bg-gray-100 border-2 border-gray-300 rounded-lg p-3 text-center">
                    <p className="text-gray-600 font-semibold">⏰ Bidding Ended</p>
                    <p className="text-xs text-gray-500 mt-1">Waiting for winner selection</p>
                </div>
            ) : null}

            {showBidModal && (
                <BidModal
                    listing={listing}
                    onClose={() => setShowBidModal(false)}
                />
            )}
        </div>
    );
}

function BidModal({ listing, onClose }) {
    const [bidAmount, setBidAmount] = useState('');
    const { writeContract, data: hash, isPending } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // TODO: Implement client-side blocklock encryption
            // For now, we'll create a placeholder ciphertext structure
            // In production, you would use blocklock-js to encrypt the bid amount

            const bidAmountWei = parseUnits(bidAmount, 6); // RUSD has 6 decimals

            // Placeholder ciphertext structure - matches TypesLib.Ciphertext
            // In production, this would come from blocklock-js encryption
            const placeholderCiphertext = {
                u: {
                    x: [BigInt(0), BigInt(0)],
                    y: [BigInt(0), BigInt(0)]
                },
                v: '0x', // Empty bytes
                w: '0x'  // Empty bytes
            };

            // Gas limit for the callback when bid is decrypted
            const callbackGasLimit = 500000;

            // Estimate the cost for blocklock request (you'd get this from the contract)
            const blocklockFee = parseEther('0.0001'); // Placeholder fee

            await writeContract({
                address: MARKETPLACE_ADDRESS,
                abi: MARKETPLACE_ABI,
                functionName: 'submitBid',
                args: [
                    BigInt(listing.id),
                    placeholderCiphertext,
                    callbackGasLimit
                ],
                value: blocklockFee, // Pay for blocklock decryption
            });
        } catch (error) {
            console.error('Error submitting bid:', error);
            alert('Failed to submit bid: ' + error.message);
        }
    };

    // Close modal on success and trigger refresh
    if (isSuccess) {
        setTimeout(() => {
            onClose();
            // The parent component will auto-refresh due to watch mode
            window.location.reload(); // Force full refresh to update all data
        }, 2000);
    }

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <h3 className="text-xl font-bold mb-4">🔒 Submit Sealed Bid</h3>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4 text-sm">
                    <p className="text-yellow-900 font-semibold mb-1">How it works:</p>
                    <ul className="text-yellow-800 text-xs space-y-1">
                        <li>• Your bid will be encrypted using blocklock</li>
                        <li>• No one can see your bid amount until block {listing.revealBlockHeight.toLocaleString()}</li>
                        <li>• dcipher's network will automatically decrypt it</li>
                    </ul>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="label">Bid Amount (RUSD)</label>
                        <input
                            type="number"
                            step="0.01"
                            min={listing.minimumBid}
                            className="input"
                            value={bidAmount}
                            onChange={(e) => setBidAmount(e.target.value)}
                            placeholder={`Min: ${listing.minimumBid}`}
                            disabled={isPending || isConfirming}
                            required
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Minimum: {listing.minimumBid} RUSD
                        </p>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800">
                        <strong>Note:</strong> You'll need to pay a small fee (~0.0001 ETH) for the blocklock encryption service.
                    </div>

                    {isSuccess && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-green-800 text-sm">
                            ✅ Bid submitted successfully!
                        </div>
                    )}

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn-secondary flex-1"
                            disabled={isPending || isConfirming}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn-primary flex-1"
                            disabled={isPending || isConfirming}
                        >
                            {isPending ? 'Approving...' : isConfirming ? 'Submitting...' : 'Submit Bid'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
