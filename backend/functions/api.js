import API from 'lambda-api'
import { verifyAdmin } from '../app/auth'
import { ssoAdminLoginStart, ssoAdminReturn } from '../app/sso'
import { getAppAuth, getAppConfig, setAppConfig } from '../app/config'
const app = API()

app.get('/api', async function (req, res) {
  console.log('API /api')
  res.json({ hello: 'world' })
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

export async function handler (event, context) {
  return await app.run(event, context)
}
