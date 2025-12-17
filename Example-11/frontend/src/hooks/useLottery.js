import { useWriteContract, useWaitForTransactionReceipt, usePublicClient } from 'wagmi'
import { parseUnits, formatUnits, parseEther } from 'viem'
import { LOTTERY_ABI, LOTTERY_ADDRESS, ADDRESSES } from '../config/contracts'
import { useState, useEffect } from 'react'

// RUSD has 6 decimals
const RUSD_DECIMALS = 6

export function useLottery(chainId) {
  const addresses = chainId === 84532 ? ADDRESSES.baseSepolia : ADDRESSES.avalancheFuji
  const lotteryAddress = LOTTERY_ADDRESS
  const [currentLotteryId, setCurrentLotteryId] = useState(null)
  const publicClient = usePublicClient({ chainId })

  useEffect(() => {
    const fetchLotteryId = async () => {
      if (!lotteryAddress || !publicClient) {
        console.log('Missing lotteryAddress or publicClient')
        return
      }

      try {
        const result = await publicClient.readContract({
          address: lotteryAddress,
          abi: LOTTERY_ABI,
          functionName: 'lotteryId',
        })
        
        console.log('Lottery ID fetched:', result.toString())
        setCurrentLotteryId(result)
      } catch (error) {
        console.error('Error fetching lottery ID:', error)
      }
    }

    fetchLotteryId()
  }, [lotteryAddress, chainId, publicClient])

  return {
    lotteryAddress,
    currentLotteryId,
    addresses,
  }
}

export function useLotteryDetails(lotteryId, chainId) {
  const { lotteryAddress } = useLottery(chainId)
  const [lottery, setLottery] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const publicClient = usePublicClient({ chainId })

  const fetchLottery = async () => {
    if (!lotteryAddress || !lotteryId || !publicClient) {
      return
    }

    try {
      setIsLoading(true)
      const data = await publicClient.readContract({
        address: lotteryAddress,
        abi: LOTTERY_ABI,
        functionName: 'getLottery',
        args: [lotteryId],
      })

      const [id, prizePool, entryFee, startTime, endTime, participantCount, winner, state, prizeClaimed] = data

      setLottery({
        id: Number(id),
        prizePool: formatUnits(prizePool, RUSD_DECIMALS),
        entryFee: formatUnits(entryFee, RUSD_DECIMALS),
        startTime: Number(startTime),
        endTime: Number(endTime),
        participantCount: Number(participantCount),
        winner,
        state: Number(state),
        prizeClaimed,
      })
    } catch (error) {
      console.error('Error fetching lottery details:', error)
      setLottery(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchLottery()
  }, [lotteryId, lotteryAddress, chainId, publicClient, refreshTrigger])

  const refetch = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  return {
    lottery,
    isLoading,
    refetch,
  }
}

export function useUserEntries(lotteryId, userAddress, lotteryAddress, chainId) {
  const [entryCount, setEntryCount] = useState(0)
  const publicClient = usePublicClient({ chainId })

  useEffect(() => {
    const fetchEntries = async () => {
      if (!lotteryAddress || !lotteryId || !userAddress || !publicClient) {
        return
      }

      try {
        const result = await publicClient.readContract({
          address: lotteryAddress,
          abi: LOTTERY_ABI,
          functionName: 'getUserEntryCount',
          args: [lotteryId, userAddress],
        })
        setEntryCount(Number(result))
      } catch (error) {
        console.error('Error fetching user entries:', error)
        setEntryCount(0)
      }
    }

    fetchEntries()
  }, [lotteryId, userAddress, lotteryAddress, chainId, publicClient])

  return {
    entryCount,
  }
}

export function useCanDraw(lotteryId, lotteryAddress, chainId) {
  const [canDraw, setCanDraw] = useState(false)
  const publicClient = usePublicClient({ chainId })

  useEffect(() => {
    const fetchCanDraw = async () => {
      if (!lotteryAddress || !lotteryId || !publicClient) {
        return
      }

      try {
        const result = await publicClient.readContract({
          address: lotteryAddress,
          abi: LOTTERY_ABI,
          functionName: 'canDraw',
          args: [lotteryId],
        })
        setCanDraw(!!result)
      } catch (error) {
        console.error('Error fetching canDraw:', error)
        setCanDraw(false)
      }
    }

    fetchCanDraw()
  }, [lotteryId, lotteryAddress, chainId, publicClient])

  return {
    canDraw,
  }
}

export function useEnterLottery() {
  const { writeContract, data: hash, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  const enterLottery = async (lotteryAddress, lotteryId, entries) => {
    return writeContract({
      address: lotteryAddress,
      abi: LOTTERY_ABI,
      functionName: 'enterLottery',
      args: [lotteryId, entries],
    })
  }

  return {
    enterLottery,
    isPending,
    isConfirming,
    isSuccess,
    hash,
  }
}

export function useDrawWinner() {
  const { writeContract, data: hash, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  const drawWinner = async (lotteryAddress, lotteryId) => {
    return writeContract({
      address: lotteryAddress,
      abi: LOTTERY_ABI,
      functionName: 'drawWinner',
      args: [lotteryId, 200000],
      value: parseEther('0.001'),
    })
  }

  return {
    drawWinner,
    isPending,
    isConfirming,
    isSuccess,
    hash,
  }
}

export function useClaimPrize() {
  const { writeContract, data: hash, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  const claimPrize = async (lotteryAddress, lotteryId) => {
    return writeContract({
      address: lotteryAddress,
      abi: LOTTERY_ABI,
      functionName: 'claimPrize',
      args: [lotteryId],
    })
  }

  return {
    claimPrize,
    isPending,
    isConfirming,
    isSuccess,
    hash,
  }
}

export function useClaimPrizeCrossChain() {
  const { writeContract, data: hash, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  const claimPrizeCrossChain = async (lotteryAddress, lotteryId, destinationChainId, destinationToken, solverFee) => {
    return writeContract({
      address: lotteryAddress,
      abi: LOTTERY_ABI,
      functionName: 'claimPrizeCrossChain',
      args: [lotteryId, destinationChainId, destinationToken, solverFee],
    })
  }

  return {
    claimPrizeCrossChain,
    isPending,
    isConfirming,
    isSuccess,
    hash,
  }
}
