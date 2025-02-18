// import { getVaultData } from '@/app/lib/getVaultData';
import { getVaultData } from './lib/getVaultDataViaEthers';
import Home from './components/Home';


export default async function HomePage() {
  const vaultData = await getVaultData() ?? {
    hasStarted: false,
    prizePool: "0",
    highestBid: "0",
    highestBidder: "0x0000000000000000000000000000000000000000",
    lastBidTime: "0",
    nextBidAmount: "0",
    isGameOver: false,
    isClaimed: false,
    timeRemaining: 60
  };

  return <Home vaultData={vaultData} />;
}
