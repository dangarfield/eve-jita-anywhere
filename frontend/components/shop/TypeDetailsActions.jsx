import { Show, createMemo, createSignal } from 'solid-js'
import Loading from '../common/Loading'
import { useBasket } from '../../stores/BasketProvider'

const TypeDetailsActions = (props) => {
  const [basket, { addToBasket, updateBasket }] = useBasket()

  const price = createMemo(() => {
    return props.orders() && props.orders().sell.length > 0 ? props.orders().sell[0].price : 0
  })
  const [quantity, setQuantity] = createSignal(1)

  const handleQuantityInputChange = (event) => {
    let newValue = parseInt(event.target.value)
    if (isNaN(newValue) || newValue <= 0) {
      newValue = 1
    }
    setQuantity(newValue)
    // console.log('handleQuantityInputChange', event.target.value, newValue, quantity())
    event.target.value = newValue
  }
  const handleAddToBasket = (event) => {
    event.preventDefault()
    const type = props.selectedType()
    const item = { typeID: type.type_id, name: type.name, quantity: quantity(), price: price() }
    // console.log('handleAddToBasket', item)
    if (price() > 0) {
      addToBasket(item)
    }

    // console.log(basket)
  }

  return (
    <Show when={props.orders()} fallback={<Loading />}>
      <div class='row mb-5'>
        <div class='col-md'>
          <form class='form add-item' onSubmit={handleAddToBasket}>
            <div class='row g-3 align-items-center mb-2'>
              <div class='col-sm-2'>
                <label for='price' class='col-form-label'>Price</label>
              </div>
              <div class='col-sm-4'>
                <input type='text' id='price' class='form-control' value={price() > 0 ? `${price().toLocaleString()} ISK` : 'No sell orders available'} disabled />
              </div>
              <div class='col-sm-6'>
                <span class='form-text'>
                  This is the current ESI price. The actual price may differ.
                </span>
              </div>
            </div>
            <div class='row g-3 align-items-center mb-2'>
              <div class='col-md-2'>
                <label for='quantity' class='col-form-label'>Quantity</label>
              </div>
              <div class='col-md-4'>
                <input type='number' id='quantity' class='form-control quantity' value={quantity()} onInput={handleQuantityInputChange} disabled={price() === 0} required />
              </div>
              <div class='col-md-6'>
                <span class='form-text'>
                  We only book if the price is less than a 10% increase
                </span>
              </div>
            </div>
            <div class='row g-3 align-items-center mb-2'>
              <div class='col-md-2 offset-md-4'>
                <button type='submit' class='btn btn-primary w-100' disabled={price() === 0}>Add to basket</button>
              </div>
              <div class='col-md-6'>
                <span class='form-text'>
                  Estimated price <span class='text-white'>{Math.ceil(price() * quantity()).toLocaleString()} ISK</span> plus taxes & fees<br />
                  No more than <span class='text-white'>{Math.ceil(price() * quantity() * 1.1).toLocaleString()} ISK</span> plus taxes & fees<br />
                </span>
              </div>
            </div>
          </form>
        </div>
      </div>
    </Show>
  )
}
export default TypeDetailsActions
