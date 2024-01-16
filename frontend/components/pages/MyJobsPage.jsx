import { Alert, Button } from 'solid-bootstrap'
import { For, Match, Show, Switch, createEffect, createMemo, createResource, createSignal } from 'solid-js'
import { get, patch, post } from '../../services/utils'
import { useUser } from '../../stores/UserProvider'
import Loading from '../common/Loading'
import OrderCard from '../common/OrderCard'
import ConfirmButton from '../common/ConfirmButton'
import { openInfoModal } from '../common/InfoModal'
import OrderFilter from '../common/OrderFilter'
import { useNavigate } from '@solidjs/router'
import DisputeContent from '../common/DisputeContent'

const MyJobsPage = () => {
  const navigate = useNavigate()
  const [user, { ensureAccessTokenIsValid, isLoggedIn }] = useUser()

  if (!isLoggedIn()) {
    navigate('/')
    return
  }
  const fetchAgentOrders = async () => {
    const ordersRes = await get('/api/agent-orders', await ensureAccessTokenIsValid())
    console.log('fetchAgentOrders', ordersRes)
    return ordersRes
  }

  const [orders, { refetch }] = createResource(fetchAgentOrders)
  const [filters, setFilters] = createSignal({})
  const [showDisputes, setShowDisputes] = createSignal(null)
  const [savingDisputeComments, setSavingDisputeComments] = createSignal(false)

  const filteredOrders = createMemo(() => {
    console.log('UPDATE filteredOrders')
    setSavingDisputeComments(false)
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
    // console.log('uniqueStatusList', uniqueStatusList)

    const uniqueDeliveryList = [...new Set(orders()?.map(item => item.delivery === undefined ? 'None' : (item.delivery.isRush ? 'Rush' : 'Normal')))].sort().map(key => ({ name: key, active: true }))
    // console.log('uniqueDeliveryList', uniqueDeliveryList)
    setFilters({ status: uniqueStatusList, delivery: uniqueDeliveryList })
  })

  const handleTooExpensiveOrderClick = async (order) => {
    console.log('handleTooExpensiveOrderClick', order)
    const ordersRes = await patch(`/api/orders/${order.orderID}`, { status: 'PRICE_INCREASE' }, await ensureAccessTokenIsValid())
    console.log('handleTooExpensiveOrderClick res', ordersRes)
    if (ordersRes.error) {
      openInfoModal(
        'Error',
        <>
          <p>Something went wrong amending the order:</p>
          <p>{ordersRes.error}</p>
        </>
      )
    } else {
      refetch()
    }
  }
  const handleDeliveredOrderClick = async (order) => {
    console.log('handleDeliveredOrderClick', order)
    const ordersRes = await patch(`/api/orders/${order.orderID}`, { status: 'DELIVERED' }, await ensureAccessTokenIsValid())
    console.log('handleDeliveredOrderClick res', ordersRes)
    if (ordersRes.error) {
      openInfoModal(
        'Error',
        <>
          <p>Something went wrong amending the order:</p>
          <p>{ordersRes.error}</p>
        </>
      )
    } else {
      refetch()
    }
  }
  const handleDisputeOrderClick = async (order) => {
    console.log('handleDisputeOrderClick', order)
    showDisputes() === order.orderID ? setShowDisputes(null) : setShowDisputes(order.orderID)
  }
  const handleAddDisputeCallback = async (order, disputeComment) => {
    console.log('handleAddDisputeCallback', order, disputeComment)
    const comment = { user: 'agent', comment: disputeComment }
    setSavingDisputeComments(true)
    await post(`/api/orders/${order.orderID}/dispute-comments`, comment, await ensureAccessTokenIsValid())
    refetch()
  }
  return (
    <>
      <Show when={orders() && orders().length === 0}>
        <div class='col-md-12 mt-3'><Alert variant='border border-light text-center mt-1'>No orders</Alert></div>
      </Show>
      <Show when={filteredOrders()}>

        <div class='row'>
          <div class='col-md-2 mt-3'>
            <Show when={orders() && orders().length > 0}>
              <OrderFilter filters={filters} setFilters={setFilters} />
            </Show>
          </div>
          <div class='col-md-10 mt-3'>
            <div class='row'>
              <For each={filteredOrders()}>
                {(order) =>
                  <div class='col-md-3 mb-4'>
                    <OrderCard
                      order={order}
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
                              <Show when={order.status === 'IN_PROGRESS'}>
                                <ConfirmButton variant='outline-danger w-100' onClick={() => handleTooExpensiveOrderClick(order)}>Too expensive</ConfirmButton>
                                <ConfirmButton variant='outline-primary w-100' onClick={() => handleDeliveredOrderClick(order)}>Delivered</ConfirmButton>
                              </Show>
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
export default MyJobsPage
