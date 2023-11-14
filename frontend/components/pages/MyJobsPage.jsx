import { Alert } from 'solid-bootstrap'
import { For, Match, Show, Switch, createEffect, createMemo, createResource, createSignal } from 'solid-js'
import { get, patch } from '../../services/utils'
import { useUser } from '../../stores/UserProvider'
import Loading from '../common/Loading'
import OrderCard from '../common/OrderCard'
import ConfirmButton from '../common/ConfirmButton'
import { openInfoModal, setContent } from '../common/InfoModal'
import OrderFilter from '../common/OrderFilter'
import { useNavigate } from '@solidjs/router'

const MyJobsPage = () => {
  const navigate = useNavigate()
  const [user, { ensureAccessTokenIsValid }] = useUser()

  const fetchAgentOrders = async (id) => {
    const ordersRes = await get('/api/agent-orders', await ensureAccessTokenIsValid())
    console.log('fetchAgentOrders', ordersRes)
    return ordersRes
  }

  const [orders, { refetch }] = createResource(fetchAgentOrders)
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
    uniqueStatusList.filter(option => ['CANCELLED', 'COMPLETE'].includes(option.name)).forEach(option => { option.active = false })
    console.log('uniqueStatusList', uniqueStatusList)

    const uniqueDeliveryList = [...new Set(orders()?.map(item => item.delivery === undefined ? 'None' : (item.delivery.isRush ? 'Rush' : 'Normal')))].sort().map(key => ({ name: key, active: true }))
    console.log('uniqueDeliveryList', uniqueDeliveryList)
    setFilters({ status: uniqueStatusList, delivery: uniqueDeliveryList })
  })

  const handleTooExpensiveOrderClick = async (order) => {
    console.log('handleTooExpensiveOrderClick', order)
    const ordersRes = await patch(`/api/orders/${order.orderID}`, { status: 'PRICE_INCREASE' }, await ensureAccessTokenIsValid())
    console.log('handleTooExpensiveOrderClick res', ordersRes)
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
  const handleDeliveredOrderClick = async (order) => {
    console.log('handleDeliveredOrderClick', order)
    const ordersRes = await patch(`/api/orders/${order.orderID}`, { status: 'DELIVERED' }, await ensureAccessTokenIsValid())
    console.log('handleDeliveredOrderClick res', ordersRes)
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
  const handleDisputeOrderClick = async (order) => {
    console.log('handleDisputeOrderClick', order)
    setContent({
      title: 'Dispute process',
      content: <div role='alert' class='alert alert-border border-info text-info text-center mt-1 fade show'>Dispute process coming soon</div>
    })
    openInfoModal()
  }
  return (

    <Show when={filteredOrders()} fallback={<div class='row'><Loading /></div>}>

      <div class='row'>
        <div class='col-2'>
          <Show when={orders() && orders().length > 0}>
            <OrderFilter filters={filters} setFilters={setFilters} />
          </Show>
        </div>
        <div class='col-10'>
          <div class='row'>
            <For each={filteredOrders()} fallback={<div class='col-6'><Alert variant='border border-light text-center mt-1'>No orders</Alert></div>}>
              {(order) =>
                <div class='col-3'>
                  <OrderCard
                    order={order}
                    actions={

                      <Switch>
                        <Match when={order.status === 'IN_PROGRESS'}>
                          <>
                            <hr />
                            <div class='px-3'>
                              <div class='d-flex align-items-center gap-3'>
                                <ConfirmButton variant='outline-danger w-100' onClick={() => handleTooExpensiveOrderClick(order)}>Too expensive</ConfirmButton>
                                <ConfirmButton variant='outline-primary w-100' onClick={() => handleDeliveredOrderClick(order)}>Delivered</ConfirmButton>
                              </div>
                            </div>
                          </>
                        </Match>
                        <Match when={order.status === 'DELIVERED'}>
                          <>
                            <hr />
                            <div class='px-3'>
                              <div class='d-flex align-items-center gap-3'>
                                <ConfirmButton variant='outline-danger w-100' onClick={() => handleDisputeOrderClick(order)}>Dispute</ConfirmButton>
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
export default MyJobsPage
