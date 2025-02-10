import { useReadContract, useWriteContract, useAccount, usePublicClient } from 'wagmi'
import { VaultABI } from '../contracts/VaultABI'
import { useState, useMemo } from 'react'

const VAULT_ADDRESS = '0x2937CaC77030abF478bc991c942bb57bC8E6780D'
const USDC_ADDRESS = '0x81b33EdFdA34D59Af7b8806712a6eB2EFeE508f4'

const USDC_ABI = [
  {
    name: 'approve',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    outputs: [{ name: '', type: 'bool' }]
  },
  {
    name: 'allowance',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' }
    ],
    outputs: [{ name: '', type: 'uint256' }]
  }
] as const;

export function useVaultContract() {
  const { address } = useAccount()
  const publicClient = usePublicClient() // Fixed: usePublicClient instead of PublicClient
  const TIMER_DURATION = 60 // 1 minute in seconds

  // Read contract state
  const { data: prizePool } = useReadContract({
    address: VAULT_ADDRESS,
    abi: VaultABI,
    functionName: 'getPrizePool',
    watch: true,
    pollingInterval: 1000,
  })

  const { data: highestBid } = useReadContract({
    address: VAULT_ADDRESS,
    abi: VaultABI,
    functionName: 'highestBid',
    watch: true,
    pollingInterval: 1000,
  })

  const { data: highestBidder } = useReadContract({
    address: VAULT_ADDRESS,
    abi: VaultABI,
    functionName: 'highestBidder',
  })

  const { data: lastBidTime } = useReadContract({
    address: VAULT_ADDRESS,
    abi: VaultABI,
    functionName: 'lastBidTime',
  })

  const { data: nextBidAmount } = useReadContract({
    address: VAULT_ADDRESS,
    abi: VaultABI,
    functionName: 'getNextBidAmount',
    watch: true,
    pollingInterval: 1000,
  })

  // Read USDC allowance
  const { data: allowance } = useReadContract({
    address: USDC_ADDRESS,
    abi: USDC_ABI,
    functionName: 'allowance',
    args: [address as `0x${string}`, VAULT_ADDRESS],
    enabled: !!address,
  })

  // State for transaction hashes
  const [bidHash, setBidHash] = useState<`0x${string}` | undefined>()

  // Contract writes
  const { writeContract: approveUsdc } = useWriteContract()
  const { writeContract: placeBidOnVault } = useWriteContract()
  const { writeContract: claimPrize } = useWriteContract()

  // State for loading
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handlePlaceBid = async () => {
    if (!nextBidAmount || !address) return
    
    setIsLoading(true)
    setIsSuccess(false)

    try {
      const allowanceValue = (allowance as bigint) ?? BigInt(0)
      const nextBidAmountValue = (nextBidAmount as bigint) ?? BigInt(0)

      if (allowanceValue < nextBidAmountValue) {
        console.log("Approving USDC...", {
          amount: nextBidAmountValue.toString(),
          spender: VAULT_ADDRESS
        })

        const { request: approveRequest } = await publicClient.simulateContract({
          address: USDC_ADDRESS,
          abi: USDC_ABI,
          functionName: 'approve',
          args: [VAULT_ADDRESS, nextBidAmountValue],
          account: address,
        })

        const approveTx = await approveUsdc(approveRequest)
        if (!approveTx?.hash) {
          throw new Error("Failed to get approval transaction hash")
        }
        console.log("Approval tx:", approveTx.hash)

        await publicClient.waitForTransactionReceipt({ hash: approveTx.hash })
      }

      console.log("Placing bid...")
      const { request: bidRequest } = await publicClient.simulateContract({
        address: VAULT_ADDRESS,
        abi: VaultABI,
        functionName: 'placeBid',
        account: address,
      })

      const bidTx = await placeBidOnVault(bidRequest)
      if (!bidTx?.hash) {
        throw new Error("Failed to get bid transaction hash")
      }
      console.log("Bid tx:", bidTx.hash)

      await publicClient.waitForTransactionReceipt({ hash: bidTx.hash })
      setIsSuccess(true)
    } catch (error) {
      console.error('Bid failed:', error)
      setIsSuccess(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClaim = async () => {
    if (!address) return
    
    setIsLoading(true)
    try {
      const { request } = await publicClient.simulateContract({
        address: VAULT_ADDRESS,
        abi: VaultABI,
        functionName: 'claim',
        account: address,
      })

      const claimTx = await claimPrize(request)
      console.log("Claim tx:", claimTx)

      const claimReceipt = await publicClient.waitForTransactionReceipt({ 
        hash: claimTx 
      })
      console.log("Claim receipt:", claimReceipt)
      setIsSuccess(true)
    } catch (error) {
      console.error('Claim failed:', error)
      setIsSuccess(false)
    } finally {
      setIsLoading(false)
    }
  }

  // Calculate game state
  const isGameOver = useMemo(() => {
    if (!lastBidTime) return false
    const now = Math.floor(Date.now() / 1000)
    const timeSinceLastBid = now - Number(lastBidTime)
    return timeSinceLastBid >= TIMER_DURATION
  }, [lastBidTime])

  return {
    prizePool,
    highestBid,
    highestBidder,
    lastBidTime,
    nextBidAmount,
    placeBid: handlePlaceBid,
    claim: handleClaim,
    isBidLoading: isLoading,
    isBidSuccess: isSuccess,
    isGameOver,
    isWinner: isGameOver && address === highestBidder
  }
}
