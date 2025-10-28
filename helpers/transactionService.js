// import TransactionHistory from "../models/TransactionModel.js";

// export async function addTransaction(
//   {
//     senderId,
//     receiverId,
//     type,
//     amount,
//     currency = "BDT",
//     status = "completed",
//     meta = {},
//   },
//   session = null
// ) {

//   const tx = new TransactionHistory({
//     senderId,
//     receiverId,
//     type,
//     amount,
//     currency,
//     status,
//     meta,
//   });

//   if (session) await tx.save({ session });
//   else await tx.save();

//   return tx;
// }


import TransactionHistory from "../models/TransactionModel.js";

export async function addTransaction(
  {
    senderId,
    receiverId,
    type,
    amount,
    currency = "BDT",
    status = "completed",
    meta = {},
  },
  session = null,
  io = null // pass io instance from controller
) {
  const tx = new TransactionHistory({
    senderId,
    receiverId,
    type,
    amount,
    currency,
    status,
    meta,
  });

  if (session) await tx.save({ session });
  else await tx.save();

  // ✅ Real-time notification
  if (io) {
    // Send to sender
    io.to(meta.fromUserEmail).emit("transactionUpdate", {
      type: "sent",
      message: `You sent ${currency}${amount} to ${meta.toUserEmail}`,
      transaction: tx,
    });

    // Send to receiver
    io.to(meta.toUserEmail).emit("transactionUpdate", {
      type: "received",
      message: `You received ${currency}${amount} from ${meta.fromUserEmail}`,
      transaction: tx,
    });
  }

  return tx;
}
