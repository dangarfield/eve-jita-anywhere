import { ordersCollection } from './db'
import { sendOnSiteNotification } from './notifications'
import { PAYMENT_TYPES, createReservePayment, getBalance } from './payments'
import { nanoid } from 'nanoid'

const ORDER_STATUS = {
  AVAILABLE: 'AVAILABLE',
  SELECTED: 'SELECTED',
  PRICE_INCREASE: 'PRICE_INCREASE',
  CANCELLED: 'CANCELLED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETE: 'COMPLETE'
}

export const createOrder = async (characterId, order) => {
  // Validate order and user balance
  const { balance } = await getBalance(characterId)
  console.log('verify balance', balance, order.totals.total)
  if (balance < order.totals.total) {
    console.log('Balance too low for order')
    return { error: 'Your balance is too low' }
  }

  // Create Order
  order._id = nanoid(10)
  order.characterId = characterId
  order.creationDate = new Date()
  order.status = ORDER_STATUS.AVAILABLE
  order.statusHistory = [{ status: ORDER_STATUS.AVAILABLE, date: order.creationDate }]
  console.log('createOrder', order)

  const result = await ordersCollection.insertOne(order)
  console.log('createOrder result', result)

  // Reserve balance for user
  const reservePayment = {
    _id: nanoid(10),
    amount: -order.totals.total,
    characterID: characterId,
    date: order.creationDate,
    type: PAYMENT_TYPES.RESERVE,
    relatedOrderID: order._id
  }
  await createReservePayment(reservePayment)

  // Notify Agents of new order
  await sendOnSiteNotification('orders', 'New order available for agents')

  return { success: true }
}
export const getOrdersForCharacter = async (characterId) => {
  const orders = await ordersCollection.find({ characterId }).toArray()
  console.log('orders', orders)
  return orders
}
