import { Alert } from 'solid-bootstrap'
import Header from '../common/Header'
import { For, Show, createResource } from 'solid-js'
import { get } from '../../services/utils'
import { useUser } from '../../stores/UserProvider'
import Loading from '../common/Loading'
import OrderCard from '../common/OrderCard'

const MyOrdersPage = () => {
  const [user, { accessToken }] = useUser()

  const fetchMyOrders = async (id) => {
    const ordersRes = await get('/api/orders/@me', accessToken())
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
        <div class='col-4'>
          <Alert variant='border border-info text-info text-center mt-1'>Coming Soon: My Orders</Alert>
          <Show when={orders()} fallback={<Loading />}>
            <For each={orders()}>
              {(order, i) =>
                <>
                  <OrderCard order={order} />
                </>}
            </For>

          </Show>
        </div>
      </div>
    </div>
  )
}
export default MyOrdersPage
