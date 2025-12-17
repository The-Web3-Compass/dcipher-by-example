import { useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useBlockNumber } from 'wagmi';
import { parseUnits } from 'viem';
import { MARKETPLACE_ADDRESS } from '../config/constants';
import { MARKETPLACE_ABI } from '../contracts/abi';

export default function CreateListing({ onSuccess }) {
    const [formData, setFormData] = useState({
        itemName: '',
        description: '',
        imageUrl: '',
        minimumBid: '',
        revealBlockOffset: '50',
        endBlockOffset: '100',
    });

    const { data: blockNumber } = useBlockNumber({ watch: true });
    const { writeContract, data: hash, isPending } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

    const currentBlock = blockNumber ? Number(blockNumber) : 0;
    const revealBlock = currentBlock + parseInt(formData.revealBlockOffset || '0');
    const endBlock = currentBlock + parseInt(formData.endBlockOffset || '0');

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await writeContract({
                address: MARKETPLACE_ADDRESS,
                abi: MARKETPLACE_ABI,
                functionName: 'createListing',
                args: [
                    formData.itemName,
                    formData.description,
                    formData.imageUrl,
                    parseUnits(formData.minimumBid, 6), // RUSD has 6 decimals
                    BigInt(revealBlock),
                    BigInt(endBlock),
                ],
            });
        } catch (error) {
            console.error('Error creating listing:', error);
        }
    };

    if (isSuccess) {
        setTimeout(() => onSuccess(), 2000);
    }

    return (
        <div className="max-w-2xl mx-auto">
            <div className="card">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Create New Listing</h2>
                    <div className="text-right">
                        <div className="text-xs text-gray-500">Current Block</div>
                        <div className="text-lg font-bold text-primary-600">
                            {currentBlock > 0 ? currentBlock.toLocaleString() : '...'}
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="label">Item Name</label>
                        <input
                            type="text"
                            className="input"
                            value={formData.itemName}
                            onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                            placeholder="e.g., Vintage NFT Collection"
                            required
                        />
                    </div>

                    <div>
                        <label className="label">Description</label>
                        <textarea
                            className="input"
                            rows="4"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Describe your item..."
                            required
                        />
                    </div>

                    <div>
                        <label className="label">Image URL (optional)</label>
                        <input
                            type="url"
                            className="input"
                            value={formData.imageUrl}
                            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                            placeholder="https://example.com/image.jpg"
                        />
                    </div>

                    <div>
                        <label className="label">Minimum Bid (RUSD)</label>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            className="input"
                            value={formData.minimumBid}
                            onChange={(e) => setFormData({ ...formData, minimumBid: e.target.value })}
                            placeholder="10.00"
                            required
                        />
                    </div>

                    <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                        <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                            <span>⏰</span> Timing Configuration
                        </h3>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="label text-blue-900">Reveal After (blocks)</label>
                                <input
                                    type="number"
                                    min="1"
                                    className="input"
                                    value={formData.revealBlockOffset}
                                    onChange={(e) => setFormData({ ...formData, revealBlockOffset: e.target.value })}
                                    required
                                />
                                <p className="text-xs text-blue-700 mt-1">
                                    Bids decrypt after this many blocks
                                </p>
                                {currentBlock > 0 && (
                                    <div className="mt-2 p-2 bg-blue-100 rounded text-sm">
                                        <span className="text-blue-600">Reveal at block:</span>
                                        <span className="font-bold text-blue-900 ml-1">
                                            {revealBlock.toLocaleString()}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="label text-blue-900">End After (blocks)</label>
                                <input
                                    type="number"
                                    min="1"
                                    className="input"
                                    value={formData.endBlockOffset}
                                    onChange={(e) => setFormData({ ...formData, endBlockOffset: e.target.value })}
                                    required
                                />
                                <p className="text-xs text-blue-700 mt-1">
                                    Bidding closes after this many blocks
                                </p>
                                {currentBlock > 0 && (
                                    <div className="mt-2 p-2 bg-blue-100 rounded text-sm">
                                        <span className="text-blue-600">End at block:</span>
                                        <span className="font-bold text-blue-900 ml-1">
                                            {endBlock.toLocaleString()}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="text-xs text-blue-700 bg-blue-100 p-2 rounded">
                            <strong>Note:</strong> On Base Sepolia, blocks are ~2 seconds apart.
                            50 blocks ≈ 100 seconds, 100 blocks ≈ 200 seconds.
                        </div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <h3 className="font-semibold text-yellow-900 mb-2">How Sealed Bids Work</h3>
                        <ul className="text-sm text-yellow-800 space-y-1">
                            <li>• Bids are encrypted using blocklock to a future block height</li>
                            <li>• No one can see bid amounts until the reveal block</li>
                            <li>• dcipher's threshold network automatically decrypts bids</li>
                            <li>• Highest bid wins after the end block</li>
                        </ul>
                    </div>

                    <button
                        type="submit"
                        disabled={isPending || isConfirming || currentBlock === 0}
                        className="btn-primary w-full"
                    >
                        {isPending ? 'Waiting for approval...' : isConfirming ? 'Creating listing...' : 'Create Listing'}
                    </button>

                    {isSuccess && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-800">
                            ✅ Listing created successfully! Redirecting...
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}
