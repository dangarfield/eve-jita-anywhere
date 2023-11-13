import { password } from '../components/admin/PasswordSignal'

export const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}
export const getAdmin = async (url) => {
  return get(url, password())
}
export const get = async (url, password) => {
  return executeFetch('GET', url, undefined, password)
}
export const post = async (url, bodyObject, password) => {
  return executeFetch('POST', url, bodyObject, password)
}
export const patch = async (url, bodyObject, password) => {
  return executeFetch('PATCH', url, bodyObject, password)
}

const executeFetch = async (method, url, bodyObject, password) => {
  const options = {
    method,
    headers: {
      Accept: 'application/json, text/plain, */*',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(bodyObject)
  }
  if (bodyObject) {
    options.body = JSON.stringify(bodyObject)
  }
  if (password) {
    options.headers.Authorization = `Bearer ${password}`
  }
  const req = await window.fetch(url, options)
  const res = await req.json()
  return res
}
