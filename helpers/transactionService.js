// import TransactionHistory from "../models/TransactionModel.js";

// export async function addTransaction({ userId, type, amount, currency="BDT", status="completed", meta={} }, session=null) {
//   const tx = new TransactionHistory({ userId, type, amount, currency, status, meta });
//   if (session) await tx.save({ session });
//   else await tx.save();
//   return tx;
// }



import TransactionHistory from "../models/TransactionModel.js";

/**
 * Add a new transaction
 */
export async function addTransaction(
  {
    senderId,
    receiverId,
    type,
    amount,
    currency = "BDT",
    status = "completed",
    senderBalanceBefore,
    senderBalanceAfter,
    receiverBalanceBefore,
    receiverBalanceAfter,
    meta = {},
  },
  session = null
) {

  const tx = new TransactionHistory({
    senderId,
    receiverId,
    type,
    amount,
    currency,
    status,
    senderBalanceBefore,
    senderBalanceAfter,
    receiverBalanceBefore,
    receiverBalanceAfter,
    meta,
  });

  if (session) await tx.save({ session });
  else await tx.save();

  return tx;
}
