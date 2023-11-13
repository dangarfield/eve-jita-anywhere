import { paymentsCollection } from './db'
import { getEvePaymentJournal, sendMail } from './eve-api'

export const PAYMENT_TYPES = { DEPOSIT: 'deposit', WITHDRAWAL: 'withdrawal', RESERVE: 'reserve' }

const PAYMENT_REASONS = ['deposit', 'withdrawal']

const cleanReason = r => r.replace('balance', 'deposit')

export const updatePaymentsFromCorpJournal = async () => {
  const journal = (await getEvePaymentJournal()).journal.data
  console.log('updatePaymentsFromCorpJournal START', journal)
  const entries = journal
    .filter(j => PAYMENT_REASONS.includes(cleanReason(j.reason)))
    .map(j => { return { _id: j.id, date: j.date, characterID: j.first_party_id, type: cleanReason(j.reason), amount: j.amount } })
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
      const body = `
<font size="14" color="#bfffffff">
Thanks for choosing Jita Anywhere.<br><br>
We've updated your balance to include your ${cleanReason(entry.type)} of ${entry.amount.toLocaleString()} ISK<br/><br/></font>`.replace(/\n/g, '')
      sendMail(entry.characterID, 'Jita Anywhere - Deposit ', body)
    }
  }
  //   paymentsCollection
  console.log('updatePaymentsFromCorpJournal END')
}
export const getBalance = async (characterID) => {
  console.log('getBalance', characterID)
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
  console.log('balance', balance)

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
  console.log('balances', balances)

  return balances
}
export const createReservePayment = async (reservePayment) => {
  await paymentsCollection.insertOne(reservePayment)
}
