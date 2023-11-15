import { For, Show, createEffect, createMemo, createSignal } from 'solid-js'
import EveTypeIcon from './EveTypeIcon'
import { Alert, Card, Spinner } from 'solid-bootstrap'
import { useStaticData } from '../../stores/StaticDataProvider'
import { calculateBasketTotals } from '../shop/Basket'
import { useUser } from '../../stores/UserProvider'
import PriceDiff from './PriceDiff'
import './OrderCard.css'
import { getJitaSellOrders, openMarketWindow } from '../../services/esi'
import { copyTextToClipboard } from '../../services/utils'
import toast from 'solid-toast'

// DONE - Links for helping with delivery - dotlan travel link
// DONE - Links for helping with delivery - Open window in EVE

// DONE - Links for helping with buying - EVEpraisal link
// DONE - Links for helping with buying - Copy to in game multi-buy

// TODO - Better UI, styling, colour separation and focus

// TODO - Show disputes
// DONE - Show status history

const OrderCard = (props) => {
  const [staticData] = useStaticData()
  const [user, { ensureAccessTokenIsValid }] = useUser()
  const { userBalance } = props
  const [orderUp, setOrderUp] = createSignal(null)
  const [showHistory, setShowHistory] = createSignal(false)

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

  const copyMultiBuyToClipboard = (e) => {
    e.preventDefault()
    const text = props.order.items.map(item => `${item.name}\t${item.quantity}`).join('\n')
    copyTextToClipboard(text)
    toast.success('Multibuy Copied To Clipboard')
  }

  const copyStationToClipboard = (e) => {
    e.preventDefault()
    copyTextToClipboard(props.order.delivery.station.station)
    toast.success('Station Copied To Clipboard')
  }
  const toggleHistory = (e) => {
    e.preventDefault()
    console.log('toggleHistory')
    setShowHistory(!showHistory())
  }
  // let orderUp = null
  console.log('OrderCard', props.order)
  return (
    <>
      {/* <Card class='order-card-pointer' onClick={() => handleOrderCardClick(props.order)}> */}
      <Card>
        <Card.Body class='px-0 order-card'>
          <div class='px-3'>
            <div class='d-flex align-items-center'>
              <span class='me-auto'>Total</span>
              <Show when={isPriceIncreaseOrder()}>
                <Show when={orderUp()} fallback={<span class='pe-5'><Spinner animation='border' size='sm' /></span>}>
                  <PriceDiff old={props.order.totals.total} new={orderUp().total} class='' />
                </Show>
              </Show>
              <span class={isPriceIncreaseOrder() ? 'text-end col-4' : ''}>{props.order.totals.total.toLocaleString()} ISK</span>

            </div>
            <div class='d-flex align-items-center status-current'>
              <span class='me-auto'>
                Status
                <a href='/status-history' class='status-history-toggle show-on-hover ps-1' onClick={toggleHistory}>History</a>
              </span>
              <span class=''>{props.order.status.replace(/_/g, ' ')}</span>
            </div>
            <Show when={showHistory()}>
              <Alert variant='border border-secondary-subtle text-light text-center mt-1 mb-1'>
                <For each={props.order.statusHistory}>
                  {(history, i) =>
                    <div class='d-flex align-items-center'>
                      <span class=''>{new Date(history.date).toLocaleString()}</span>
                      <span class='ms-auto'>{history.status.replace(/_/g, ' ')}</span>
                    </div>}
                </For>
              </Alert>
            </Show>

            <div class='d-flex align-items-center'>
              <span class='me-auto'>Created</span>
              <span class=''>{new Date(props.order.creationDate).toLocaleString()}</span>
            </div>
            <div class='d-flex align-items-center'>
              <span class='me-auto'>Total for Agent</span>
              <Show when={isPriceIncreaseOrder()}>
                <Show when={orderUp()} fallback={<span class='pe-5'><Spinner animation='border' size='sm' /></span>}>
                  <PriceDiff old={props.order.totals.deliveryFee + props.order.totals.agentFee} new={orderUp().agentFee + orderUp().deliveryCharge} class='text-end' />
                </Show>
              </Show>
              <span class={isPriceIncreaseOrder() ? 'text-end col-4' : ''}>{(props.order.totals.deliveryFee + props.order.totals.agentFee).toLocaleString()} ISK</span>
            </div>
          </div>
          <hr />
          <div class='px-3'>
            <div class='d-flex align-items-center'>
              <span class='me-auto'>
                Materials Total
                <a href='/copy-multibuy-to-clipboard' class='show-on-hover ps-1' onClick={copyMultiBuyToClipboard}>Multibuy <i class='bi bi-clipboard-plus' /></a>
              </span>
              <Show when={isPriceIncreaseOrder()}>
                <Show when={orderUp()} fallback={<span class='pe-5'><Spinner animation='border' size='sm' /></span>}>
                  <PriceDiff old={props.order.totals.totalMaterialCost} new={orderUp().totalMaterialCost} />
                </Show>
              </Show>
              <span class={isPriceIncreaseOrder() ? 'text-end col-4' : ''}>{(props.order.totals.totalMaterialCost * 100000).toLocaleString()} ISK</span>
            </div>
            <div class='d-flex align-items-center'>
              <span class='me-auto'>Broker Fee</span>
              <Show when={isPriceIncreaseOrder()}>
                <Show when={orderUp()} fallback={<span class='pe-5'><Spinner animation='border' size='sm' /></span>}>
                  <PriceDiff old={props.order.totals.brokersFee} new={orderUp().brokersFee} />
                </Show>
              </Show>
              <span class={isPriceIncreaseOrder() ? 'text-end col-4' : ''}>{props.order.totals.brokersFee.toLocaleString()} ISK</span>
            </div>
            <div class='d-flex align-items-center'>
              <span class='me-auto'>Delivery Fee</span>
              <Show when={isPriceIncreaseOrder()}>
                <Show when={orderUp()} fallback={<span class='pe-5'><Spinner animation='border' size='sm' /></span>}>
                  <PriceDiff old={props.order.totals.deliveryFee} new={orderUp().deliveryCharge} />
                </Show>
              </Show>
              <span class={isPriceIncreaseOrder() ? 'text-end col-4' : ''}>{props.order.totals.deliveryFee.toLocaleString()} ISK</span>
            </div>
            <div class='d-flex align-items-center'>
              <span class='me-auto'>Agent Fee</span>
              <Show when={isPriceIncreaseOrder()}>
                <Show when={orderUp()} fallback={<span class='pe-5'><Spinner animation='border' size='sm' /></span>}>
                  <PriceDiff old={props.order.totals.agentFee} new={orderUp().agentFee} />
                </Show>
              </Show>
              <span class={isPriceIncreaseOrder() ? 'text-end col-4' : ''}>{props.order.totals.agentFee.toLocaleString()} ISK</span>
            </div>
            <div class='d-flex align-items-center'>
              <span class='me-auto'>Plex For Good Fee</span>
              <Show when={isPriceIncreaseOrder()}>
                <Show when={orderUp()} fallback={<span class='pe-5'><Spinner animation='border' size='sm' /></span>}>
                  <PriceDiff old={props.order.totals.p4gFee} new={orderUp().p4gFee} />
                </Show>
              </Show>
              <span class={isPriceIncreaseOrder() ? 'text-end col-4' : ''}>{props.order.totals.p4gFee.toLocaleString()} ISK</span>
            </div>
          </div>
          <hr />
          <div class='px-3'>
            <For each={props.order.items}>
              {(item, i) =>
                <div class='d-flex flex-columns align-items-center mb-2 basket-item'>
                  <div class='me-auto'>
                    <div class='d-flex align-items-center'>
                      <EveTypeIcon type={{ type_id: item.typeID, name: item.name }} />
                      <span class='ps-1 basket-item-price-line'>
                        {item.name}
                        <br style='height:100px;' />
                        <span class=''>x {item.quantity}</span>
                        <a href={`/open-market-detailsin-eve-client/${item.typeID}`} class='bi bi-graph-up-arrow ps-1 show-on-hover' onClick={(e) => { e.preventDefault(); openMarketWindow(item.typeID, ensureAccessTokenIsValid()) }} />
                        <a href={`https://www.adam4eve.eu/commodity.php?typeID=${item.typeID}&stationID=60003760`} class='show-on-hover' target='_blank' rel='noreferrer'>
                          <i class='bi bi-box-arrow-up-right ps-1' />
                        </a>
                      </span>
                    </div>
                  </div>
                  {/* <div class={`${isPriceIncreaseOrder() ? 'col-md-1' : 'col-md-2'} px-1 text-end`}>
                    <span class=''>x {item.quantity}</span>
                  </div> */}

                  <Show when={isPriceIncreaseOrder()}>
                    <div class='basket-item-price-line'>
                      <Show when={orderUp()} fallback={<><span class='pe-5'><Spinner animation='border' size='sm' /></span></>}>
                        <PriceDiff old={item.price * item.quantity} new={orderUp().items[i()].price * item.quantity} class='' />
                        {item.quantity > 1 ? <><br style='height:100px;' /><PriceDiff old={item.price} new={orderUp().items[i()].price} class='opacity-50' /></> : ''}
                      </Show>
                    </div>
                  </Show>
                  <div class={isPriceIncreaseOrder() ? 'text-end col-4 basket-item-price-line' : 'text-end basket-item-price-line '}>
                    {Math.ceil(item.price * item.quantity).toLocaleString()} ISK
                    {item.quantity > 1 ? <><br style='height:100px;' /><span class='opacity-50'>{item.price.toLocaleString()} ISK</span></> : ''}
                  </div>
                </div>}
            </For>
            <div class='text-end'>
              <a href='/copy-multibuy-to-clipboard' class='show-on-hover' onClick={copyMultiBuyToClipboard}>Multibuy <i class='bi bi-clipboard-plus' /></a>
            </div>

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
                <span class='col'>
                  Station
                  <a
                    href='/copy-multibuy-to-clipboard'
                    class='bi bi-clipboard-plus ps-1 show-on-hover'
                    onClick={copyStationToClipboard}
                  />
                </span>
                <span class='ms-auto text-end ps-2'>{props.order.delivery.station.station}</span>
              </div>
              <div class='d-flex align-items-center'>
                <span class='col'>
                  Service Type
                  <a
                    href={`https://www.pushx.net/quote.php?startSystemName=Jita&endSystemName=${props.order.delivery.station.systemName}&volume=${props.order.totals.totalVolume}&collateral=${props.order.totals.totalMaterialCost}`}
                    target='_blank'
                    class='show-on-hover'
                    rel='noreferrer'
                  >
                    <i class='bi bi-box-arrow-up-right ps-1' />
                  </a>
                </span>
                <span class='ms-auto'>{props.order.delivery.serviceType}</span>
              </div>
              <div class='d-flex align-items-center'>
                <span class='col'>
                  Jumps
                  <a href={`https://evemaps.dotlan.net/route/Jita:${props.order.delivery.station.systemName}`} class='show-on-hover' target='_blank' rel='noreferrer'>
                    <i class='bi bi-box-arrow-up-right ps-1' />
                  </a>
                </span>
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
