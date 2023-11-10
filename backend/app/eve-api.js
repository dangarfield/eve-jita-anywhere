import { Api } from 'eve-esi-swaggerts'
import { getAppAuth, getAppConfig } from './config.js'
import { updateAndPersistRefreshToken } from './sso.js'

const esi = new Api()

export const ensureAccessTokenIsValid = async () => {
  console.log('ensureAccessTokenIsValid')
  try {
    const { characterId, accessToken, refreshToken } = await getAppAuth()
    const req = await fetch(`https://esi.evetech.net/verify?token=${accessToken}`)
    const res = await req.json()
    // console.log('verify', res)
    if (res.ExpiresOn && new Date(`${res.ExpiresOn}Z`) - new Date() < 0) {
      // console.log('token expired', res.ExpiresOn, new Date())
      const newAccessToken = await updateAndPersistRefreshToken(refreshToken)
      return { characterId, accessToken: newAccessToken }
    }
    return { characterId, accessToken }
  } catch (error) {
    console.error('ensureAccessTokenIsValid ERROR', error)
    throw new Error('ensureAccessTokenIsValid ERROR')
  }
}
export const sendMail = async (recipient, subject, body) => {
  console.log('sendMail req', recipient, subject, body)

  const { characterId, accessToken } = await ensureAccessTokenIsValid()
  // const { characterId, accessToken } = await getAppAuth()
  // const result = await callWithRetry(esi.characters.postCharactersCharacterIdMail, characterId, {
  console.log('sendMail auth', characterId, accessToken, recipient, subject)
  try {
    const result = await esi.characters.postCharactersCharacterIdMail(characterId, {
      body,
      recipients: [{ recipient_id: recipient, recipient_type: 'character' }],
      subject
    }, { token: accessToken })

    console.log('result', result.data)
  } catch (error) {
    console.log('sendMail ERROR', error)

    // NOTE: There can be some blocked contacts, I think there are a few limits too
  }
}
export const getEvePaymentJournal = async () => {
  // console.log('getEvePaymentJournal')
  const appAuth = await getAppAuth()
  const appConfig = await getAppConfig(true)
  const { accessToken } = await ensureAccessTokenIsValid()

  // console.log('getEvePaymentJournal', characterId, accessToken, appAuth.corpId, appConfig.corpDivisionId)
  try {
    const result = (await esi.corporations.getCorporationsCorporationIdWalletsDivisionJournal(appAuth.corpId, 1, { token: accessToken }))
    for (const item of result.data) {
      item.division = appConfig.corpDivisionName
      item.date = new Date(item.date)
    }
    const lastModified = new Date(result.headers.get('last-modified'))
    // console.log('result', result.data, lastModified, lastModified.toLocaleString())

    // const resultMaster = (await esi.corporations.getCorporationsCorporationIdWalletsDivisionJournal(appAuth.corpId, 1, { token: accessToken }))
    // for (const item of resultMaster.data) {
    //   item.division = 'Master Wallet'
    //   item.date = new Date(item.date)
    // }
    // const combinedResult = [...result.data, ...resultMaster.data]
    // combinedResult.sort((a, b) => b.date - a.date)
    // console.log('combinedResult', combinedResult)
    return { journal: result, lastModified }
  } catch (error) {
    console.log('getEvePaymentJournal ERROR', error)
    // NOTE: There can be some blocked contacts, I think there are a few limits too
  }
  return []
}

export const getAllPublicContracts = async () => {
  // const { accessToken } = await ensureAccessTokenIsValid()
  let maxPage = 1
  let pagesFetched = 0
  const contracts = []
  do {
    const res = await esi.contracts.getContractsPublicRegionId('10000002', { page: pagesFetched + 1 })
    const maxPagesHeader = res.headers.get('X-Pages')
    //   console.log('maxPagesHeader', maxPagesHeader)
    if (maxPagesHeader !== undefined) { maxPage = parseInt(maxPagesHeader) }
    contracts.push(...res.data.filter(c => c.type === 'item_exchange'))
    pagesFetched++
  } while (pagesFetched < maxPage)
  // console.log('contracts', contracts, pagesFetched, contracts.length)
  return contracts.map(c => { return { id: c.contract_id, price: c.price } })
}
export const getContractItems = async (contractID) => {
  const res = await esi.contracts.getContractsPublicItemsContractId(contractID)
  if (res.status === 404) return []
  if (res.status === 403) return []
  if (res.error) return []
  if (res.data === null) return []
  return res.data
}
export const getDogmaAttributes = async (itemID, typeID) => {
  return (await esi.dogma.getDogmaDynamicItemsTypeIdItemId(itemID, typeID)).data
}
