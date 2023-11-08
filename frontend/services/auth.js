import { createSSO } from './eve-sso-pkce.es.js'

const SSO_CONFIG = window.location.href.includes('localhost')
  ? {
      clientId: '696dd6866fa3435e9382d29cf7e657fd',
      redirectUri: 'http://localhost:8888/sso-return'
    }
  : {
      clientId: 'd216c1de59c54644bb3729e89ea19bb9',
      redirectUri: 'https://jita-anywhere.netlify.app/sso-return'
    }

export const triggerLoginFlow = async () => {
  const sso = createSSO(SSO_CONFIG)
  console.log('triggerLoginFlow', sso)

  const ssoUri = await sso.getUri([])

  window.localStorage.setItem('jita-anywhere-return-url', window.location.href)
  window.localStorage.setItem('jita-anywhere-code-verifier', ssoUri.codeVerifier)
  window.location.assign(ssoUri.uri)
}
export const triggerReturnFlow = async () => {
  console.log('triggerReturnFlow')

  try {
    const returnURL = window.localStorage.getItem('jita-anywhere-return-url')
    const codeVerifier = window.localStorage.getItem('jita-anywhere-code-verifier')
    const code = new URLSearchParams(window.location.search).get('code')
    console.log('sso', returnURL, codeVerifier, code)
    const sso = createSSO(SSO_CONFIG)
    const token = await sso.getAccessToken(code, codeVerifier)
    token.character_id = token.payload.sub.replace('CHARACTER:EVE:', '')
    console.log('token', token)
    window.localStorage.setItem('jita-anywhere-user', JSON.stringify(token))
    window.localStorage.removeItem('jita-anywhere-return-url')
    window.localStorage.removeItem('jita-anywhere-code-verifier')
    window.location.assign(returnURL)
  } catch (error) {
    console.log('error', error)
    window.alert('This was an error logging in') // TODO - Better error handling UI
  }
}
