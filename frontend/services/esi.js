// import { sleep } from './utils'

export const getJitaSellOrders = async (itemID) => {
  let maxPages = 1
  let page = 0
  const jitaOrders = { buy: [], sell: [] }
  do {
    page++
    const res = await window.fetch(`https://esi.evetech.net/latest/markets/10000002/orders/?datasource=tranquility&order_type=all&page=${page}&type_id=${itemID}`)
    maxPages = parseInt(res.headers.get('x-pages'))
    const orders = await res.json()
    // console.log('orders', page, maxPages, orders)
    for (const order of orders) {
      if (order.location_id === 60003760) {
        if (order.is_buy_order) {
          jitaOrders.buy.push({ price: order.price, quantity: order.volume_remain })
        } else {
          jitaOrders.sell.push({ price: order.price, quantity: order.volume_remain })
        }
      }
    }
  } while (page < maxPages)
  jitaOrders.buy.sort((a, b) => b.price - a.price)
  jitaOrders.sell.sort((a, b) => a.price - b.price)
  // console.log('jitaOrders', jitaOrders)
  //   await sleep(1000)
  return jitaOrders
}
export const getRegionHistory = async (itemID) => {
  const res = await window.fetch(`https://esi.evetech.net/latest/markets/10000002/history/?datasource=tranquility&type_id=${itemID}`)
  const history = await res.json()
  // await sleep(2000)
  return history
}
export const addCharacterNames = async (objects) => {
  for (const object of objects) {
    if (object.characterID) {
      object.characterName = await getCharacterName(object.characterID)
    }
  }
}
export const getCharacterName = async (characterID) => {
  const res = await window.fetch(`https://esi.evetech.net/latest/characters/${characterID}/?datasource=tranquility`)
  const character = await res.json()
  return character.name
}
