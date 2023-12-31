import { paymentsCollection } from './db.js'
import { getEvePaymentJournal, sendMail } from './eve-api.js'
import { fulfilWithdrawalRequest, getWithdrawalRequestAmount } from './withdrawals.js'

export const PAYMENT_TYPES = {
  DEPOSIT: 'deposit',
  WITHDRAWAL_PENDING: 'withdrawal_pending',
  WITHDRAWAL: 'withdrawal',
  RESERVE: 'reserve',
  RELEASE: 'release',
  JOB_COMPLETE: 'job_complete',
  PLEX_FOR_GOOD: 'plex_for_good'
}

const PAYMENT_REASONS = ['deposit', 'withdrawal']

const cleanReason = r => r.replace('balance', 'deposit')

export const updatePaymentsFromCorpJournal = async () => {
  const journal = (await getEvePaymentJournal()).journal.data
  console.log('updatePaymentsFromCorpJournal START', journal)
  const entries = journal
    .filter(j => PAYMENT_REASONS.includes(cleanReason(j.reason.toLowerCase())))
    .map(j => {
      const type = cleanReason(j.reason.toLowerCase())
      const characterID = type === 'deposit' ? j.first_party_id : j.second_party_id
      return { _id: j.id, date: j.date, characterID, type, amount: j.amount }
    })
  for (const entry of entries) {
    console.log('entry', entry)

    const result = await paymentsCollection.updateOne(
      { _id: entry._id },
      { $set: entry },
      { upsert: true }
    )

    if (result.upsertedCount > 0) {
      console.log('INSERTED')
      // Document was inserted

      // May be a deposit or withdrawal
      if (entry.type === 'deposit') {
        const body = `
<font size="14" color="#bfffffff">
Thanks for choosing Jita Anywhere.<br><br>
We've updated your balance to include your ${cleanReason(entry.type)} of ${entry.amount.toLocaleString()} ISK<br/><br/></font>`.replace(/\n/g, '')
        await sendMail(entry.characterID, 'Jita Anywhere - Deposit', body)
      } else {
        const body = `
<font size="14" color="#bfffffff">
Your withdrawal has been completed.<br><br>
We've updated your balance to include your ${cleanReason(entry.type)} of ${entry.amount.toLocaleString()} ISK<br/><br/></font>`.replace(/\n/g, '')
        await sendMail(entry.characterID, 'Jita Anywhere - Withdrawal', body)
        await fulfilWithdrawalRequest(entry.characterID)
      }
    }
  }
  //   paymentsCollection
  console.log('updatePaymentsFromCorpJournal END')
}
export const getPlexForTotal = async (plexForGoodCharacterID) => {
  const result = await paymentsCollection.aggregate([
    {
      $match: {
        characterID: plexForGoodCharacterID,
        type: PAYMENT_TYPES.PLEX_FOR_GOOD
      }
    },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: '$amount' }
      }
    },
    {
      $project: {
        _id: 0,
        totalAmount: 1
      }
    }
  ]).toArray()

  // Extract the totalAmount from the result
  return result.length > 0 ? result[0].totalAmount : 0
}
export const getBalance = async (characterID) => {
  // console.log('getBalance', characterID)
  const pipeline = [
    {
      $match: { characterID }
    },
    {
      $sort: { date: -1 }
    },
    {
      $group: {
        _id: '$characterID',
        entries: {
          $push: {
            date: '$date',
            type: '$type',
            amount: '$amount'
          }
        },
        balance: { $sum: '$amount' }
      }
    }
  ]

  const balances = await paymentsCollection.aggregate(pipeline).toArray()
  if (balances.length < 1) {
    return { entries: [], balance: 0, characterID }
  }
  const balance = balances[0]
  balance.characterID = balance._id
  delete balance._id
  // console.log('balance', balance)

  balance.withdrawal = await getWithdrawalRequestAmount(characterID)
  return balance
}
export const getAllBalances = async () => {
  const pipeline = [
    {
      $sort: { date: -1 }
    },
    {
      $group: {
        _id: '$characterID',
        entries: {
          $push: {
            date: '$date',
            type: '$type',
            amount: '$amount'
          }
        },
        balance: { $sum: '$amount' }
      }
    }
  ]

  const balances = await paymentsCollection.aggregate(pipeline).toArray()
  for (const b of balances) {
    b.characterID = b._id
    delete b._id
  }
  // console.log('balances', balances)

  return balances
}
export const createPayment = async (reservePayment) => {
  await paymentsCollection.insertOne(reservePayment)
}
export const removePendingWithdrawalPayment = async (characterID) => {
  await paymentsCollection.deleteOne({ characterID, type: PAYMENT_TYPES.WITHDRAWAL_PENDING })
}
