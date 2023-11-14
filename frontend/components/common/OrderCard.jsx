import { For, Show, createEffect, createMemo, createSignal } from 'solid-js'
import EveTypeIcon from './EveTypeIcon'
import { Card, Spinner } from 'solid-bootstrap'
import { useStaticData } from '../../stores/StaticDataProvider'
import { calculateBasketTotals } from '../shop/Basket'
import { useUser } from '../../stores/UserProvider'
import PriceDiff from './PriceDiff'
import './OrderCard.css'
import { getJitaSellOrders } from '../../services/esi'
import { sleep } from '../../services/utils'

// TODO - Links for helping with delivery - dotlan travel link
// TODO - Links for helping with delivery - Open window in EVE

// TODO - Links for helping with buying - EVEpraisal link
// TODO - Links for helping with buying - Copy to in game multi-buy

// TODO - Better UI, styling, colour separation and focus

// TODO - Show disputes
// TODO - Show status history

const OrderCard = (props) => {
  const [staticData] = useStaticData()
  const [user] = useUser()
  const { userBalance } = props
  const [orderUp, setOrderUp] = createSignal(null)

  const isPriceIncreaseOrder = createMemo(() => {
    return props.order.status === 'PRICE_INCREASE'
  })
  createEffect(async () => {
    if (props.order.status === 'PRICE_INCREASE') {
      const items = JSON.parse(JSON.stringify(props.order.items))
      items[0].price = 200

      const promises = items.map(async (basketItem) => {
        const orders = await getJitaSellOrders(basketItem.typeID)
        if (orders.sell.length > 0) {
          basketItem.price = orders.sell[0].price
        }
      })
      await Promise.all(promises)
      // await sleep(2000)

      const deliveryChargeFromBasket = props.order.totals.deliveryFee // Note, this will also contain the rushFee, hence setting the rest to zero
      const isRush = false
      const rushCharge = 0
      const userBalanceFromAccount = userBalance.loading ? 0 : userBalance()
      const data = staticData()
      // console.log('userBalanceFromAccount', userBalanceFromAccount)
      const orderUpa = calculateBasketTotals(items, deliveryChargeFromBasket, isRush, rushCharge, userBalanceFromAccount, data)
      orderUpa.items = items
      console.log('orderUpa', orderUpa)
      setOrderUp(orderUpa)
    }
  })
  // let orderUp = null
  return (
    <>
      {/* <Card class='order-card-pointer' onClick={() => handleOrderCardClick(props.order)}> */}
      <Card>
        <Card.Body class='px-0 order-card'>
          <div class='px-3'>
            <div class='d-flex align-items-center'>
              <span class='col-4'>Total</span>
              <Show when={isPriceIncreaseOrder()}>
                <Show when={orderUp()} fallback={<span class='col-4 text-end pe-5'><Spinner animation='border' size='sm' /></span>}>
                  <PriceDiff old={props.order.totals.total} new={orderUp().total} class='col-4 text-end' />
                </Show>
              </Show>
              <span class='ms-auto'>{props.order.totals.total.toLocaleString()} ISK</span>

            </div>
            <div class='d-flex align-items-center'>
              <span class='col-4'>Status</span>
              <span class='ms-auto'>{props.order.status.replace('_', ' ')}</span>
            </div>
            <div class='d-flex align-items-center'>
              <span class='col-4'>Created</span>
              <span class='ms-auto'>{new Date(props.order.creationDate).toLocaleString()}</span>
            </div>
            <div class='d-flex align-items-center'>
              <span class='col-4'>Total for Agent</span>
              <Show when={isPriceIncreaseOrder()}>
                <Show when={orderUp()} fallback={<span class='col-4 text-end pe-5'><Spinner animation='border' size='sm' /></span>}>
                  <PriceDiff old={props.order.totals.deliveryFee + props.order.totals.agentFee} new={orderUp().agentFee + orderUp().deliveryCharge} class='col-4 text-end' />
                </Show>
              </Show>
              <span class='ms-auto'>{(props.order.totals.deliveryFee + props.order.totals.agentFee).toLocaleString()} ISK</span>
            </div>
          </div>
          <hr />
          <div class='px-3'>
            <div class='d-flex align-items-center'>
              <span class='col-4'>Materials Total</span>
              <Show when={isPriceIncreaseOrder()}>
                <Show when={orderUp()} fallback={<span class='col-4 text-end pe-5'><Spinner animation='border' size='sm' /></span>}>
                  <PriceDiff old={props.order.totals.totalMaterialCost} new={orderUp().totalMaterialCost} class='col-4 text-end' />
                </Show>
              </Show>
              <span class='ms-auto'>{props.order.totals.totalMaterialCost.toLocaleString()} ISK</span>
            </div>
            <div class='d-flex align-items-center'>
              <span class='col-4'>Broker Fee</span>
              <Show when={isPriceIncreaseOrder()}>
                <Show when={orderUp()} fallback={<span class='col-4 text-end pe-5'><Spinner animation='border' size='sm' /></span>}>
                  <PriceDiff old={props.order.totals.brokersFee} new={orderUp().brokersFee} class='col-4 text-end' />
                </Show>
              </Show>
              <span class='ms-auto'>{props.order.totals.brokersFee.toLocaleString()} ISK</span>
            </div>
            <div class='d-flex align-items-center'>
              <span class='col-4'>Delivery Fee</span>
              <Show when={isPriceIncreaseOrder()}>
                <Show when={orderUp()} fallback={<span class='col-4 text-end pe-5'><Spinner animation='border' size='sm' /></span>}>
                  <PriceDiff old={props.order.totals.deliveryFee} new={orderUp().deliveryCharge} class='col-4 text-end' />
                </Show>
              </Show>
              <span class='ms-auto'>{props.order.totals.deliveryFee.toLocaleString()} ISK</span>
            </div>
            <div class='d-flex align-items-center'>
              <span class='col-4'>Agent Fee</span>
              <Show when={isPriceIncreaseOrder()}>
                <Show when={orderUp()} fallback={<span class='col-4 text-end pe-5'><Spinner animation='border' size='sm' /></span>}>
                  <PriceDiff old={props.order.totals.agentFee} new={orderUp().agentFee} class='col-4 text-end' />
                </Show>
              </Show>
              <span class='ms-auto'>{props.order.totals.agentFee.toLocaleString()} ISK</span>
            </div>
            <div class='d-flex align-items-center'>
              <span class='col-4'>Plex For Good Fee</span>
              <Show when={isPriceIncreaseOrder()}>
                <Show when={orderUp()} fallback={<span class='col-4 text-end pe-5'><Spinner animation='border' size='sm' /></span>}>
                  <PriceDiff old={props.order.totals.p4gFee} new={orderUp().p4gFee} class='col-4 text-end' />
                </Show>
              </Show>
              <span class='ms-auto'>{props.order.totals.p4gFee.toLocaleString()} ISK</span>
            </div>
          </div>
          <hr />
          <div class='px-3'>
            <For each={props.order.items}>
              {(item, i) =>
                <div class='d-flex flex-columns align-items-center mb-2 basket-item'>
                  <div class={`${isPriceIncreaseOrder() ? 'col-md-3' : 'col-md-5'}`}>
                    <div class='d-flex align-items-center'>
                      <EveTypeIcon type={{ type_id: item.typeID, name: item.name }} />
                      <span class='ps-1'>{item.name}</span>
                    </div>
                  </div>
                  <div class={`${isPriceIncreaseOrder() ? 'col-md-1' : 'col-md-2'} px-1 text-end`}>
                    <span class=''>x {item.quantity}</span>
                  </div>

                  <Show when={isPriceIncreaseOrder()}>
                    <div class='col-md-4 text-end basket-item-price-line'>
                      <Show when={orderUp()} fallback={<><span class='pe-5'><Spinner animation='border' size='sm' /></span></>}>
                        <PriceDiff old={item.price * item.quantity} new={orderUp().items[i()].price * item.quantity} class='' />
                        {item.quantity > 1 ? <><br style='height:100px;' /><PriceDiff old={item.price} new={orderUp().items[i()].price} class='opacity-50' /></> : ''}
                      </Show>
                    </div>
                  </Show>
                  <div class={`${isPriceIncreaseOrder() ? 'col-md-4' : 'col-md-5'} text-end basket-item-price-line`}>
                    {Math.ceil(item.price * item.quantity).toLocaleString()} ISK
                    {item.quantity > 1 ? <><br style='height:100px;' /><span class='opacity-50'>{item.price.toLocaleString()} ISK</span></> : ''}
                  </div>
                </div>}
            </For>
          </div>
          <hr />
          <div class='px-3'>
            <Show
              when={props.order.delivery} fallback={
                <div class='d-flex align-items-center'>
                  <span class='col-4'>Delivery</span>
                  <span class='ms-auto'>None</span>
                </div>
                }
            >

              <div class='d-flex align-items-center'>
                <span class='col'>Delivery</span>
                <span class='ms-auto'>{props.order.delivery.isRush ? 'Rush' : 'Normal'}</span>
              </div>
              <div class='d-flex align-items-center'>
                <span class='col'>Station</span>
                <span class='ms-auto text-end ps-2'>{props.order.delivery.station.station}</span>
              </div>
              <div class='d-flex align-items-center'>
                <span class='col'>Service Type</span>
                <span class='ms-auto'>{props.order.delivery.serviceType}</span>
              </div>
              <div class='d-flex align-items-center'>
                <span class='col'>Jumps</span>
                <span class='ms-auto'>
                  {props.order.delivery.jumps.highSec ? ` ${props.order.delivery.jumps.highSec} HighSec` : ''}
                  {props.order.delivery.jumps.lowSec ? ` ${props.order.delivery.jumps.lowSec} LowSec` : ''}
                  {props.order.delivery.jumps.nullSec ? ` ${props.order.delivery.jumps.nullSec} NullSec` : ''}
                </span>
              </div>

              <div class='d-flex align-items-center'>
                <span class='col'>Total Volume</span>
                <span class='ms-auto'>{props.order.totals.totalVolume.toLocaleString()} m<sup>3</sup></span>
              </div>
            </Show>
          </div>
          <Show when={props.actions}>
            {props.actions}
          </Show>
        </Card.Body>
      </Card>

    </>

  )
}
export default OrderCard
