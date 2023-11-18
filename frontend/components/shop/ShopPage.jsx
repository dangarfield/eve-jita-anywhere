import { Show, createEffect, createSignal } from 'solid-js'

import TypeBrowserSection from './TypeBrowserSection'
import TypeDetailsSection from './TypeDetailsSection'
import Basket from './Basket'
import { useStaticData } from '../../stores/StaticDataProvider'
import Loading from '../common/Loading'

const ShopPage = () => {
  const [selectedType, setSelectedType] = createSignal(27912) // Temporarily set it for debugging to 27912, otherwise null
  const [staticData] = useStaticData()

  const localFavourites = window.localStorage.getItem('jita-anywhere-favourites')
  const [favourites, setFavourites] = createSignal(localFavourites ? JSON.parse(localFavourites) : [])

  const toggleFavourites = (type) => {
    console.log('toggleFavourites', favourites(), type)
    if (favourites().includes(type)) {
      setFavourites(favourites().filter(f => f !== type))
    } else {
      setFavourites([...favourites(), type])
    }
  }
  createEffect(() => {
    if (favourites()) {
      console.log('favourites are set')
      window.localStorage.setItem('jita-anywhere-favourites', JSON.stringify(favourites()))
    }
  })
  return (
    <Show when={staticData()} fallback={<Loading />}>
      <div>
        <div class='row'>
          <div class='col-md-3 mt-3'>
            <TypeBrowserSection setSelectedType={setSelectedType} favourites={favourites} toggleFavourites={toggleFavourites} />
          </div>
          <div class='col-md-6 mt-3'>
            <TypeDetailsSection selectedType={selectedType} favourites={favourites} toggleFavourites={toggleFavourites} />
          </div>
          <div class='col-md-3 mt-3'>
            <Basket setSelectedType={setSelectedType} />
          </div>
        </div>
      </div>
    </Show>
  )
}
export default ShopPage
