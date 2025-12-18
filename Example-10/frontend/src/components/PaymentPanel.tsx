import { useState } from 'react'
import { useAccount, useWriteContract, useReadContract } from 'wagmi'
import { parseUnits, formatUnits, keccak256, toHex } from 'viem'
import { PAYMENT_GATEWAY_ABI, ERC20_ABI } from '../abi'
import { GATEWAY_ADDRESS, SOURCE_TOKEN, DEFAULT_SOLVER_FEE, DEFAULT_SLIPPAGE } from '../config'

type Status = { type: 'idle' } | { type: 'pending'; step: string } | { type: 'success'; message: string } | { type: 'error'; message: string }

const TOKEN_DECIMALS = 6

export function PaymentPanel() {
  const { address } = useAccount()
  const [merchant, setMerchant] = useState('')
  const [amount, setAmount] = useState('')
  const [orderId, setOrderId] = useState('')
  const [status, setStatus] = useState<Status>({ type: 'idle' })

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: SOURCE_TOKEN,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: address ? [address, GATEWAY_ADDRESS] : undefined,
  })

  const { data: balance } = useReadContract({
    address: SOURCE_TOKEN,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  })

  const { data: merchantInfo } = useReadContract({
    address: GATEWAY_ADDRESS,
    abi: PAYMENT_GATEWAY_ABI,
    functionName: 'getMerchantInfo',
    args: merchant && merchant.length === 42 ? [merchant as `0x${string}`] : undefined,
  })

  const { writeContract } = useWriteContract()

  const amountWei = amount ? parseUnits(amount, TOKEN_DECIMALS) : 0n
  const solverFeeWei = parseUnits(DEFAULT_SOLVER_FEE, TOKEN_DECIMALS)
  const totalNeeded = amountWei + solverFeeWei
  const expectedSettlement = amountWei - (amountWei * BigInt(Math.floor(DEFAULT_SLIPPAGE * 100))) / 100n

  const needsApproval = allowance !== undefined && allowance < totalNeeded
  const hasEnoughBalance = balance !== undefined && balance >= totalNeeded
  const isMerchantRegistered = merchantInfo?.isRegistered

  const validateInputs = (): string | null => {
    if (!merchant) return 'Please enter a merchant address'
    if (!merchant.startsWith('0x') || merchant.length !== 42) return 'Invalid merchant address format'
    if (!amount || parseFloat(amount) <= 0) return 'Please enter a valid amount'
    if (!hasEnoughBalance) {
      const balanceFormatted = balance ? formatUnits(balance, TOKEN_DECIMALS) : '0'
      return `Insufficient balance. You have ${balanceFormatted} FUSD, need ${(parseFloat(amount) + parseFloat(DEFAULT_SOLVER_FEE)).toFixed(2)} FUSD`
    }
    if (merchant.length === 42 && !isMerchantRegistered) return 'This merchant is not registered'
    return null
  }

  const handleApprove = () => {
    const error = validateInputs()
    if (error) {
      setStatus({ type: 'error', message: error })
      return
    }

    setStatus({ type: 'pending', step: 'Approving tokens...' })
    
    writeContract({
      address: SOURCE_TOKEN,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [GATEWAY_ADDRESS, totalNeeded],
    }, {
      onSuccess: () => {
        setStatus({ type: 'success', message: 'Tokens approved! Now click "Make Payment"' })
        setTimeout(() => refetchAllowance(), 2000)
      },
      onError: (error) => {
        const msg = error.message.includes('User rejected') 
          ? 'Transaction rejected by user'
          : `Approval failed: ${error.message.slice(0, 100)}`
        setStatus({ type: 'error', message: msg })
      }
    })
  }

  const handlePayment = () => {
    const error = validateInputs()
    if (error) {
      setStatus({ type: 'error', message: error })
      return
    }

    setStatus({ type: 'pending', step: 'Processing payment...' })
    const orderIdBytes = keccak256(toHex(orderId || `ORDER-${Date.now()}`))
    
    writeContract({
      address: GATEWAY_ADDRESS,
      abi: PAYMENT_GATEWAY_ABI,
      functionName: 'makePayment',
      args: [
        merchant as `0x${string}`,
        orderIdBytes,
        SOURCE_TOKEN,
        amountWei,
        expectedSettlement,
        solverFeeWei,
      ],
    }, {
      onSuccess: () => {
        setStatus({ type: 'success', message: 'Payment submitted successfully!' })
        setMerchant('')
        setAmount('')
        setOrderId('')
      },
      onError: (error) => {
        let msg = 'Payment failed'
        if (error.message.includes('User rejected')) {
          msg = 'Transaction rejected by user'
        } else if (error.message.includes('Merchant not registered')) {
          msg = 'This merchant is not registered'
        } else if (error.message.includes('insufficient')) {
          msg = 'Insufficient token balance or allowance'
        } else {
          msg = `Payment failed: ${error.message.slice(0, 100)}`
        }
        setStatus({ type: 'error', message: msg })
      }
    })
  }

  const clearError = () => {
    if (status.type === 'error') setStatus({ type: 'idle' })
  }

  return (
    <div className="card">
      <h2>💸 Make Payment</h2>
      
      {status.type === 'error' && (
        <div className="notification error">{status.message}</div>
      )}
      {status.type === 'success' && (
        <div className="notification success">{status.message}</div>
      )}
      {status.type === 'pending' && (
        <div className="notification pending">{status.step}</div>
      )}

      <div className="form">
        <input
          type="text"
          placeholder="Merchant address (0x...)"
          value={merchant}
          onChange={(e) => { setMerchant(e.target.value); clearError() }}
        />
        {merchant.length === 42 && !isMerchantRegistered && (
          <div className="field-hint error">⚠️ Merchant not registered</div>
        )}
        {merchant.length === 42 && isMerchantRegistered && (
          <div className="field-hint success">✓ Merchant verified</div>
        )}
        
        <input
          type="text"
          placeholder="Amount (FUSD)"
          value={amount}
          onChange={(e) => { setAmount(e.target.value); clearError() }}
        />
        {balance !== undefined && (
          <div className="field-hint">Balance: {formatUnits(balance, TOKEN_DECIMALS)} FUSD</div>
        )}
        
        <input
          type="text"
          placeholder="Order ID (optional)"
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
        />

        {amount && parseFloat(amount) > 0 && (
          <div className="summary">
            <div className="info-row">
              <span>Amount:</span>
              <span>{amount} FUSD</span>
            </div>
            <div className="info-row">
              <span>Solver Fee:</span>
              <span>{DEFAULT_SOLVER_FEE} FUSD</span>
            </div>
            <div className="info-row total">
              <span>Total:</span>
              <span>{(parseFloat(amount) + parseFloat(DEFAULT_SOLVER_FEE)).toFixed(2)} FUSD</span>
            </div>
          </div>
        )}

        {needsApproval ? (
          <button 
            className="btn btn-primary"
            onClick={handleApprove}
            disabled={status.type === 'pending' || !merchant || !amount}
          >
            {status.type === 'pending' ? status.step : 'Step 1: Approve Tokens'}
          </button>
        ) : (
          <button 
            className="btn btn-primary"
            onClick={handlePayment}
            disabled={status.type === 'pending' || !merchant || !amount}
          >
            {status.type === 'pending' ? status.step : 'Make Payment'}
          </button>
        )}
      </div>
    </div>
  )
}
