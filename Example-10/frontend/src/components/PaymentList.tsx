import { useAccount, useReadContract } from 'wagmi'
import { PAYMENT_GATEWAY_ABI } from '../abi'
import { GATEWAY_ADDRESS } from '../config'
import { formatEther } from 'viem'

const STATUS_LABELS = ['Pending', 'Settled', 'Completed', 'Refunded']
const STATUS_COLORS = ['warning', 'success', 'success', 'error']

export function PaymentList() {
  const { address } = useAccount()

  const { data: paymentIds } = useReadContract({
    address: GATEWAY_ADDRESS,
    abi: PAYMENT_GATEWAY_ABI,
    functionName: 'getMerchantPayments',
    args: address ? [address] : undefined,
  })

  if (!paymentIds || paymentIds.length === 0) {
    return (
      <div className="card">
        <h2>📋 Payment History</h2>
        <p className="empty-state">No payments yet</p>
      </div>
    )
  }

  return (
    <div className="card">
      <h2>📋 Payment History</h2>
      <div className="payment-list">
        {paymentIds.map((paymentId) => (
          <PaymentItem key={paymentId} paymentId={paymentId} />
        ))}
      </div>
    </div>
  )
}

function PaymentItem({ paymentId }: { paymentId: `0x${string}` }) {
  const { data: payment } = useReadContract({
    address: GATEWAY_ADDRESS,
    abi: PAYMENT_GATEWAY_ABI,
    functionName: 'getPayment',
    args: [paymentId],
  })

  const { data: isSettled } = useReadContract({
    address: GATEWAY_ADDRESS,
    abi: PAYMENT_GATEWAY_ABI,
    functionName: 'isPaymentSettled',
    args: [paymentId],
  })

  if (!payment) return null

  const status = isSettled ? 1 : payment.status

  return (
    <div className="payment-item">
      <div className="payment-header">
        <span className="payment-id">{paymentId.slice(0, 10)}...</span>
        <span className={`status-badge ${STATUS_COLORS[status]}`}>
          {STATUS_LABELS[status]}
        </span>
      </div>
      <div className="payment-details">
        <div className="info-row">
          <span>Payer:</span>
          <span className="mono">{payment.payer.slice(0, 8)}...</span>
        </div>
        <div className="info-row">
          <span>Amount:</span>
          <span>{formatEther(payment.amountPaid)} tokens</span>
        </div>
        <div className="info-row">
          <span>Expected:</span>
          <span>{formatEther(payment.amountSettled)} tokens</span>
        </div>
        <div className="info-row">
          <span>Time:</span>
          <span>{new Date(Number(payment.timestamp) * 1000).toLocaleString()}</span>
        </div>
      </div>
    </div>
  )
}
