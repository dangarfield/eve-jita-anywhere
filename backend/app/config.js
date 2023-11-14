import { configCollection } from './db.js'
import { getPlexForTotal } from './payments.js'

const ID_APP_CONFIG = 'appConfig'
const ID_APP_AUTH = 'authConfig'

const appConfigDefault = {
  _id: ID_APP_CONFIG,
  brokerPercent: 0.0175,
  agentPercent: 0.05,
  plexForGoodPercent: 0.05,
  minOrder: 100000
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
  // console.log('getAppConfig')
  let appConfig = await configCollection.findOne({ _id: ID_APP_CONFIG })
  if (!appConfig) {
    await configCollection.insertOne(appConfigDefault)
    appConfig = appConfigDefault
  }
  delete appConfig._id
  if (!showPrivateFields) {
    // delete appConfig.corpDivisionId
    // delete appConfig.corpDivisionName
  }
  appConfig.corpName = (await getAppAuth()).corpName
  appConfig.plexForGoodTotal = await getPlexForTotal()
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
