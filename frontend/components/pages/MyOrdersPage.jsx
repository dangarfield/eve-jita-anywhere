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
import { getJitaSellOrders } from '../../services/esi'
import { calculateBasketTotals } from '../shop/Basket'
import { useNavigate } from '@solidjs/router'

const MyOrdersPage = () => {
  const navigate = useNavigate()
  const [user, { ensureAccessTokenIsValid, isLoggedIn }] = useUser()
  const [staticData] = useStaticData()

  if (!isLoggedIn()) {
    navigate('/')
    return
  }
  const fetchUserBalance = async () => {
    const balanceRes = await get('/api/balances/@me', await ensureAccessTokenIsValid())
    return balanceRes.balance
  }
  const [userBalance] = createResource(fetchUserBalance)

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
    // console.log('MyOrdersPage createEffect', orders())
    const uniqueStatusList = [...new Set(orders()?.map(item => item.status))].sort().map(key => ({ name: key, active: true }))
    uniqueStatusList.filter(option => ['CANCELLED', 'COMPLETE'].includes(option.name)).forEach(option => { option.active = false })
    // console.log('uniqueStatusList', uniqueStatusList)
    const uniqueDeliveryList = [...new Set(orders()?.map(item => item.delivery === undefined ? 'None' : (item.delivery.isRush ? 'Rush' : 'Normal')))].sort().map(key => ({ name: key, active: true }))
    // console.log('uniqueDeliveryList', uniqueDeliveryList)
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

    // It's generally more efficient / consistent to load this when loading the orders, but I like it loading faster and then
    // seeing the spinners. Could improve a lot
    const items = JSON.parse(JSON.stringify(order.items))
    items[0].price = 200

    const promises = items.map(async (basketItem) => {
      const orders = await getJitaSellOrders(basketItem.typeID)
      if (orders.sell.length > 0) {
        basketItem.price = orders.sell[0].price
      }
    })
    await Promise.all(promises)
    console.log('updated item prices', items)
    const deliveryChargeFromBasket = order.totals.deliveryFee // Note, this will also contain the rushFee, hence setting the rest to zero
    const isRush = false
    const rushCharge = 0
    const userBalanceFromAccount = userBalance.loading ? 0 : userBalance()
    const data = staticData()
    // console.log('userBalanceFromAccount', userBalanceFromAccount)
    const orderUp = calculateBasketTotals(items, deliveryChargeFromBasket, isRush, rushCharge, userBalanceFromAccount, data)
    // console.log('orderUp', orderUp)

    const remainingBalance = userBalanceFromAccount + order.totals.total - orderUp.total
    // console.log('remainingBalance', remainingBalance)
    if (remainingBalance < 0) {
      setContent(
        <>
          <p>Something went wrong amending the order:</p>
          <p>Your balance is too low</p>
        </>)
      openInfoModal()
      return
    }
    const updateObject = {
      status: 'AVAILABLE',
      items,
      totals: {
        totalMaterialCost: orderUp.totalMaterialCost,
        brokersFee: orderUp.brokersFee,
        deliveryFee: orderUp.deliveryCharge,
        agentFee: orderUp.agentFee,
        p4gFee: orderUp.p4gFee,
        total: orderUp.total,
        totalVolume: orderUp.totalVolume
      }
    }

    console.log('updateObject', updateObject)
    const ordersRes = await patch(`/api/orders/${order.orderID}`, updateObject, await ensureAccessTokenIsValid())
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
  const handleDisputeOrderClick = async (order) => {
    console.log('handleDisputeOrderClick', order)
    setContent({
      title: 'Dispute process',
      content: <div role='alert' class='alert alert-border border-info text-info text-center mt-1 fade show'>Dispute process coming soon</div>
    })
    openInfoModal()
  }
  const handleCompleteOrderClick = async (order) => {
    console.log('handleCompleteOrderClick', order)
    const ordersRes = await patch(`/api/orders/${order.orderID}`, { status: 'COMPLETE' }, await ensureAccessTokenIsValid())
    console.log('handleCompleteOrderClick res', ordersRes)
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
                    userBalance={userBalance}
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
                        <Match when={order.status === 'DELIVERED'}>
                          <>
                            <hr />
                            <div class='px-3'>
                              <div class='d-flex align-items-center gap-3'>
                                <ConfirmButton variant='outline-danger w-100' onClick={() => handleDisputeOrderClick(order)}>Dispute</ConfirmButton>
                                <ConfirmButton variant='outline-primary w-100' onClick={() => handleCompleteOrderClick(order)}>Complete Order</ConfirmButton>
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
