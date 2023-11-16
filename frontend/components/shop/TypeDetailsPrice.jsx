import { For, Show } from 'solid-js'
import Loading from '../common/Loading'
import { Alert } from 'solid-bootstrap'

const TypeDetailsPrice = (props) => {
  // createEffect(() => {
  // console.log('sellOrders updated', props.orders()?.sell)
  // })
  return (
    <Show when={props.orders()} fallback={<Loading />}>
      <div class='row mb-5'>
        <div class='col-md'>
          <h5>Jita 4-4 Sell Orders</h5>
          <Show when={props.orders().sell.length > 0} fallback={<Alert variant='dark'>No sell orders available</Alert>}>
            <table class='table text-end'>
              <thead>
                <tr>
                  <th scope='col'>Quantity</th>
                  <th scope='col'>Price</th>
                </tr>
              </thead>
              <tbody>
                <For each={props.orders().sell.slice(0, 10)}>
                  {(o) => <tr><td>{o.quantity.toLocaleString()}</td><td>{o.price.toLocaleString()} ISK</td></tr>}
                </For>
              </tbody>
            </table>
            <Show when={props.orders().sell.length > 10}>
              <div class='text-end'><i>Showing 10 of {props.orders()?.sell.length}</i></div>
            </Show>
          </Show>
        </div>
        <div class='col-md'>
          <h5>Jita 4-4 Buy Orders</h5>
          <Show when={props.orders().buy.length > 0} fallback={<Alert variant='dark'>No buy orders available</Alert>}>
            <table class='table text-end'>
              <thead>
                <tr>
                  <th scope='col'>Quantity</th>
                  <th scope='col'>Price</th>
                </tr>
              </thead>
              <tbody>
                <For each={props.orders().buy.slice(0, 10)} fallback={<p>None</p>}>
                  {(o) => <tr><td>{o.quantity.toLocaleString()}</td><td>{o.price.toLocaleString()} ISK</td></tr>}
                </For>
              </tbody>
            </table>
            <Show when={props.orders().buy.length > 10}>
              <div class='text-end'><i>Showing 10 of {props.orders()?.buy.length}</i></div>
            </Show>
          </Show>
        </div>
      </div>
      {/* <p class='text-danger'>{JSON.stringify(props.orders())}</p> */}
    </Show>
  )
}
export default TypeDetailsPrice
