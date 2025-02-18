import { ethers } from "ethers";
import VaultABI from "../contracts/USDC20Vault.sol/USDC20Vault.json";

// Ensure VAULT_ADDRESS is correctly typed
const VAULT_ADDRESS = process.env.NEXT_PUBLIC_VAULT_ADDRESS as `0x${string}`;
const BLAST_RPC_URL = process.env.NEXT_PUBLIC_BLAST_RPC_URL as string;

const TIMER_DURATION = 60;

// Initialize ethers provider
const provider = new ethers.JsonRpcProvider(BLAST_RPC_URL);

// Define expected return type for contract function calls
interface VaultData {
  hasStarted: boolean;
  prizePool: string;
  highestBid: string;
  highestBidder: string;
  lastBidTime: string;
  nextBidAmount: string;
  isGameOver: boolean;
  isClaimed: boolean;
  timeRemaining: number;
}

export async function getVaultData(): Promise<VaultData | null> {
  try {
    // Initialize contract instance
    const contract = new ethers.Contract(VAULT_ADDRESS, VaultABI.abi, provider);

    // Fetch contract values using Promise.all to parallelize calls
    const [
      hasStarted,
      prizePool,
      highestBid,
      highestBidder,
      lastBidTime,
      nextBidAmount,
      isClaimed,
    ] = await Promise.all([
      contract.init() as Promise<boolean>,
      contract.getPrizePool() as Promise<bigint>,
      contract.highestBid() as Promise<bigint>,
      contract.highestBidder() as Promise<`0x${string}`>,
      contract.lastBidTime() as Promise<bigint>,
      contract.getNextBidAmount() as Promise<bigint>,
      contract.claimed() as Promise<boolean>,
    ]);

    // Convert BigInt values to strings for frontend compatibility
    const now = Math.floor(Date.now() / 1000);
    const lastBidTimeNumber = Number(lastBidTime);
    const isGameOver = lastBidTimeNumber === 0 ? false : now - lastBidTimeNumber >= TIMER_DURATION;
    const timeSinceLastBid = now - lastBidTimeNumber;
    const timeRemaining = Math.max(TIMER_DURATION - timeSinceLastBid, 0);

    const returnedData = {
      hasStarted,
      prizePool: prizePool.toString(),
      highestBid: highestBid.toString(),
      highestBidder,
      lastBidTime: lastBidTime.toString(),
      nextBidAmount: nextBidAmount.toString(),
      isGameOver,
      isClaimed,
      timeRemaining,
    };

    console.log(`VaultData: ${JSON.stringify(returnedData)}`);

    return returnedData;
  } catch (error) {
    console.error("Error fetching contract data:", error);
    return null;
  }
}
