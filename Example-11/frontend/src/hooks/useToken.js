import { useWriteContract, useWaitForTransactionReceipt, usePublicClient } from 'wagmi'
import { formatUnits, parseUnits } from 'viem'
import { ERC20_ABI } from '../config/contracts'
import { useState, useEffect } from 'react'

// RUSD has 6 decimals
const RUSD_DECIMALS = 6

export function useTokenBalance(tokenAddress, userAddress, chainId) {
  const [balance, setBalance] = useState('0')
  const [isLoading, setIsLoading] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const publicClient = usePublicClient({ chainId })

  const fetchBalance = async () => {
    if (!tokenAddress || !userAddress || !publicClient) {
      setBalance('0')
      return
    }

    try {
      setIsLoading(true)
      const result = await publicClient.readContract({
        address: tokenAddress,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: [userAddress],
      })
      
      const formatted = formatUnits(result, RUSD_DECIMALS)
      console.log('Token Balance:', {
        tokenAddress,
        userAddress,
        rawBalance: result.toString(),
        formattedBalance: formatted,
      })
      setBalance(formatted)
    } catch (error) {
      console.error('Error fetching balance:', error)
      setBalance('0')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchBalance()
  }, [tokenAddress, userAddress, chainId, publicClient, refreshTrigger])

  const refetch = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  return {
    balance,
    refetch,
    isLoading,
  }
}

export function useTokenAllowance(tokenAddress, ownerAddress, spenderAddress, chainId) {
  const [allowance, setAllowance] = useState('0')
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const publicClient = usePublicClient({ chainId })

  const fetchAllowance = async () => {
    if (!tokenAddress || !ownerAddress || !spenderAddress || !publicClient) {
      setAllowance('0')
      return
    }

    try {
      const result = await publicClient.readContract({
        address: tokenAddress,
        abi: ERC20_ABI,
        functionName: 'allowance',
        args: [ownerAddress, spenderAddress],
      })
      
      const formatted = formatUnits(result, RUSD_DECIMALS)
      setAllowance(formatted)
    } catch (error) {
      console.error('Error fetching allowance:', error)
      setAllowance('0')
    }
  }

  useEffect(() => {
    fetchAllowance()
  }, [tokenAddress, ownerAddress, spenderAddress, chainId, publicClient, refreshTrigger])

  const refetch = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  return {
    allowance,
    refetch,
  }
}

export function useApproveToken() {
  const { writeContract, data: hash, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  const approve = async (tokenAddress, spenderAddress, amount) => {
    return writeContract({
      address: tokenAddress,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [spenderAddress, parseUnits(amount.toString(), RUSD_DECIMALS)],
    })
  }

  return {
    approve,
    isPending,
    isConfirming,
    isSuccess,
    hash,
  }
}
