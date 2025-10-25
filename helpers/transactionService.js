import TransactionHistory from "../models/TransactionModel.js";

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
