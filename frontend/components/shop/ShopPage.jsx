import { Show, createSignal } from 'solid-js'

import TypeBrowserSection from './TypeBrowserSection'
import TypeDetailsSection from './TypeDetailsSection'
import Basket from './Basket'
import { useStaticData } from '../../stores/StaticDataProvider'
import Loading from '../common/Loading'
const ShopPage = () => {
  const [selectedType, setSelectedType] = createSignal(27912) // Temporarily set it for debugging to 27912, otherwise null
  const [staticData] = useStaticData()
  return (
    <Show when={staticData()} fallback={<Loading />}>
      <div>
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
  )
}
export default ShopPage
