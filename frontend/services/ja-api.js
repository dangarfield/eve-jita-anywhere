// import { useUser } from '../stores/UserProvider'

// const [user] = useUser()
export const getUserBalance = async (user, setUser) => {
  const url = '/api/balances/@me'
  const res = await window.fetch(url, { // TODO retry?
    method: 'GET',
    headers: {
      Accept: 'application/json, text/plain, */*',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${user.access_token}`
    }
  })
  const body = await res.json()
  //   for (const p of body) {
  //     p.creationDate = new Date(p.creationDate)
  //   }
  //   body.sort((a, b) => b.creationDate - a.creationDate)
  return body
}
