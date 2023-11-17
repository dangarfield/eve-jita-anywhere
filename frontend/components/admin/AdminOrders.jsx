import { Alert, Button, Dropdown } from 'solid-bootstrap'
import { getAdmin, patchAdmin, postAdmin } from '../../services/utils'
import { For, Match, Show, Switch, createEffect, createMemo, createResource, createSignal } from 'solid-js'
import Loading from '../common/Loading'
import OrderFilter from '../common/OrderFilter'
import OrderCard from '../common/OrderCard'
import DisputeContent from '../common/DisputeContent'

const fetchMyOrders = async (id) => {
  const ordersRes = await getAdmin('/api/orders')
  console.log('fetchMyOrders', ordersRes)
  return ordersRes
}

const [orders, { refetch }] = createResource(fetchMyOrders)
const [filters, setFilters] = createSignal({})
const [showDisputes, setShowDisputes] = createSignal(null)
const [savingDisputeComments, setSavingDisputeComments] = createSignal(false)
const [savingOrderStatus, setSavingOrderStatus] = createSignal(false)

const filteredOrders = createMemo(() => {
  console.log('UPDATE filteredOrders', orders(), filters())
  setSavingDisputeComments(false)
  setSavingOrderStatus(false)
  if (orders() === undefined) return []
  // if (Object.keys(filters()).length === 0) return []
  const appliedFilters = filters()
  return orders()?.filter((order) => {
    const statusFilter = appliedFilters.status.find((status) => status.name === order.status && status.active)
    const deliveryFilter = appliedFilters.delivery.find((delivery) => (order.delivery === undefined ? 'None' : (order.delivery.isRush ? 'Rush' : 'Normal')) === delivery.name && delivery.active)
    return statusFilter && deliveryFilter
  })
})
createEffect(() => {
  console.log('MyOrdersPage createEffect', orders())
  const uniqueStatusList = [...new Set(orders()?.map(item => item.status))].sort().map(key => ({ name: key, active: true }))
  uniqueStatusList.filter(option => ['CANCELLED', 'COMPLETE'].includes(option.name)).forEach(option => { option.active = false })
  // console.log('uniqueStatusList', uniqueStatusList)
  const uniqueDeliveryList = [...new Set(orders()?.map(item => item.delivery === undefined ? 'None' : (item.delivery.isRush ? 'Rush' : 'Normal')))].sort().map(key => ({ name: key, active: true }))
  // console.log('uniqueDeliveryList', uniqueDeliveryList)
  setFilters({ status: uniqueStatusList, delivery: uniqueDeliveryList })
})
const handleDisputeOrderClick = async (order) => {
  console.log('handleDisputeOrderClick', order)
  showDisputes() === order.orderID ? setShowDisputes(null) : setShowDisputes(order.orderID)
}
const handleAddDisputeCallback = async (order, disputeComment) => {
  console.log('handleAddDisputeCallback', order, disputeComment)
  const comment = { user: 'admin', comment: disputeComment }
  setSavingDisputeComments(true)
  await postAdmin(`/api/orders/${order.orderID}/dispute-comments-admin`, comment)
  refetch()
}
const setOrderStatus = async (order, status) => {
  console.log('setOrderStatus', order, status)
  setSavingOrderStatus(true)
  await patchAdmin(`/api/orders/${order.orderID}/admin`, { status })
  refetch()
}
const AdminOrders = () => {
  return (
    <>
      <Show when={orders() && orders().length === 0}>
        <div class='col-6'><Alert variant='border border-light text-center mt-1'>No orders</Alert></div>
      </Show>
      <Show when={filteredOrders()} fallback={<div class='row'><Loading /></div>}>
        <div class='row'>
          <div class='col-2'>
            <Show when={orders()}>
              <OrderFilter filters={filters} setFilters={setFilters} />
            </Show>
          </div>
          <div class='col-10'>
            <div class='row'>
              <For each={filteredOrders()}>
                {(order) =>
                  <div class='col-3 mb-4'>
                    <OrderCard
                      order={order}
                      showUsers
                      actions={
                        <>
                          <hr />
                          <div class='px-3'>
                            <div class='d-flex align-items-center gap-3'>
                              <Button variant='outline-danger w-100 position-relative' onClick={() => handleDisputeOrderClick(order)}>
                                {showDisputes() === order.orderID ? 'Hide ' : 'Show '}
                                Disputes
                                <Show when={order.disputes && order.disputes.length > 0}>
                                  <span class='position-absolute top-75 start-100 translate-middle badge rounded-pill bg-danger'>{order.disputes.length}</span>
                                </Show>
                              </Button>
                              <Dropdown>
                                <Dropdown.Toggle variant='outline-primary' disabled={(savingOrderStatus())}>Set Status</Dropdown.Toggle>
                                <Dropdown.Menu variant='dark'>
                                  <Switch>
                                    <Match when={order.status === 'AVAILABLE'}>
                                      {/* <Dropdown.Item active disabled>AVAILABLE</Dropdown.Item> */}
                                      <Dropdown.Item onClick={() => setOrderStatus(order, 'CANCELLED')}>CANCELLED</Dropdown.Item>
                                    </Match>
                                    <Match when={order.status === 'IN_PROGRESS'}>
                                      <Dropdown.Item onClick={() => setOrderStatus(order, 'AVAILABLE')}>AVAILABLE</Dropdown.Item>
                                      {/* <Dropdown.Item active disabled>IN PROGRESS</Dropdown.Item> */}
                                      <Dropdown.Item onClick={() => setOrderStatus(order, 'DELIVERED')}>DELIVERED</Dropdown.Item>
                                      <Dropdown.Item onClick={() => setOrderStatus(order, 'CANCELLED')}>CANCELLED</Dropdown.Item>
                                    </Match>
                                    <Match when={order.status === 'PRICE_INCREASE'}>
                                      {/* <Dropdown.Item active disabled>PRICE INCREASE</Dropdown.Item> */}
                                      <Dropdown.Item onClick={() => setOrderStatus(order, 'CANCELLED')}>CANCELLED</Dropdown.Item>
                                    </Match>
                                    <Match when={order.status === 'DELIVERED'}>
                                      {/* <Dropdown.Item active disabled>DELIVERED</Dropdown.Item> */}
                                      <Dropdown.Item onClick={() => setOrderStatus(order, 'CANCELLED')}>CANCELLED</Dropdown.Item>
                                      <Dropdown.Item onClick={() => setOrderStatus(order, 'COMPLETE')}>COMPLETE</Dropdown.Item>
                                    </Match>
                                  </Switch>
                                </Dropdown.Menu>
                              </Dropdown>
                            </div>
                            <Show when={showDisputes() === order.orderID}>
                              <div class='mt-3'>
                                <DisputeContent disputes={order.disputes} savingDisputeComments={savingDisputeComments} handleAddDisputeCallback={disputeComment => handleAddDisputeCallback(order, disputeComment)} />
                              </div>
                            </Show>
                          </div>
                        </>

                      }
                    />
                  </div>}
              </For>
            </div>
          </div>
        </div>

      </Show>
    </>
  )
}
export default AdminOrders
