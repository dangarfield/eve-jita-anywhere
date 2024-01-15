import { Show, createEffect, createSignal } from 'solid-js'

import TypeBrowserSection from './TypeBrowserSection'
import TypeDetailsSection from './TypeDetailsSection'
import Basket from './Basket'
import { useStaticData } from '../../stores/StaticDataProvider'
import Loading from '../common/Loading'

export const TABS = { Browse: 'Browse', Favourites: 'Favourites', AddBulk: 'Add Bulk', Details: 'Item Details', Basket: 'Basket' }

const ShopPage = () => {
  const [selectedType, setSelectedType] = createSignal(27912) // Temporarily set it for debugging to 27912, otherwise null
  const [staticData] = useStaticData()

  const [selectedTab, setSelectedTab] = createSignal(TABS.Browse)
  const [selectedSubTabBrowse, setSelectedSubTabBrowse] = createSignal(TABS.Browse)

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
    <Show when={staticData()} fallback={<Loading class='py-3' />}>
      <div>
        <div class='row'>
          <div class='col'>
            {/* <p>{`selectedTab() - ${selectedTab()}`}</p>
            <p>{`selectedSubTabBrowse() - ${selectedSubTabBrowse()}`}</p>
            <p>{`selectedType() - ${selectedType()}`}</p> */}
            <div class='d-md-none'>
              <ul class='nav nav-underline'>
                <li class='nav-item'>
                  <button
                    class={`nav-link${selectedTab() === TABS.Browse && selectedSubTabBrowse() === TABS.Browse ? ' active' : ''}`}
                    onClick={() => { setSelectedTab(TABS.Browse); setSelectedSubTabBrowse(TABS.Browse) }}
                  >{TABS.Browse}
                  </button>
                </li>
                <li class='nav-item'>
                  <button
                    class={`nav-link${selectedTab() === TABS.Browse && selectedSubTabBrowse() === TABS.Favourites ? ' active' : ''}`}
                    onClick={() => { setSelectedTab(TABS.Browse); setSelectedSubTabBrowse(TABS.Favourites) }}
                  >{TABS.Favourites}
                  </button>
                </li>
                <li class='nav-item'>
                  <button
                    class={`nav-link${selectedTab() === TABS.Browse && selectedSubTabBrowse() === TABS.AddBulk ? ' active' : ''}`}
                    onClick={() => { setSelectedTab(TABS.Browse); setSelectedSubTabBrowse(TABS.AddBulk) }}
                  >{TABS.AddBulk}
                  </button>
                </li>
                <li class='nav-item'>
                  <button
                    class={`nav-link${selectedTab() === TABS.Details ? ' active' : ''}`}
                    onClick={() => setSelectedTab(TABS.Details)}
                  >{TABS.Details}
                  </button>
                </li>
                <li class='nav-item'>
                  <button
                    class={`nav-link${selectedTab() === TABS.Basket ? ' active' : ''}`}
                    onClick={() => setSelectedTab(TABS.Basket)}
                  >{TABS.Basket}
                  </button>
                </li>
              </ul>

            </div>
          </div>
        </div>
        <div class='row'>
          <div class={`col-md-3 mt-3 ${![TABS.Browse, TABS.Favourites, TABS.AddBulk].includes(selectedTab()) ? 'd-none d-md-block' : ''}`}>
            <TypeBrowserSection
              setSelectedType={setSelectedType}
              favourites={favourites}
              toggleFavourites={toggleFavourites}
              selectedTab={selectedTab}
              setSelectedTab={setSelectedTab}
              selectedSubTabBrowse={selectedSubTabBrowse}
              setSelectedSubTabBrowse={setSelectedSubTabBrowse}
            />
          </div>
          <div class={`col-md-6 mt-3 ${selectedTab() !== TABS.Details ? 'd-none d-md-block' : ''}`}>
            <TypeDetailsSection selectedType={selectedType} favourites={favourites} toggleFavourites={toggleFavourites} setSelectedTab={setSelectedTab} />
          </div>
          <div class={`col-md-3 mt-3 ${selectedTab() !== TABS.Basket ? 'd-none d-md-block' : ''}`}>
            <Basket setSelectedType={setSelectedType} setSelectedTab={setSelectedTab} />
          </div>
        </div>
      </div>
    </Show>
  )
}
export default ShopPage
