import { password } from '../components/admin/PasswordSignal'

export const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}
export const getAdmin = async (url) => {
  return get(url, password())
}
export const get = async (url, password) => {
  const options = {
    method: 'GET',
    headers: {
      Accept: 'application/json, text/plain, */*',
      'Content-Type': 'application/json'
    }
  }
  if (password) {
    options.headers.Authorization = password
  }
  const req = await window.fetch(url, options)
  const res = await req.json()
  return res
}
export const post = async (url, bodyObject, password) => {
  const options = {
    method: 'POST',
    headers: {
      Accept: 'application/json, text/plain, */*',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(bodyObject)
  }
  if (password) {
    options.headers.Authorization = password
  }
  const req = await window.fetch(url, options)
  const res = await req.json()
  return res
}
