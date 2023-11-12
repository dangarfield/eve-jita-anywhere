import { For, Show, createEffect, createMemo, createSignal } from 'solid-js'
import { useBasket } from '../../stores/BasketProvider'
import { useStaticData } from '../../stores/StaticDataProvider'
import EveTypeIcon from '../common/EveTypeIcon'
import { Alert, Button } from 'solid-bootstrap'
import './Basket.css'
import { useUser } from '../../stores/UserProvider'
import TopUpInfoModal, { openTopUpInfoModal } from '../common/TopUpInfoModal'
import Delivery from './Delivery'

const Basket = (props) => {
  const [basket, { clearBasket, updatePrices, removeBasketItem, updateBasketQuantity }] = useBasket()
  const [staticData] = useStaticData()
  const [user, { userBalance, triggerDataUpdate, isLoggedIn }] = useUser()

  const [confirmCheckout, setConfirmCheckout] = createSignal(false)
  const [orderCreationInProgress, setOrderCreationInProgress] = createSignal(false)

  const [deliveryCharges, setDeliveryCharges] = createSignal()
  const [deliverySelectedValue, setDeliverySelectedValue] = createSignal('None')

  createEffect(() => {
    // console.log('Basket createEffect')
    triggerDataUpdate() // This causes it to load twice on the first page, but it does ensure that it gets the latest data on this page, which works for now
    setConfirmCheckout(false)
  })

  const purchaseButtonText = createMemo(() => {
    let text = 'Purchase'
    if (confirmCheckout()) text = 'Prices updated\nAre you sure?'
    if (orderCreationInProgress()) text = 'Creating order'
    return text
  })
  const basketData = createMemo(() => {
    const totalMaterialCost = Math.ceil(basket?.reduce((total, basketItem) => total + (basketItem.quantity * basketItem.price), 0))
    // console.log('basketData memo deliveryCharge 1', deliveryCharges(), deliverySelectedValue())
    // const deliveryCharge = deliveryCharges() && deliveryCharges.charge ? deliveryCharges().charge : 0 // TODO - This ends up being repeated
    let deliveryCharge = 0
    if (deliveryCharges() && deliveryCharges().charge) {
      if (deliverySelectedValue() === 'Normal') {
        deliveryCharge = deliveryCharges().charge
      } else if (deliverySelectedValue() === 'Rush') {
        deliveryCharge = deliveryCharges().charge + deliveryCharges().rush
      }
    }
    // console.log('basketData memo deliveryCharge 2', deliveryCharge)
    const brokersFee = Math.ceil(totalMaterialCost * staticData().appConfig.brokerPercent)
    const agentFee = Math.ceil((totalMaterialCost + brokersFee + deliveryCharge) * staticData().appConfig.agentPercent)
    const p4gFee = Math.ceil((totalMaterialCost + brokersFee + deliveryCharge) * staticData().appConfig.plexForGoodPercent)
    const total = totalMaterialCost + brokersFee + deliveryCharge + agentFee + p4gFee
    const totalVolume = Math.ceil(basket.reduce((total, basketItem) => {
      const item = staticData().types[basketItem.typeID]
      return total + (basketItem.quantity * item.volume)
    }, 0))
    const aboveMinimumOrder = total > staticData().appConfig.minOrder
    let balance = 0
    if (userBalance()) balance = userBalance().balance

    return { totalMaterialCost, brokersFee, deliveryCharge, agentFee, p4gFee, total, totalVolume, aboveMinimumOrder, balance }
  })
  const handleQuantityInputChange = (event, basketItem) => {
    let newValue = parseInt(event.target.value)
    if (isNaN(newValue) || newValue <= 0) {
      newValue = 1
    }
    event.target.value = newValue
    updateBasketQuantity(basketItem.typeID, newValue)
    return newValue
  }
  const handlePurchaseClick = () => {
    console.log('handlePurchaseClick', confirmCheckout())
    updatePrices()
    if (!confirmCheckout()) {
      setConfirmCheckout(true)
    } else {
      setOrderCreationInProgress(true)
      window.alert('TBC Handle Order Creation')
    }
  }
  return (
    <>
      {/* <h1>Basket</h1> */}
      {/* <p>Basket: {JSON.stringify(basket)}</p> */}

      <h3>Basket</h3>
      <Show
        when={isLoggedIn() && basket.length > 0} fallback={
          <>
            <Alert variant='dark'>Basket empty</Alert>
            <Show
              when={isLoggedIn() && basketData().balance > 0} fallback={
                <Alert variant='border border-danger text-danger text-center'>
                  <p>Account Balance - {basketData().balance.toLocaleString()} ISK</p>
                  <Button class='ms-2' variant='outline-primary' onClick={openTopUpInfoModal}>Top up your balance</Button>
                </Alert>
            }
            >
              <div class='d-flex align-items-center'>
                <span class='col-4'>Account Balance</span>
                <Button size='sm' variant='outline-primary' onClick={openTopUpInfoModal}><span class='opacity-50xx'>Top up</span></Button>
                <span class='ms-auto'>{basketData().balance.toLocaleString()} ISK</span>
              </div>
            </Show>
          </>
        }
      >
        <p class='opacity-50'>
          Our agents will attempt to buy the cheapest price for you, however, every ISK above these current ESI prizes, they will lose out.
        </p>
        <p class='opacity-50'>
          If the order becomes too espensive, it will return back to you and you can choose to accept the updated prices.
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

        <Delivery
          totalVolume={basketData().totalVolume}
          totalMaterialCost={basketData().totalMaterialCost}
          deliveryCharges={deliveryCharges}
          setDeliveryCharges={setDeliveryCharges}
          deliverySelectedValue={deliverySelectedValue}
          setDeliverySelectedValue={setDeliverySelectedValue}
        />
        <hr />
        <div class='d-flex'>
          <span class='col-4'>Materials Total</span>
          <span class='opacity-50'>Estimate</span>
          <span class='ms-auto'>{basketData().totalMaterialCost.toLocaleString()} ISK</span>
        </div>

        <div class='d-flex'>
          <span class='col-4'>Broker Fee</span>
          <span class='opacity-50'>{(staticData().appConfig.brokerPercent * 100).toFixed(2)} %</span>
          <span class='ms-auto'>{basketData().brokersFee.toLocaleString()} ISK</span>
        </div>

        <div class='d-flex'>
          <span class='col-4'>Delivery Fee</span>
          <span class='opacity-50'>{deliverySelectedValue()}</span>
          <span class='ms-auto'>{basketData().deliveryCharge.toLocaleString()} ISK</span>
        </div>

        <div class='d-flex'>
          <span class='col-4'>Agent Fee</span>
          <span class='opacity-50'>{(staticData().appConfig.agentPercent * 100).toFixed()} %</span>
          <span class='ms-auto'>{basketData().agentFee.toLocaleString()} ISK</span>
        </div>

        <div class='d-flex'>
          <span class='col-4'>Plex For Good Fee</span>
          <span class='opacity-50'>{(staticData().appConfig.plexForGoodPercent * 100).toFixed()} %</span>
          <span class='ms-auto'>{basketData().agentFee.toLocaleString()} ISK</span>
        </div>

        <hr />

        <div class='d-flex justify-content-between'>
          <span class=''>Total</span>
          <span class=''>{basketData().total.toLocaleString()} ISK</span>
        </div>

        <Show when={!basketData().aboveMinimumOrder}>
          <hr />
          <Alert variant='border border-danger text-danger text-center'>Not above minimum order of {staticData().appConfig.minOrder.toLocaleString()} ISK</Alert>
        </Show>

        <hr />

        {/* <p>{basketData().balance} - {basketData().total}</p> */}
        <Show
          when={basketData().balance > basketData().total} fallback={
            <Alert variant='border border-danger text-danger text-center'>
              <p>Your balance is too loo - {basketData().balance.toLocaleString()} ISK</p>
              <Button class='ms-2' onClick={openTopUpInfoModal}>Top up your balance</Button>
            </Alert>
        }
        >
          <div class='d-flex align-items-center'>
            <span class='col-4'>Account Balance</span>
            <Button size='sm' variant='outline-primary' onClick={openTopUpInfoModal}><span class='opacity-50xx'>Top up</span></Button>
            <span class='ms-auto'>{basketData().balance.toLocaleString()} ISK</span>
          </div>
          <div class='d-flex justify-content-between'>
            <span class=''>End Balance</span>
            <span class=''>{(basketData().balance - basketData().total).toLocaleString()} ISK</span>
          </div>
        </Show>

        <hr />

        <div class='d-flex justify-content-between gap-2'>
          <Button class='w-100' variant='btn btn-outline-secondary' onClick={clearBasket}>Clear Basket</Button>
          <Button class='w-100' variant='btn btn-outline-primary' onClick={updatePrices}>Check Prices</Button>
          <Button class='w-100' onClick={handlePurchaseClick} disabled={!basketData().aboveMinimumOrder || basketData().balance < basketData().total || orderCreationInProgress()}>{purchaseButtonText}</Button>
        </div>

      </Show>
      <TopUpInfoModal />
    </>
  )
}
export default Basket
