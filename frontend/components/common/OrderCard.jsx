import { For, Show } from 'solid-js'
import EveTypeIcon from './EveTypeIcon'
import { Card } from 'solid-bootstrap'
import { setContent, openInfoModal } from './InfoModal'

const handleOrderCardClick = (order) => {
  console.log('handleOrderCardClick', order)
  setContent({ title: `Order: ${order._id}`, content: <p>LOTS OF CONTENT</p> })
  openInfoModal()
}

const OrderCard = (props) => {
  return (
    <>
      <Card class='' onClick={() => handleOrderCardClick(props.order)}>
        <Card.Body class='px-0 order-card'>
          <div class='px-3'>
            <div class='d-flex align-items-center'>
              <span class='col-4'>Total</span>
              <span class='ms-auto'>{props.order.totals.total.toLocaleString()} ISK</span>
            </div>
            <div class='d-flex align-items-center'>
              <span class='col-4'>Status</span>
              <span class='ms-auto'>{props.order.status}</span>
            </div>
            <div class='d-flex align-items-center'>
              <span class='col-4'>Created</span>
              <span class='ms-auto'>{new Date(props.order.creationDate).toLocaleString()}</span>
            </div>
          </div>
          <hr />
          <div class='px-3'>
            <div class='d-flex align-items-center'>
              <span class='col-4'>Materials Total</span>
              <span class='ms-auto'>{props.order.totals.totalMaterialCost.toLocaleString()} ISK</span>
            </div>
            <div class='d-flex align-items-center'>
              <span class='col-4'>Broker Fee</span>
              <span class='ms-auto'>{props.order.totals.brokersFee.toLocaleString()} ISK</span>
            </div>
            <div class='d-flex align-items-center'>
              <span class='col-4'>Delivery Fee</span>
              <span class='ms-auto'>{props.order.totals.deliveryFee.toLocaleString()} ISK</span>
            </div>
            <div class='d-flex align-items-center'>
              <span class='col-4'>Agent Fee</span>
              <span class='ms-auto'>{props.order.totals.agentFee.toLocaleString()} ISK</span>
            </div>
            <div class='d-flex align-items-center'>
              <span class='col-4'>Plex For Good Fee</span>
              <span class='ms-auto'>{props.order.totals.p4gFee.toLocaleString()} ISK</span>
            </div>
          </div>
          <hr />
          <div class='px-3'>
            <For each={props.order.items}>
              {(item) =>
                <div class='d-flex flex-columns align-items-center mb-2 basket-item'>
                  <div class='col-md-5'>
                    <div class='d-flex align-items-center'>
                      <EveTypeIcon type={{ type_id: item.typeID, name: item.name }} />
                      <span class='ps-1'>{item.name}</span>
                    </div>
                  </div>
                  <div class='col-md-3 px-1 text-center'>
                    <span class=''>{item.quantity}</span>
                  </div>
                  <div class='col-md-4 text-end basket-item-price-line'>
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
                <span class='ms-auto text-end'>{props.order.delivery.station.station}</span>
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
        </Card.Body>
      </Card>

    </>

  )
}
export default OrderCard
