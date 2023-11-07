import API from 'lambda-api'

const app = API()

app.get('/api', async function (req, res) {
  console.log('API /api')
  res.json({hello:'world'})
})


export async function handler (event, context) {
  return await app.run(event, context)
}
