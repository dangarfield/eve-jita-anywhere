import { Alert, Button } from 'solid-bootstrap'
import { For, Match, Show, Switch, createEffect, createMemo, createResource, createSignal } from 'solid-js'
import { get, patch } from '../../services/utils'
import { useUser } from '../../stores/UserProvider'
import Loading from '../common/Loading'
import OrderCard from '../common/OrderCard'
import ConfirmButton from '../common/ConfirmButton'
import { openInfoModal, setContent } from '../common/InfoModal'
import OrderFilter from '../common/OrderFilter'
import { useNavigate } from '@solidjs/router'

const AvailableJobsPage = () => {
  const navigate = useNavigate()
  const [user, { ensureAccessTokenIsValid, isLoggedIn, beginLoginProcess }] = useUser()

  const fetchAvailableOrders = async (id) => {
    const ordersRes = await get('/api/available-orders', await ensureAccessTokenIsValid())
    console.log('fetchAvailableOrders', ordersRes)
    return ordersRes
  }

  const [orders, { refetch }] = createResource(fetchAvailableOrders)
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
    // console.log('uniqueStatusList', uniqueStatusList)

    const uniqueDeliveryList = [...new Set(orders()?.map(item => item.delivery === undefined ? 'None' : (item.delivery.isRush ? 'Rush' : 'Normal')))].sort().map(key => ({ name: key, active: true }))
    // console.log('uniqueDeliveryList', uniqueDeliveryList)
    setFilters({ status: uniqueStatusList, delivery: uniqueDeliveryList })
  })

  const handleClaimOrderClick = async (order) => {
    console.log('handleClaimOrderClick', order)
    const ordersRes = await patch(`/api/orders/${order.orderID}`, { status: 'IN_PROGRESS' }, await ensureAccessTokenIsValid())
    console.log('handleClaimOrderClick res', ordersRes)
    if (ordersRes.error) {
      setContent(
        <>
          <p>Something went wrong amending the order:</p>
          <p>{ordersRes.error}</p>
        </>)
      openInfoModal()
    } else {
      navigate('/my-jobs')
    }
  }
  return (

    <Show when={filteredOrders()} fallback={<div class='row'><Loading /></div>}>

      <div class='row'>
        <div class='col-2'>
          <Show when={orders().length > 0}>
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
                        <Match when={order.status === 'AVAILABLE'}>
                          <>
                            <hr />
                            <div class='px-3'>
                              <div class='d-flex align-items-center gap-3'>
                                <Show
                                  when={isLoggedIn()} fallback={
                                    <Button variant='outline-primary w-100' onClick={beginLoginProcess}>Login to claim order</Button>
                                  }
                                >
                                  <ConfirmButton variant='outline-primary w-100' onClick={() => handleClaimOrderClick(order)}>Claim Order</ConfirmButton>
                                </Show>
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
export default AvailableJobsPage
