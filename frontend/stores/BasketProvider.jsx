import { createContext, createEffect, useContext } from 'solid-js'
import { createStore } from 'solid-js/store'
import { getJitaSellOrders } from '../services/esi'

const BasketContext = createContext()

const cloneBasket = (basket) => {
  return basket.map(b => ({ typeID: b.typeID, name: b.name, quantity: b.quantity, price: b.price }))
}
const sortBasket = (basket) => {
  basket.sort((a, b) => a.name.localeCompare(b.name))
}
export function BasketProvider (props) {
  const localBasket = window.localStorage.getItem('jita-anywhere-basket')
  const [basket, setBasket] = createStore(localBasket ? JSON.parse(localBasket) : [])
  // createEffect(() => {
  //   console.log('basket effect', basket)
  // })
  createEffect(() => window.localStorage.setItem('jita-anywhere-basket', JSON.stringify(basket)))

  const basketStore = [
    basket,
    {
      addToBasket (item) {
        setBasket((basket) => {
          console.log('addToBasket item', item)
          const newBasket = cloneBasket(basket)
          const existingItem = newBasket.find((basketItem) => basketItem.typeID === item.typeID)
          if (existingItem) {
            existingItem.quantity += item.quantity
            existingItem.price = item.price
          } else {
            newBasket.push(item)
          }
          sortBasket(newBasket)
          console.log('addToBasket end', item, newBasket)
          return newBasket
        })
      },
      updateBasketQuantity (typeID, quantity) {
        setBasket((o) => o.typeID === typeID, 'quantity', quantity)
      },
      removeBasketItem (typeID) {
        setBasket((basket) => {
          console.log('removeBasketItem typeID', typeID)
          const newBasket = cloneBasket(basket)
          const index = newBasket.findIndex((basketItem) => basketItem.typeID === typeID)
          if (index !== -1) {
            newBasket.splice(index, 1)
          }
          sortBasket(newBasket)
          setBasket(newBasket)
          console.log('removeBasketItem end', typeID, newBasket)
          return newBasket
        })
      },
      clearBasket () {
        console.log('clearBasket')
        setBasket([])
      },
      async updatePrices () {
        const newBasket = cloneBasket(basket)
        console.log('updatePrices', basket, newBasket)
        const promises = newBasket.map(async (basketItem) => {
          const orders = await getJitaSellOrders(basketItem.typeID)
          if (orders.sell.length > 0) {
            basketItem.price = orders.sell[0].price
          }
        })
        await Promise.all(promises)
        setBasket((basket) => {
          console.log('updatePrices end', newBasket)
          return newBasket
        })
      }
    }
  ]

  return (
    <BasketContext.Provider value={basketStore}>
      {props.children}
    </BasketContext.Provider>
  )
}

export function useBasket () {
  return useContext(BasketContext)
}
