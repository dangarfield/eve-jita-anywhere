import API from 'lambda-api'
import { verifyAdmin, verifyToken } from '../app/auth'
import { ssoAdminLoginStart, ssoAdminReturn } from '../app/sso'
import { getAppAuth, getAppConfig, setAppConfig } from '../app/config'
import { getEvePaymentJournal } from '../app/eve-api'
import { getAllBalances, getBalance, updatePaymentsFromCorpJournal } from '../app/payments'
import { createOrder, getOrdersForCharacter } from '../app/orders'

const app = API()

app.get('/api', async function (req, res) {
  console.log('API /api')
  res.json({ hello: 'world' })
})

// Payments
app.get('/api/journal', verifyAdmin, async (req, res) => {
  res.json(await getEvePaymentJournal())
})
app.get('/api/balances/@me', verifyToken, async (req, res) => {
  console.log('/api/balances/@me', req.params.characterId, 'auth', req.auth.characterId, req.auth.characterName)
  res.json(await getBalance(parseInt(req.auth.characterId)))
})
app.get('/api/balances', verifyAdmin, async (req, res) => {
  res.json(await getAllBalances())
})

// Orders
app.get('/api/orders/@me', verifyToken, async (req, res) => {
  console.log('/api/orders/@me', req.params.characterId, 'auth', req.auth.characterId, req.auth.characterName)
  res.json(await getOrdersForCharacter(parseInt(req.auth.characterId)))
})
app.post('/api/orders', verifyToken, async (req, res) => {
  console.log('/api/orders', req.params.characterId, 'auth', req.auth.characterId, req.auth.characterName)
  res.json(await createOrder(parseInt(req.auth.characterId), req.body))
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
  // res.redirect(loginUrl)
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
