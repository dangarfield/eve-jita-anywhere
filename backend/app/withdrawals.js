import { nanoid } from 'nanoid'
import { withdrawalsCollection } from './db.js'
import { PAYMENT_TYPES, createPayment, removePendingWithdrawalPayment } from './payments.js'

export const getWithdrawalRequestAmount = async (characterID) => {
  const withdrawalRequest = await withdrawalsCollection.findOne({ _id: characterID })
  if (withdrawalRequest) {
    return { amount: withdrawalRequest.amount, complete: withdrawalRequest.complete }
  }
  return { amount: 0, complete: false }
}
export const createWithdrawalRequest = async (characterID, amount) => {
  console.log('createWithdrawalRequest', characterID, amount)
  if (amount > 0) {
    await withdrawalsCollection.updateOne(
      { _id: characterID },
      { $set: { amount } },
      { upsert: true }
    )
    const withdrawalPayment = {
      _id: nanoid(10),
      amount: -amount,
      characterID,
      date: new Date(),
      type: PAYMENT_TYPES.WITHDRAWAL_PENDING
    }
    await createPayment(withdrawalPayment)
    // TODO - Notify admin that a withdrawal request has been made
  }

  return { success: true }
}
export const fulfilWithdrawalRequest = async (characterID) => {
  await removePendingWithdrawalPayment(characterID)
  await withdrawalsCollection.deleteOne({ _id: characterID })
  return {}
}
export const getAllWithdrawalRequests = async () => {
  const withdrawals = await withdrawalsCollection.find().toArray()
  for (const withdrawal of withdrawals) {
    withdrawal.characterID = withdrawal._id
    delete withdrawal._id
  }
  return withdrawals
}
export const updateWithdrawalRequestCompletionState = async (characterID, complete) => {
  console.log('updateWithdrawalRequestCompletionState', characterID, complete)
  if (complete) {
    await withdrawalsCollection.updateOne({ _id: characterID }, { $set: { complete } })
  } else {
    await withdrawalsCollection.updateOne({ _id: characterID }, { $unset: { complete } })
  }

  return { success: true }
}
