import { configCollection } from './db.js'
import { getPlexForTotal } from './payments.js'

const ID_APP_CONFIG = 'appConfig'
const ID_APP_AUTH = 'authConfig'

const appConfigDefault = {
  _id: ID_APP_CONFIG,
  brokerPercent: 0.0175,
  agentPercent: 0.05,
  plexForGoodPercent: 0.05,
  minOrder: 100000,
  plexForGoodCharacterID: 1435692323
}
const appAuthDefault = {
  _id: ID_APP_AUTH,
  characterID: 1435692323,
  characterName: 'Seraph',
  corpID: 98746847,
  corpName: 'Seph Corp',
  accessToken: 'a',
  refreshToken: 'r'
}
export const getAppConfig = async (showPrivateFields) => {
  // const startTime = new Date()
  // console.log('getAppConfig', showPrivateFields)
  const appConfig = await configCollection.findOneAndUpdate(
    { _id: ID_APP_CONFIG },
    { $setOnInsert: appConfigDefault },
    { upsert: true, returnDocument: 'after' }
  )
  const [corpName, corpID, plexForGoodTotal] = await Promise.all([
    getAppAuth().then(auth => auth.corpName),
    getAppAuth().then(auth => auth.corpID),
    getPlexForTotal(appConfig.plexForGoodCharacterID)
  ])

  // console.log('appConfig, corpName, corpID, plexForGoodTotal', appConfig, corpName, corpID, plexForGoodTotal)
  if (appConfig) {
    delete appConfig._id
    appConfig.corpName = corpName || appConfig.corpName
    appConfig.corpID = corpID
    appConfig.plexForGoodTotal = plexForGoodTotal
  }
  // console.log('getAppConfig', appConfig)
  // const endTime = new Date()
  // const elapsedTime = endTime - startTime
  // console.log(`Time taken: ${elapsedTime} milliseconds`)

  return appConfig
}
export const setAppConfig = async (newAppConfig) => {
  console.log('setAppConfig', newAppConfig)
  await configCollection.updateOne({ _id: ID_APP_CONFIG }, { $set: newAppConfig })
  return newAppConfig
}
export const getAppAuth = async () => {
  let appAuth = await configCollection.findOne({ _id: ID_APP_AUTH })
  if (!appAuth) {
    const res = await configCollection.insertOne(appAuthDefault)
    console.log('getAppAuth', res, 'res')
    appAuth = appAuthDefault
  }
  delete appAuth._id
  return appAuth
}
export const setAppAuth = async (newCorpCharacterConfig) => {
  await configCollection.updateOne({ _id: ID_APP_AUTH }, { $set: newCorpCharacterConfig })
  return newCorpCharacterConfig
}
