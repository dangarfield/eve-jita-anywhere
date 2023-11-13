import { ordersCollection } from './db'
import { sendOnSiteNotification } from './notifications'
import { PAYMENT_TYPES, createPayment, getBalance } from './payments'
import { nanoid } from 'nanoid'

const ORDER_STATUS = {
  AVAILABLE: 'AVAILABLE',
  SELECTED: 'SELECTED',
  PRICE_INCREASE: 'PRICE_INCREASE',
  CANCELLED: 'CANCELLED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETE: 'COMPLETE'
}

export const createOrder = async (characterID, order) => {
  // Validate order and user balance
  const { balance } = await getBalance(characterID)
  console.log('verify balance', balance, order.totals.total)
  if (balance < order.totals.total) {
    console.log('Balance too low for order')
    return { error: 'Your balance is too low' }
  }

  // Create Order
  order._id = nanoid(10)
  order.characterID = characterID
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
    characterID,
    date: order.creationDate,
    type: PAYMENT_TYPES.RESERVE,
    relatedOrderID: order._id
  }
  await createPayment(reservePayment)

  // Notify Agents of new order
  await sendOnSiteNotification('orders', 'New order available for agents')

  return { success: true }
}
export const getOrdersForCharacter = async (characterID) => {
  const orders = await ordersCollection.find({ characterID }).sort({ creationDate: -1 }).toArray()
  for (const order of orders) {
    order.orderID = order._id
    delete order._id
  }
  // console.log('orders', orders, characterID)
  return orders
}
export const getAvailableOrders = async () => {
  const orders = await ordersCollection.find({ status: ORDER_STATUS.AVAILABLE }).sort({ creationDate: -1 }).toArray()
  for (const order of orders) {
    order.orderID = order._id
    delete order._id
  }
  // console.log('getAvailableOrders', orders)
  return orders
}

export const modifyOrder = async (characterID, orderID, updateCommand) => {
  console.log('modifyOrder', characterID, orderID, updateCommand)
  const order = await ordersCollection.findOne({ _id: orderID })
  console.log('modifyOrder', order)
  const nowDate = new Date()
  if (updateCommand.status) {
    // Change status -> AVAILABLE to CANCELLED
    if (order.status === ORDER_STATUS.AVAILABLE && updateCommand.status === ORDER_STATUS.CANCELLED && order.characterID === characterID) {
      await ordersCollection.updateOne(
        { _id: order._id },
        { $set: { status: updateCommand.status }, $push: { statusHistory: { status: updateCommand.status, date: nowDate } } }
      )
      const payment = {
        _id: nanoid(10),
        amount: order.totals.total,
        characterID,
        date: nowDate,
        type: PAYMENT_TYPES.RELEASE,
        relatedOrderID: order._id
      }
      await createPayment(payment)
      return { success: true }
    }
    // // Change status -> CANCELLED to AVAILABLE
    // if (order.status === ORDER_STATUS.CANCELLED && updateCommand.status === ORDER_STATUS.AVAILABLE && order.characterID === characterID) {
    //   await ordersCollection.updateOne(
    //     { _id: order._id },
    //     { $set: { status: updateCommand.status, creationDate: nowDate }, $push: { statusHistory: { status: updateCommand.status, date: nowDate } } }
    //   )
    //   const payment = {
    //     _id: nanoid(10),
    //     amount: -order.totals.total,
    //     characterID,
    //     date: nowDate,
    //     type: PAYMENT_TYPES.RESERVE,
    //     relatedOrderID: order._id
    //   }
    //   await createPayment(payment)
    //   return { success: true }
    // }
  }

  return { error: 'Unknown action' }
}
