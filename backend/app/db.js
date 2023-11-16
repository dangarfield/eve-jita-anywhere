import { MongoClient, ServerApiVersion } from 'mongodb'

// console.log('process.env.MONGO_URI', process.env.MONGO_URI)
const client = new MongoClient(process.env.MONGO_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: false, // Must be false to use distinct
    deprecationErrors: true
  }
})
const db = client.db('jitaanywhere')

export const configCollection = db.collection('config')
export const paymentsCollection = db.collection('payments')
export const ordersCollection = db.collection('orders')
export const withdrawalsCollection = db.collection('withdrawals')

// TODO - Ensure indexes
