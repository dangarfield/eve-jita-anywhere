export const getUserBalance = async (user, setUser) => { // TODO - put this in the actual page / component
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
  return body
}
