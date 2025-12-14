import { useReadContract, useWriteContract, useWatchContractEvent, useAccount } from 'wagmi'
import { formatEther, parseEther } from 'viem'
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../config'
import { useState, useEffect } from 'react'

export function useLottery() {
  const { address } = useAccount()
  const [latestWinner, setLatestWinner] = useState<`0x${string}` | null>(null)
  const [latestPrize, setLatestPrize] = useState<bigint | null>(null)

  // Read contract state
  const { data: ticketPrice } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'ticketPrice',
    chainId: 84532,
  })

  const { data: playerCount } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getPlayerCount',
    chainId: 84532,
  })

  const { data: potSize } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getPotSize',
    chainId: 84532,
  })

  const { data: isOpen } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'isLotteryOpen',
    chainId: 84532,
  })

  const { data: organizer } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'organizer',
    chainId: 84532,
  })

  const { data: winner } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'winner',
    chainId: 84532,
  })

  // Write functions
  const { writeContract: buyTicket, isPending: isBuying } = useWriteContract()
  const { writeContract: closeLottery, isPending: isClosing } = useWriteContract()

  // Watch for winner announcement
  useWatchContractEvent({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    eventName: 'WinnerPicked',
    onLogs(logs) {
      const log = logs[0]
      if (log.args.winner && log.args.prize) {
        setLatestWinner(log.args.winner)
        setLatestPrize(log.args.prize)
      }
    },
  })

  const handleBuyTicket = () => {
    if (!ticketPrice) return
    
    buyTicket({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'buyTicket',
      value: ticketPrice,
    })
  }

  const handleCloseLottery = () => {
    // Send 0.001 ETH to pay for dcipher randomness request
    closeLottery({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'closeLotteryAndRequestRandomness',
      value: parseEther('0.001'),
    })
  }

  const isOrganizer = address && organizer && 
    address.toLowerCase() === organizer.toLowerCase()

  const isWinner = address && latestWinner && 
    address.toLowerCase() === latestWinner.toLowerCase()

  return {
    // State
    ticketPrice: ticketPrice ? formatEther(ticketPrice) : null,
    playerCount: playerCount ? Number(playerCount) : 0,
    potSize: potSize ? formatEther(potSize) : null,
    isOpen,
    isOrganizer,
    winner,
    latestWinner,
    latestPrize: latestPrize ? formatEther(latestPrize) : null,
    isWinner,
    
    // Actions
    buyTicket: handleBuyTicket,
    closeLottery: handleCloseLottery,
    isBuying,
    isClosing,
  }
}