import { getAppConfig } from './config.js'
import { ordersCollection } from './db.js'
import { sendOnSiteNotification } from './notifications.js'
import { PAYMENT_TYPES, createPayment, getBalance } from './payments.js'
import { nanoid } from 'nanoid'

const ORDER_STATUS = {
  AVAILABLE: 'AVAILABLE',
  PRICE_INCREASE: 'PRICE_INCREASE',
  CANCELLED: 'CANCELLED',
  IN_PROGRESS: 'IN_PROGRESS',
  DELIVERED: 'DELIVERED', // Why delivered? Allows opportunity for dispute management
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
  // TODO - Remove any disputes or other data
  // console.log('getAvailableOrders', orders)
  return orders
}
export const getAgentOrders = async (characterID) => {
  const orders = await ordersCollection.find({ agent: characterID }).sort({ creationDate: -1 }).toArray()
  for (const order of orders) {
    order.orderID = order._id
    delete order._id
  }
  console.log('getAgentOrders', orders, characterID)
  return orders
}

export const modifyOrder = async (characterID, orderID, updateCommand) => {
  console.log('modifyOrder', characterID, orderID, updateCommand)
  const order = await ordersCollection.findOne({ _id: orderID })
  // console.log('modifyOrder', order)
  const nowDate = new Date()
  if (updateCommand.status) {
    // Change status -> AVAILABLE to CANCELLED
    if (
      (order.status === ORDER_STATUS.AVAILABLE || order.status === ORDER_STATUS.PRICE_INCREASE) &&
       updateCommand.status === ORDER_STATUS.CANCELLED && order.characterID === characterID
    ) {
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
    // Change status -> AVAILABLE to IN_PROGRESS
    if (order.status === ORDER_STATUS.AVAILABLE && updateCommand.status === ORDER_STATUS.IN_PROGRESS) {
      await ordersCollection.updateOne(
        { _id: order._id },
        { $set: { status: updateCommand.status, agent: characterID }, $push: { statusHistory: { status: updateCommand.status, date: nowDate } } }
      )
      // TODO - Somehow notify the user that this is now in progress
      return { success: true }
    }

    // Change status -> IN_PROGRESS to PRICE_INCREASE
    if (order.status === ORDER_STATUS.IN_PROGRESS && updateCommand.status === ORDER_STATUS.PRICE_INCREASE && order.agent === characterID) {
      await ordersCollection.updateOne(
        { _id: order._id },
        { $set: { status: updateCommand.status }, $unset: { agent: '' }, $push: { statusHistory: { status: updateCommand.status, date: nowDate } } }
      )
      // TODO - Somehow notify the user that this is now price_increase
      return { success: true }
    }
    // Change status -> PRICE_INCREASE to AVAILABLE
    if (order.status === ORDER_STATUS.PRICE_INCREASE && updateCommand.status === ORDER_STATUS.AVAILABLE && order.characterID === characterID && updateCommand.items && updateCommand.totals) {
      const { balance } = await getBalance(characterID)
      console.log('verify balance', balance, order.totals.total)
      if ((balance + order.totals.total - updateCommand.totals.total) < 0) {
        console.log('Balance too low for order')
        return { error: 'Your balance is too low' }
      }
      const nowDate = new Date()

      await ordersCollection.updateOne(
        { _id: order._id },
        {
          $set: {
            status: updateCommand.status,
            creationDate: nowDate,
            items: updateCommand.items,
            totals: updateCommand.totals
          },
          $push: { statusHistory: { status: updateCommand.status, date: nowDate } }
        }
      )
      const releasePayment = {
        _id: nanoid(10),
        amount: order.totals.total,
        characterID,
        date: new Date(),
        type: PAYMENT_TYPES.RELEASE,
        relatedOrderID: order._id
      }
      await createPayment(releasePayment)
      const reservePayment = {
        _id: nanoid(10),
        amount: -updateCommand.totals.total,
        characterID,
        date: new Date(),
        type: PAYMENT_TYPES.RESERVE,
        relatedOrderID: order._id
      }
      await createPayment(reservePayment)

      await sendOnSiteNotification('orders', 'New order available for agents')

      return { success: true }
    }
    // Change status -> IN_PROGRESS to DELIVERED
    if (order.status === ORDER_STATUS.IN_PROGRESS && updateCommand.status === ORDER_STATUS.DELIVERED && order.agent === characterID) {
      await ordersCollection.updateOne(
        { _id: order._id },
        { $set: { status: updateCommand.status }, $push: { statusHistory: { status: updateCommand.status, date: nowDate } } }
      )
      // TODO - Somehow notify the user that this is now delivered
      return { success: true }
    }
    // Change status -> DELIVERED to COMPLETE
    if (order.status === ORDER_STATUS.DELIVERED && updateCommand.status === ORDER_STATUS.COMPLETE && order.characterID === characterID) {
      await ordersCollection.updateOne(
        { _id: order._id },
        { $set: { status: updateCommand.status }, $push: { statusHistory: { status: updateCommand.status, date: nowDate } } }
      )
      const releasePayment = {
        _id: nanoid(10),
        amount: order.totals.agentFee + order.totals.deliveryFee,
        characterID: order.agent,
        date: new Date(),
        type: PAYMENT_TYPES.JOB_COMPLETE,
        relatedOrderID: order._id
      }
      await createPayment(releasePayment)
      const appConfig = await getAppConfig()
      const reservePayment = {
        _id: nanoid(10),
        amount: order.totals.p4gFee,
        characterID: appConfig.plexForGoodCharacterID,
        date: new Date(),
        type: PAYMENT_TYPES.PLEX_FOR_GOOD,
        relatedOrderID: order._id
      }
      await createPayment(reservePayment)
      // TODO - Somehow notify the agent that this is now complete
      return { success: true }
    }
  }
  return { error: 'Unknown action' }
}
export const addDisputeComment = async (characterID, orderID, comment) => {
  console.log('addDisputeComment', characterID, orderID, comment)
  const filter = { _id: orderID, $or: [{ characterID }, { agent: characterID }] }
  const update = { $push: { disputes: comment } }
  const result = await ordersCollection.updateOne(filter, update)
  if (result.modifiedCount === 0 && result.upsertedCount === 0) {
    return { success: false, error: 'Invalid order or character' }
  }
  // TODO - Somehow notify the agent, user and admin that there has been an update on the dispute
  return { success: true }
}
