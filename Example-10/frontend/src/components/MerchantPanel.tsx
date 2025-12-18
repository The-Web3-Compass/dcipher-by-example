import { useState } from 'react'
import { useAccount, useReadContract, useWriteContract } from 'wagmi'
import { PAYMENT_GATEWAY_ABI } from '../abi'
import { GATEWAY_ADDRESS } from '../config'

type Status = { type: 'idle' } | { type: 'pending' } | { type: 'success'; message: string } | { type: 'error'; message: string }

export function MerchantPanel() {
  const { address } = useAccount()
  const [settlementAddress, setSettlementAddress] = useState('')
  const [status, setStatus] = useState<Status>({ type: 'idle' })
  
  const { data: merchantInfo, refetch } = useReadContract({
    address: GATEWAY_ADDRESS,
    abi: PAYMENT_GATEWAY_ABI,
    functionName: 'getMerchantInfo',
    args: address ? [address] : undefined,
  })

  const { writeContract } = useWriteContract()

  const handleRegister = async () => {
    if (!settlementAddress) {
      setStatus({ type: 'error', message: 'Please enter a settlement address' })
      return
    }

    if (!settlementAddress.startsWith('0x') || settlementAddress.length !== 42) {
      setStatus({ type: 'error', message: 'Invalid address format. Must be 0x followed by 40 hex characters' })
      return
    }

    setStatus({ type: 'pending' })
    
    writeContract({
      address: GATEWAY_ADDRESS,
      abi: PAYMENT_GATEWAY_ABI,
      functionName: 'registerMerchant',
      args: [settlementAddress as `0x${string}`],
    }, {
      onSuccess: () => {
        setStatus({ type: 'success', message: 'Successfully registered as merchant!' })
        setTimeout(() => refetch(), 2000)
        setSettlementAddress('')
      },
      onError: (error) => {
        const msg = error.message.includes('User rejected') 
          ? 'Transaction rejected by user'
          : error.message.includes('Already registered')
          ? 'You are already registered as a merchant'
          : `Registration failed: ${error.message.slice(0, 100)}`
        setStatus({ type: 'error', message: msg })
      }
    })
  }

  const isRegistered = merchantInfo?.isRegistered

  return (
    <div className="card">
      <h2>🏪 Merchant Status</h2>
      
      {status.type === 'error' && (
        <div className="notification error">{status.message}</div>
      )}
      {status.type === 'success' && (
        <div className="notification success">{status.message}</div>
      )}
      
      {isRegistered ? (
        <div className="merchant-info">
          <p className="status-badge success">✓ Registered</p>
          <div className="info-row">
            <span>Settlement Address:</span>
            <span className="mono">{merchantInfo.settlementAddress.slice(0, 10)}...</span>
          </div>
          <div className="info-row">
            <span>Total Received:</span>
            <span>{merchantInfo.totalReceived.toString()} wei</span>
          </div>
        </div>
      ) : (
        <div className="register-form">
          <p className="status-badge warning">Not Registered</p>
          <input
            type="text"
            placeholder="Settlement address (0x...)"
            value={settlementAddress}
            onChange={(e) => {
              setSettlementAddress(e.target.value)
              if (status.type === 'error') setStatus({ type: 'idle' })
            }}
          />
          <button 
            className="btn btn-primary"
            onClick={handleRegister}
            disabled={status.type === 'pending' || !settlementAddress}
          >
            {status.type === 'pending' ? 'Registering...' : 'Register as Merchant'}
          </button>
        </div>
      )}
    </div>
  )
}
