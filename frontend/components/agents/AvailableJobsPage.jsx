import { Alert, Form } from 'solid-bootstrap'
import { For, Match, Show, Switch, createEffect, createMemo, createResource, createSignal } from 'solid-js'
import { get, patch } from '../../services/utils'
import { useUser } from '../../stores/UserProvider'
import Loading from '../common/Loading'
import OrderCard from '../common/OrderCard'
import ConfirmButton from '../common/ConfirmButton'
import { openInfoModal, setContent } from '../common/InfoModal'

const AvailableJobsPage = () => {
  const [user, { ensureAccessTokenIsValid }] = useUser()

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

    // return orders()// ?.filter(o => o.delivery)
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

  const handleStatusChange = (statusName) => {
    setFilters((prevFilters) => {
      const updatedStatusFilters = prevFilters.status.map((status) => {
        if (status.name === statusName) {
          return { ...status, active: !status.active }
        }
        return status
      })
      return { ...prevFilters, status: updatedStatusFilters }
    })
  }

  const handleDeliveryChange = (deliveryName) => {
    setFilters((prevFilters) => {
      const updatedDeliveryFilters = prevFilters.delivery.map((delivery) => {
        if (delivery.name === deliveryName) {
          return { ...delivery, active: !delivery.active }
        }
        return delivery
      })
      return { ...prevFilters, delivery: updatedDeliveryFilters }
    })
  }

  const handleSelectOrderClick = async (order) => {
    console.log('handleCancelOrderClick', order)
    const ordersRes = await patch(`/api/orders/${order.orderID}`, { status: 'CANCELLED' }, await ensureAccessTokenIsValid())
    console.log('handleCancelOrderClick res', ordersRes)
    refetch()
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
  return (

    <Show when={filteredOrders()} fallback={<div class='row'><Loading /></div>}>

      <div class='row'>
        <div class='col-2'>
          <h3>Filter Status</h3>
          <For each={filters().status}>
            {(status) =>
              <Form.Check
                type='checkbox'
                id={`status-filter-${status.name}`}
                label={`${status.name}`}
                key='status-filter'
                checked={status.active}
                onChange={() => handleStatusChange(status.name)}
              />}
          </For>

          <h3 class='mt-3'>Filter Delivery</h3>
          <For each={filters().delivery}>
            {(delivery) =>
              <Form.Check
                type='checkbox'
                id={`delivery-filter-${delivery.name}`}
                label={`${delivery.name}`}
                key='delivery-filter'
                checked={delivery.active}
                onChange={() => handleDeliveryChange(delivery.name)}
                class='text-uppercase'
              />}
          </For>

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
                              <div class='d-flex align-items-center'>
                                <span class='ms-auto'>
                                  <ConfirmButton variant='outline-primary' onClick={() => handleSelectOrderClick(order)}>Select Order</ConfirmButton>
                                </span>
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
