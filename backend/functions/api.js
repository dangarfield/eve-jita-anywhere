import API from 'lambda-api'
import { verifyAdmin, verifyToken } from '../app/auth.js'
import { ssoAdminLoginStart, ssoAdminReturn } from '../app/sso.js'
import { getAppAuth, getAppConfig, setAppConfig } from '../app/config.js'
import { getEvePaymentJournal } from '../app/eve-api.js'
import { getAllBalances, getBalance, updatePaymentsFromCorpJournal } from '../app/payments.js'
import { addDisputeComment, addDisputeCommentAdmin, createOrder, getAgentOrders, getAllOrders, getAvailableOrders, getOrdersForCharacter, modifyOrderAdmin, modifyOrderUser } from '../app/orders.js'
import { createWithdrawalRequest, getAllWithdrawalRequests, updateWithdrawalRequestCompletionState } from '../app/withdrawals.js'

const app = API()

// Payments
app.get('/api/journal', verifyAdmin, async (req, res) => {
  res.json(await getEvePaymentJournal())
})
app.get('/api/balances/@me', verifyToken, async (req, res) => {
  console.log('/api/balances/@me', 'auth', req.auth.characterID, req.auth.characterName)
  res.json(await getBalance(parseInt(req.auth.characterID)))
})
app.get('/api/balances', verifyAdmin, async (req, res) => {
  res.json(await getAllBalances())
})

// Withdrawals
app.post('/api/withdrawals', verifyToken, async (req, res) => {
  console.log('/api/withdrawals POST', 'auth', req.auth.characterID, req.auth.characterName)
  res.json(await createWithdrawalRequest(req.auth.characterID, req.body.amount))
})
app.get('/api/withdrawals', verifyAdmin, async (req, res) => {
  console.log('/api/withdrawals GET')
  res.json(await getAllWithdrawalRequests())
})
app.patch('/api/withdrawals', verifyAdmin, async (req, res) => {
  console.log('/api/withdrawals PATCH')
  res.json(await updateWithdrawalRequestCompletionState(req.body.characterID, req.body.complete))
})

// Orders
app.get('/api/orders', verifyAdmin, async (req, res) => {
  console.log('/api/orders')
  res.json(await getAllOrders())
})
app.get('/api/orders/@me', verifyToken, async (req, res) => {
  console.log('/api/orders/@me', 'auth', req.auth.characterID, req.auth.characterName)
  res.json(await getOrdersForCharacter(parseInt(req.auth.characterID)))
})
app.get('/api/available-orders', async (req, res) => {
  console.log('/api/available-orders', 'auth', req.auth.characterID, req.auth.characterName)
  res.json(await getAvailableOrders())
})
app.get('/api/agent-orders', verifyToken, async (req, res) => {
  console.log('/api/agent-orders', 'auth', req.auth.characterID, req.auth.characterName)
  res.json(await getAgentOrders(parseInt(req.auth.characterID)))
})
app.post('/api/orders', verifyToken, async (req, res) => {
  console.log('/api/orders', 'auth', req.auth.characterID, req.auth.characterName)
  res.json(await createOrder(parseInt(req.auth.characterID), req.body))
})
app.patch('/api/orders/:orderID', verifyToken, async (req, res) => {
  console.log('/api/orders/:orderID', req.params.orderID, 'auth', req.auth.characterID, req.auth.characterName)
  res.json(await modifyOrderUser(req.params.orderID, req.body, req.auth.characterID))
})
app.patch('/api/orders/:orderID/admin', verifyAdmin, async (req, res) => {
  console.log('/api/orders/:orderID/admin', req.params.orderID)
  res.json(await modifyOrderAdmin(req.params.orderID, req.body))
})
app.post('/api/orders/:orderID/dispute-comments', verifyToken, async (req, res) => {
  console.log('/api/orders/:orderID/dispute-comments', req.params.orderID, 'auth', req.auth.characterID, req.auth.characterName)
  res.json(await addDisputeComment(parseInt(req.auth.characterID), req.params.orderID, req.body))
})
app.post('/api/orders/:orderID/dispute-comments-admin', verifyAdmin, async (req, res) => {
  console.log('/api/orders/:orderID/dispute-comments-admin', req.params.orderID)
  res.json(await addDisputeCommentAdmin(req.params.orderID, req.body))
})

// App Config
app.get('/api/app-config', async (req, res) => {
  return await getAppConfig()
})
app.get('/api/app-config/admin', verifyAdmin, async (req, res) => {
  return await getAppConfig(true)
})
app.post('/api/app-config', verifyAdmin, async (req, res) => {
  return await setAppConfig(req.body)
})
app.get('/api/app-auth', verifyAdmin, async (req, res) => {
  return await getAppAuth()
})

// Admin
app.get('/api/sso/login', verifyAdmin, async function (req, res) {
  const loginUrl = await ssoAdminLoginStart()
  res.json({ loginUrl })
})
app.get('/api/sso/return', async function (req, res) {
  await ssoAdminReturn(req.query.code, req.query.state)
  res.redirect('/admin')
})
app.any('/api/admin-task', verifyAdmin, async function (req, res) {
  const asyncUpdate = async () => {
    await updatePaymentsFromCorpJournal()
  }
  console.log('/api/admin-task')
  asyncUpdate()
  res.json({})
})

export async function handler (event, context) {
  return await app.run(event, context)
}
