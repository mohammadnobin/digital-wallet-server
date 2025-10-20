import TransactionHistory from "../models/TransactionModel.js";

export async function addTransaction({ userId, type, amount, currency="BDT", status="completed", meta={} }, session=null) {
  const tx = new TransactionHistory({ userId, type, amount, currency, status, meta });
  if (session) await tx.save({ session });
  else await tx.save();
  return tx;
}
