import { Button, FloatingLabel, Form } from 'solid-bootstrap'
import { For, Show, createEffect, createMemo, createSignal } from 'solid-js'
import { useStaticData } from '../../stores/StaticDataProvider'
import EveTypeIcon from '../common/EveTypeIcon'
import { getJitaSellOrders } from '../../services/esi'
import { useUser } from '../../stores/UserProvider'
import Loading from '../common/Loading'
import { useBasket } from '../../stores/BasketProvider'
import { TABS } from './ShopPage'

const TypeBrowserAddBulk = ({ setSelectedType, setSelectedTab }) => {
  const [text, setText] = createSignal('')
  const [staticData] = useStaticData()
  const [items, setItems] = createSignal([])
  const [user, { isLoggedIn }] = useUser()
  const [isFetchingPrices, setIsFetchingPrices] = createSignal(false)
  const [basket, { addAllToBasket }] = useBasket()

  const handleTextChange = (event) => {
    const newText = event.target.value
    setText(newText)
    console.log('Text changed:', newText)
  }

  const nameMap = createMemo(() => {
    // new Map()
    const ma = new Map(Object.entries(staticData().types).map(([key, value]) => [value.name, value.type_id]))
    console.log('nameMap', ma)
    return ma
  })
  /* Example multibuy from EVE online

Decayed 10000MN Afterburner Mutaplasmid	4	177,700.00	177,700.00
Decayed Heat Sink Mutaplasmid	1	746,500.00	746,500.00
Unstable Heat Sink Mutaplasmid	1	56,000,000.00	56,000,000.00
Men's 'Crusher' Cybernetic Arm (black and yellow left)  2   120,120.00 232,233.00
Unstable Gyrostabilizer Mutaplasmid	1	23,800,000.00	23,800,000.00
Total:			80,724,200.00

*/
  createEffect(async () => {
    console.log('createEffect', text())
    setIsFetchingPrices(true)
    const itemList = []
    const lines = text().split('\n').filter(l => !l.startsWith('Total'))
    console.log('nameMap', nameMap())
    for (const line of lines) {
      // EVE Online strings
      const parts = line.split(/\s+/)
      const filteredParts = parts.filter(part => !/[,.]/.test(part))
      const quantity = filteredParts.length > 0 ? parseInt(filteredParts[filteredParts.length - 1]) || 1 : 1
      const name = filteredParts.slice(0, -1).join(' ')
      const typeID = nameMap().get(name)
      console.log('name', name, 'quantity', quantity, 'item', typeID)
      if (typeID !== undefined) {
        const type = staticData().types[typeID]
        itemList.push({
          typeID: type.type_id,
          name: type.name,
          type,
          quantity,
          price: 0
        })
      }

      // Show prices?!
    }

    console.log('itemsWithPrices START')

    //   console.log('updatePrices START', itemList)
    const itemsWithPrices = await Promise.all(itemList.map(async (item) => {
      const orders = await getJitaSellOrders(item.typeID)
      if (orders.sell.length > 0) {
        item.price = orders.sell[0].price
      } else {
        item.price = 0
      }
      return item // ?
    }))
    //   console.log('updatePrices END', itemList)
    // })
    console.log('itemsWithPrices END', itemsWithPrices)
    setIsFetchingPrices(false)
    setItems(itemsWithPrices)
    // return itemList
  })
  const handleAddAllToBasketClick = () => {
    // TODO - Should be logged in, there may not be sell orders etc
    console.log('addAllToBasket', items())
    const itemsToAdd = items().filter(i => i.price > 0).map(item => { return { typeID: item.typeID, quantity: item.quantity, price: item.price, name: item.name } })
    console.log('addAllToBasket itemsToAdd', itemsToAdd)
    addAllToBasket(itemsToAdd)
    setSelectedTab(TABS.Basket)
  }

  return (
    <>
      <FloatingLabel controlId='floatingTextarea2' label='Paste multibuy order' class='mb-2'>
        <Form.Control as='textarea' placeholder='Paste multibuy order' style={{ height: '200px' }} value={text()} onInput={handleTextChange} />
      </FloatingLabel>

      {/* <p>items: {JSON.stringify(items())}</p> */}
      <div class='col-6 offset-6 mb-2'>
        <Show when={isLoggedIn()} fallback={<Button class='w-100' disabled='true'>Login to add to basket</Button>}>
          <Button class='w-100' disabled={items().length === 0} onClick={handleAddAllToBasketClick}>Add all to basket</Button>
        </Show>

      </div>
      <div class='d-flex flex-column'>
        <Show when={!isFetchingPrices()} fallback={<Loading />}>

          <For each={items()}>
            {(item) => (
            //   <p>Item: {JSON.stringify(item)}</p>

              <div class='d-flex flex-columns align-items-center mb-2 basket-item'>
                <div class='col-md-5'>
                  <div class='d-flex align-items-center'>
                    <EveTypeIcon type={item.type} />
                    <a
                      class='ps-1 link-light link-underline link-underline-opacity-0 link-underline-opacity-100-hover' href=''
                      onClick={(e) => e.preventDefault() & setSelectedType(item.typeID) & setSelectedTab(TABS.Details)}
                    >{item.name}
                    </a>
                  </div>
                </div>
                <div class='col-md-3 px-1'>
                  <input
                    type='number' class='form-control quantity'
                    value={item.quantity}
                    disabled
                  />
                </div>
                <div class='col-md-4 text-end basket-item-price-line'>
                  <Show when={item.price > 0} fallback={<span>No sell orders</span>}>
                    {Math.ceil(item.price * item.quantity).toLocaleString()} ISK
                    {item.quantity > 1 ? <><br style='height:100px;' /><span class='opacity-50'>{item.price.toLocaleString()} ISK</span></> : ''}
                  </Show>

                </div>
              </div>
            )}
          </For>
        </Show>
      </div>
    </>
  )
}
export default TypeBrowserAddBulk
