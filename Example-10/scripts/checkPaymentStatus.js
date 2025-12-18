// Check payment status

const GATEWAY_ADDRESS = "0x9a957CBf2938A8f18cC622dCa7452003A3e8f154";
const PAYMENT_ID = "0xYourPaymentIdToCheck";

async function main() {
  const gateway = await hre.ethers.getContractAt("CrossChainPaymentGateway", GATEWAY_ADDRESS);
  
  const payment = await gateway.getPayment(PAYMENT_ID);
  
  if (payment.timestamp === 0n) {
    console.log("Payment not found");
    return;
  }
  
  console.log("Payment ID:", PAYMENT_ID);
  console.log("Payer:", payment.payer);
  console.log("Merchant:", payment.merchant);
  console.log("Amount Paid:", hre.ethers.formatEther(payment.amountPaid));
  console.log("Expected Settlement:", hre.ethers.formatEther(payment.amountSettled));
  
  const statusNames = ["Pending", "Settled", "Completed", "Refunded"];
  console.log("Status:", statusNames[payment.status]);
  
  const isSettled = await gateway.isPaymentSettled(PAYMENT_ID);
  console.log("Swap Executed:", isSettled);
  
  const merchantInfo = await gateway.getMerchantInfo(payment.merchant);
  console.log("Settlement Address:", merchantInfo.settlementAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
