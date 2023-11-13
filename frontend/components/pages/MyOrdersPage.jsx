import { Alert } from 'solid-bootstrap'
import Header from '../common/Header'
import { For, Show, createResource } from 'solid-js'
import { get } from '../../services/utils'
import { useUser } from '../../stores/UserProvider'
import Loading from '../common/Loading'
import OrderCard from '../common/OrderCard'

const MyOrdersPage = () => {
  const [user, { ensureAccessTokenIsValid }] = useUser()

  const fetchMyOrders = async (id) => {
    const ordersRes = await get('/api/orders/@me', await ensureAccessTokenIsValid())
    console.log('fetchMyOrders', ordersRes)
    return ordersRes
  }

  const [orders] = createResource(fetchMyOrders)
  return (
    <div class='container-fluid'>
      <div class='row'>
        <div class='col'>
          <Header />
        </div>
      </div>
      <div class='row'>
        <div class='col-4' />
      </div>
      <div class='row'>
        <Show when={orders()} fallback={<Loading />}>
          <For each={orders()} fallback={<div class='col'><Alert variant='border border-light text-center mt-1'>You have no orders</Alert></div>}>
            {(order) =>
              <div class='col-3'>
                <OrderCard order={order} />
              </div>}
          </For>

        </Show>
      </div>
    </div>
  )
}
export default MyOrdersPage
