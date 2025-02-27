import { http } from 'wagmi';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { baseSepolia } from 'wagmi/chains';

const BLAST_RPC_URL = process.env.NEXT_PUBLIC_BLAST_RPC_URL;
const WALLET_CONNECT_PROJECT_ID = process.env.NEXT_PUBLIC_WALLETCONNECT;

// ✅ Ensure environment variables exist
if (!WALLET_CONNECT_PROJECT_ID) {
    throw new Error("❌ Missing WalletConnect Project ID. Set NEXT_PUBLIC_WALLETCONNECT in .env.");
}
if (!BLAST_RPC_URL) {
    throw new Error("❌ Missing Blast RPC URL. Set NEXT_PUBLIC_BLAST_RPC_URL in .env.");
}

const config = getDefaultConfig({
    appName: "Black Hole",
    projectId: WALLET_CONNECT_PROJECT_ID,
    chains: [baseSepolia],
    transports: {
        [baseSepolia.id]: http(BLAST_RPC_URL), // ✅ Ensures correct RPC URL
    },
    storage: null, // ✅ Fixes autoConnect issue
});

export default config;
