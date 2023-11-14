import { Alert, Form } from 'solid-bootstrap'
import { For, Match, Show, Switch, createEffect, createMemo, createResource, createSignal } from 'solid-js'
import { get, patch } from '../../services/utils'
import { useUser } from '../../stores/UserProvider'
import Loading from '../common/Loading'
import OrderCard from '../common/OrderCard'
import ConfirmButton from '../common/ConfirmButton'
import { openInfoModal, setContent } from '../common/InfoModal'
import OrderFilter from '../common/OrderFilter'
import { useStaticData } from '../../stores/StaticDataProvider'

const MyOrdersPage = () => {
  const [user, { ensureAccessTokenIsValid }] = useUser()
  const [staticData] = useStaticData()

  const fetchMyOrders = async (id) => {
    const ordersRes = await get('/api/orders/@me', await ensureAccessTokenIsValid())
    console.log('fetchMyOrders', ordersRes)
    return ordersRes
  }

  const [orders, { refetch }] = createResource(fetchMyOrders)
  const [filters, setFilters] = createSignal({})

  const filteredOrders = createMemo(() => {
    console.log('UPDATE filteredOrders')
    const appliedFilters = filters()
    return orders()?.filter((order) => {
    // Example filter logic, adjust as needed
      const statusFilter = appliedFilters.status.find((status) => status.name === order.status && status.active)
      const deliveryFilter = appliedFilters.delivery.find((delivery) => (order.delivery === undefined ? 'None' : (order.delivery.isRush ? 'Rush' : 'Normal')) === delivery.name && delivery.active)

      return statusFilter && deliveryFilter
    })
  })
  createEffect(() => {
    console.log('MyOrdersPage createEffect', orders)

    const uniqueStatusList = [...new Set(orders()?.map(item => item.status))].sort().map(key => ({ name: key, active: true }))
    const cancelledOption = uniqueStatusList.find(f => f.name === 'CANCELLED')
    if (cancelledOption) cancelledOption.active = false
    console.log('uniqueStatusList', uniqueStatusList)

    const uniqueDeliveryList = [...new Set(orders()?.map(item => item.delivery === undefined ? 'None' : (item.delivery.isRush ? 'Rush' : 'Normal')))].sort().map(key => ({ name: key, active: true }))
    console.log('uniqueDeliveryList', uniqueDeliveryList)
    setFilters({ status: uniqueStatusList, delivery: uniqueDeliveryList })
  })

  const handleCancelOrderClick = async (order) => {
    console.log('handleCancelOrderClick', order)
    const ordersRes = await patch(`/api/orders/${order.orderID}`, { status: 'CANCELLED' }, await ensureAccessTokenIsValid())
    console.log('handleCancelOrderClick res', ordersRes)
    if (ordersRes.error) {
      setContent(
        <>
          <p>Something went wrong amending the order:</p>
          <p>{ordersRes.error}</p>
        </>)
      openInfoModal()
    } else {
      refetch()
    }
  }

  const handleUpdatePricesOrderClick = async (order) => {
    console.log('handleUpdatePricesOrderClick', order)
    // const ordersRes = await patch(`/api/orders/${order.orderID}`, { status: 'CANCELLED' }, await ensureAccessTokenIsValid())
    // console.log('handleCancelOrderClick res', ordersRes)
    // if (ordersRes.error) {
    //   setContent(
    //     <>
    //       <p>Something went wrong amending the order:</p>
    //       <p>{ordersRes.error}</p>
    //     </>)
    //   openInfoModal()
    // } else {
    //   refetch()
    // }
  }
  return (

    <Show when={filteredOrders() && staticData()} fallback={<div class='row'><Loading /></div>}>

      <div class='row'>
        <div class='col-2'>
          <Show when={orders()}>
            <OrderFilter filters={filters} setFilters={setFilters} />
          </Show>
        </div>
        <div class='col-10'>
          <div class='row'>
            <For each={filteredOrders()} fallback={<div class='col-6'><Alert variant='border border-light text-center mt-1'>No orders</Alert></div>}>
              {(order) =>
                <div class={order.status === 'PRICE_INCREASE' ? 'col-6' : 'col-3'}>
                  <OrderCard
                    order={order}
                    actions={

                      <Switch>
                        <Match when={order.status === 'AVAILABLE'}>
                          <>
                            <hr />
                            <div class='px-3'>
                              <div class='d-flex align-items-center gap-3'>
                                <ConfirmButton variant='outline-danger w-100' onClick={() => handleCancelOrderClick(order)}>Cancel Order</ConfirmButton>
                              </div>
                            </div>
                          </>
                        </Match>
                        <Match when={order.status === 'PRICE_INCREASE'}>
                          <>
                            <hr />
                            <div class='px-3'>
                              <div class='d-flex align-items-center gap-3'>
                                <ConfirmButton variant='outline-danger w-100' onClick={() => handleCancelOrderClick(order)}>Cancel Order</ConfirmButton>
                                <ConfirmButton variant='outline-primary w-100' onClick={() => handleUpdatePricesOrderClick(order)}>Accept Updated Prices</ConfirmButton>
                              </div>
                            </div>
                          </>
                        </Match>
                      </Switch>

                      }
                  />
                </div>}
            </For>
          </div>
        </div>
      </div>
    </Show>
  )
}
export default MyOrdersPage
