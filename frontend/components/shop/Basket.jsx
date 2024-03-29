import { For, Show, createEffect, createMemo, createResource, createSignal } from 'solid-js'
import { useBasket } from '../../stores/BasketProvider'
import { useStaticData } from '../../stores/StaticDataProvider'
import EveTypeIcon from '../common/EveTypeIcon'
import { Alert, Button } from 'solid-bootstrap'
import './Basket.css'
import { useUser } from '../../stores/UserProvider'
import TopUpInfoModal, { openTopUpInfoModal } from '../common/TopUpInfoModal'
import Delivery from './Delivery'
import { get, post } from '../../services/utils'
import { openInfoModal } from '../common/InfoModal'
import { useNavigate } from '@solidjs/router'
import { TABS } from './ShopPage'

export const calculateBasketTotals = (items, deliveryChargeFromBasket, isRush, rushCharge, userBalanceFromAccount, data) => {
  const totalMaterialCost = Math.ceil(items?.reduce((total, basketItem) => total + (basketItem.quantity * basketItem.price), 0))

  let deliveryCharge = 0
  if (deliveryChargeFromBasket) {
    deliveryCharge = deliveryChargeFromBasket + (isRush ? rushCharge : 0)
  }
  // console.log('data', data)
  // console.log('data.appConfig', data.appConfig)
  // console.log('data.appConfig.brokerPercent', data.appConfig.brokerPercent)
  const brokersFee = Math.ceil(totalMaterialCost * data.appConfig.brokerPercent)
  const agentFee = Math.ceil((totalMaterialCost + brokersFee + deliveryCharge) * data.appConfig.agentPercent)
  const p4gFee = Math.ceil((totalMaterialCost + brokersFee + deliveryCharge) * data.appConfig.plexForGoodPercent)
  const total = totalMaterialCost + brokersFee + deliveryCharge + agentFee + p4gFee
  const totalVolume = Math.ceil(items.reduce((total, basketItem) => {
    const item = data.types[basketItem.typeID]
    return total + (basketItem.quantity * item.volume)
  }, 0))
  const aboveMinimumOrder = total > data.appConfig.minOrder
  const balance = userBalanceFromAccount
  // console.log('balance', balance)
  return { totalMaterialCost, brokersFee, deliveryCharge, agentFee, p4gFee, total, totalVolume, aboveMinimumOrder, balance }
}

const Basket = ({ setSelectedType, setSelectedTab }) => {
  const navigate = useNavigate()
  const [basket, { clearBasket, updatePrices, removeBasketItem, updateBasketQuantity }] = useBasket()
  const [staticData] = useStaticData()
  const [user, { isLoggedIn, characterID, characterName, ensureAccessTokenIsValid }] = useUser()

  const fetchUserBalance = async () => {
    if (isLoggedIn()) {
      const balanceRed = await get('/api/balances/@me', await ensureAccessTokenIsValid())
      return balanceRed.balance
    }
    return 0
  }

  const [userBalance] = createResource(fetchUserBalance)
  const [confirmCheckout, setConfirmCheckout] = createSignal(false)
  const [orderCreationInProgress, setOrderCreationInProgress] = createSignal(false)

  const [deliveryCharges, setDeliveryCharges] = createSignal()
  const [deliverySelectedValue, setDeliverySelectedValue] = createSignal('None')

  createEffect(() => {
    // console.log('Basket createEffect')
    // triggerDataUpdate() // This causes it to load twice on the first page, but it does ensure that it gets the latest data on this page, which works for now
    setConfirmCheckout(false)
  })

  const purchaseButtonText = createMemo(() => {
    let text = 'Purchase'
    if (confirmCheckout()) text = 'Prices updated\nAre you sure?'
    if (orderCreationInProgress()) text = 'Creating order'
    return text
  })

  const basketData = createMemo(() => {
    const deliveryChargeFromBasket = (deliveryCharges() && deliveryCharges().charge && deliverySelectedValue() && deliverySelectedValue() !== 'None') ? deliveryCharges().charge : 0
    const isRush = deliverySelectedValue() === 'Rush'
    const rushCharge = (deliveryCharges() && deliveryCharges().rush) ? deliveryCharges().rush : 0
    const userBalanceFromAccount = userBalance.loading ? 0 : userBalance()
    // console.log('userBalanceFromAccount', userBalanceFromAccount, userBalance, userBalance())
    return calculateBasketTotals(basket, deliveryChargeFromBasket, isRush, rushCharge, userBalanceFromAccount, staticData())
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
  const handlePurchaseClick = async () => {
    console.log('handlePurchaseClick', confirmCheckout())
    updatePrices()
    if (!confirmCheckout()) {
      setConfirmCheckout(true)
    } else {
      setOrderCreationInProgress(true)
      console.log('basket', basket)
      console.log('basketData', basketData())
      console.log('deliveryCharges', deliveryCharges())
      console.log('deliverySelectedValue', deliverySelectedValue(), deliverySelectedValue() !== 'None')
      const order = {
        characterID: characterID(),
        characterName: characterName(),
        items: basket.map(b => b), // Still contains proxy
        totals: {
          totalMaterialCost: basketData().totalMaterialCost,
          brokersFee: basketData().brokersFee,
          deliveryFee: basketData().deliveryCharge,
          agentFee: basketData().agentFee,
          p4gFee: basketData().p4gFee,
          total: basketData().total,
          totalVolume: basketData().totalVolume
        }
      }
      if (deliverySelectedValue() !== 'None') {
        order.delivery = {
          station: deliveryCharges().station,
          serviceType: deliveryCharges().serviceType,
          jumps: deliveryCharges().jumps,
          isRush: deliverySelectedValue() === 'Rush'
        }
      }
      console.log('Handle Order Creation')
      console.log('order', order)
      console.log('credentials', user, await ensureAccessTokenIsValid())
      const res = await post('/api/orders', order, await ensureAccessTokenIsValid())
      console.log('order creation res', res)
      if (res.error) {
        openInfoModal(
          'Error',
          <>
            <p>Something went wrong creating your order:</p>
            <p>{res.error}</p>
          </>
        )
        setConfirmCheckout(false)
        setOrderCreationInProgress(false)
      } else {
        // Clear basket
        clearBasket()
        // Ensure the cached balance is updated
        // triggerDataUpdate()
        // Redirect to /my-orders
        navigate('/my-orders')
      }
    }
  }
  return (
    <div class='mb-3'>
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
          If the order becomes too expensive, it will be returned back to you and you can choose to accept the updated prices.
        </p>
        <div class='d-flex flex-column'>
          <For each={basket}>
            {(basketItem) => (
              <>
                <div class='d-flex flex-columns align-items-center mb-2 basket-item'>
                  <div class='col-md-5'>
                    <div class='d-flex align-items-center'>
                      <EveTypeIcon type={staticData().types[basketItem.typeID]} />
                      <a
                        class='ps-1 link-light link-underline link-underline-opacity-0 link-underline-opacity-100-hover' href=''
                        onClick={(e) => e.preventDefault() & setSelectedType(basketItem.typeID) & setSelectedTab(TABS.Details)}
                      >{staticData().types[basketItem.typeID].name}
                      </a>
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
              <p>Your balance is too low - {basketData().balance.toLocaleString()} ISK</p>
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
    </div>
  )
}
export default Basket
