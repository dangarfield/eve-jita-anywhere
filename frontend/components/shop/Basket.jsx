import { For, Show, createMemo } from 'solid-js'
import { useBasket } from '../../stores/BasketProvider'
import { useStaticData } from '../../stores/StaticDataProvider'
import EveTypeIcon from '../common/EveTypeIcon'
import { Alert, Button } from 'solid-bootstrap'
import './Basket.css'

const Basket = (props) => {
  const [basket, { clearBasket, updatePrices, removeBasketItem, updateBasketQuantity }] = useBasket()
  const [staticData] = useStaticData()

  const brokerFeePerc = 0.0175
  const shopFeePerc = 0.05

  const basketData = createMemo(() => {
    const totalMaterialCost = Math.ceil(basket?.reduce((total, basketItem) => total + (basketItem.quantity * basketItem.price), 0))
    // console.log('totalMaterialCost memo', basket, totalMaterialCost)
    const brokersFee = Math.ceil(totalMaterialCost * brokerFeePerc)
    const shopFee = Math.ceil((totalMaterialCost + brokersFee) * shopFeePerc)
    const total = totalMaterialCost + brokersFee + shopFee
    const totalVolume = Math.ceil(basket.reduce((total, basketItem) => {
      const item = staticData().types[basketItem.typeID]
      return total + (basketItem.quantity * item.volume)
    }, 0))
    return { totalMaterialCost, brokersFee, shopFee, total, totalVolume }
  })
  // const totalMaterialCost = Math.ceil(basket.reduce((total, basketItem) => total + (basketItem.quantity * basketItem.price), 0))

  const handleQuantityInputChange = (event, basketItem) => {
    let newValue = parseInt(event.target.value)
    if (isNaN(newValue) || newValue <= 0) {
      newValue = 1
    }
    // console.log('handleQuantityInputChange', event.target.value, newValue, basketItem, updateBasketQuantity)
    event.target.value = newValue
    updateBasketQuantity(basketItem.typeID, newValue)
    return newValue
  }
  return (
    <>
      {/* <h1>Basket</h1> */}
      {/* <p>Basket: {JSON.stringify(basket)}</p> */}

      <h3>Basket</h3>
      <Show when={basket.length > 0} fallback={<Alert variant='dark'>Basket empty</Alert>}>
        <p class='opacity-50'>
          Our agents will attempt to buy the cheapest price for you, however, if the displayed price is available, they will spend a maximum of 10% more per item.
          If the price still exceeds 10%, the order will return back to you.
        </p>
        <div class='d-flex flex-column'>
          <For each={basket}>
            {(basketItem) => (
              <>
                <div class='d-flex flex-columns align-items-center mb-2 basket-item'>
                  <div class='col-md-5'>
                    <div class='d-flex align-items-center'>
                      <EveTypeIcon type={staticData().types[basketItem.typeID]} />
                      <a class='ps-1 link-light link-underline link-underline-opacity-0 link-underline-opacity-100-hover' href='' onClick={(e) => e.preventDefault() & props.setSelectedType(basketItem.typeID)}>{staticData().types[basketItem.typeID].name}</a>
                      <i class='ms-auto bi bi-x' onClick={() => removeBasketItem(basketItem.typeID)} />
                    </div>
                  </div>
                  <div class='col-md-3 px-1'>
                    <input
                      type='number' class='form-control quantity'
                      value={basketItem.quantity}
                      data-type-id={basketItem.typeID}
                      onInput={(event) => handleQuantityInputChange(event, basketItem)}
                      required
                    />
                  </div>
                  <div class='col-md-4 text-end basket-item-price-line'>
                    {Math.ceil(basketItem.price * basketItem.quantity).toLocaleString()} ISK
                    {basketItem.quantity > 1 ? <><br style='height:100px;' /><span class='opacity-50'>{basketItem.price.toLocaleString()} ISK</span></> : ''}
                  </div>
                </div>
              </>
            )}
          </For>
        </div>
        <hr />
        <div class='d-flex'>
          <span class='col-4'>Materials Total</span>
          <span class='opacity-50'>Estimate</span>
          <span class='ms-auto'>{basketData().totalMaterialCost.toLocaleString()} ISK</span>
        </div>

        <div class='d-flex'>
          <span class='col-4'>Broker Fee</span>
          <span class='opacity-50'>{(brokerFeePerc * 100).toFixed(2)} %</span>
          <span class='ms-auto'>{basketData().brokersFee.toLocaleString()} ISK</span>
        </div>

        <div class='d-flex'>
          <span class='col-4'>Shop Fee</span>
          <span class='opacity-50'>{(shopFeePerc * 100).toFixed(0)} %</span>
          <span class='ms-auto'>{basketData().shopFee.toLocaleString()} ISK</span>
        </div>

        <hr />

        <div class='d-flex justify-content-between'>
          <span class=''>Total</span>
          <span class=''>{basketData().total.toLocaleString()} ISK</span>
        </div>

        <div class='d-flex justify-content-between'>
          <span class='col-4'>Max Total</span>
          <span class='opacity-50'>+10 % contingency</span>
          <span class='ms-auto'>{Math.ceil(basketData().total * 1.1).toLocaleString()} ISK</span>
        </div>

        <div class='d-flex justify-content-between'>
          <span class=''>Total Volume</span>
          <span class=''>{basketData().totalVolume.toLocaleString()} m<sup>3</sup></span>
        </div>

        <hr />

        <Alert variant='border border-danger text-danger text-center'>TODO - Add delivery services</Alert>

        <hr />

        <Alert variant='border border-danger text-danger text-center'>TODO - Add your balance</Alert>

        <hr />

        <div class='d-flex justify-content-between gap-2'>
          <Button class='w-100' variant='btn btn-outline-secondary' onClick={clearBasket}>Clear Basket</Button>
          <Button class='w-100' variant='btn btn-outline-primary' onClick={updatePrices}>Check Prices</Button>
          <Button class='w-100' onClick={() => window.alert('TODO - Not implemented yet')}>Purchase</Button>
        </div>

      </Show>

    </>
  )
}
export default Basket
