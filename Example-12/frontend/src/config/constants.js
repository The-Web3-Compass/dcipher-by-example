import { baseSepolia, avalancheFuji } from 'wagmi/chains';

export const MARKETPLACE_ADDRESS = import.meta.env.VITE_MARKETPLACE_ADDRESS || '0x...';

export const RUSD_TOKEN = {
    [baseSepolia.id]: '0x9Eb392A6286138E5d59a40Da5398e567Ab3AAd7c',
    [avalancheFuji.id]: '0xFDdcB87aFED6B20cF7616A7339Bc5f8aC37154C3', // Add Avalanche Fuji RUSD address
};

export const LISTING_STATES = {
    ACTIVE: 0,
    ENDED: 1,
    SETTLED: 2,
    CANCELLED: 3,
};

export const LISTING_STATE_LABELS = {
    [LISTING_STATES.ACTIVE]: 'Active',
    [LISTING_STATES.ENDED]: 'Ended',
    [LISTING_STATES.SETTLED]: 'Settled',
    [LISTING_STATES.CANCELLED]: 'Cancelled',
};

export const SUPPORTED_CHAINS = [baseSepolia, avalancheFuji];
