import { Show, createSignal } from 'solid-js'

import ShopDescription from './ShopDescription'
import TypeBrowserSection from './TypeBrowserSection'
import TypeDetailsSection from './TypeDetailsSection'
import Basket from './Basket'
import { useStaticData } from '../../stores/StaticDataProvider'
import Loading from '../common/Loading'
import Header from '../common/Header'

const ShopPage = () => {
  const [selectedType, setSelectedType] = createSignal(27912) // Temporarily set it for debugging to 27912, otherwise null
  const [staticData] = useStaticData()
  return (
    <div class='container-fluid'>
      <div class='row'>
        <div class='col'>
          <Header />
        </div>
      </div>
      <Show when={staticData()} fallback={<Loading />}>
        <div>
          <div class='row'>
            <div class='col'>
              <ShopDescription />
            </div>
          </div>
          <div class='row'>
            <div class='col-md-3'>
              <TypeBrowserSection setSelectedType={setSelectedType} />
            </div>
            <div class='col-md-6'>
              <TypeDetailsSection selectedType={selectedType} />
            </div>
            <div class='col-md-3'>
              <Basket setSelectedType={setSelectedType} />
            </div>
          </div>
        </div>
      </Show>
    </div>

  )
}
export default ShopPage
