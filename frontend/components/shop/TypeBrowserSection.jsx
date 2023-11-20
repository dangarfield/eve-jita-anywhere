import TypeBrowserList from './TypeBrowserList'
import TypeBrowserFavourites from './TypeBrowserFavourites'
import TypeBrowserAddBulk from './TypeBrowserAddBulk'
import { TABS } from './ShopPage'

const TypeBrowserSection = ({ selectedTab, setSelectedTab, setSelectedType, favourites, toggleFavourites, selectedSubTabBrowse, setSelectedSubTabBrowse }) => {
  return (
    <>
      <ul class='nav nav-underline mb-3 d-none d-md-flex'>
        <li class='nav-item'>
          <button
            class={`nav-link${selectedSubTabBrowse() === TABS.Browse ? ' active' : ''}`}
            onClick={() => setSelectedSubTabBrowse(TABS.Browse)}
          >{TABS.Browse}
          </button>
        </li>
        <li class='nav-item'>
          <button
            class={`nav-link${selectedSubTabBrowse() === TABS.Favourites ? ' active' : ''}`}
            onClick={() => setSelectedSubTabBrowse(TABS.Favourites)}
          >{TABS.Favourites}
          </button>
        </li>
        <li class='nav-item'>
          <button
            class={`nav-link${selectedSubTabBrowse() === TABS.AddBulk ? ' active' : ''}`}
            onClick={() => setSelectedSubTabBrowse(TABS.AddBulk)}
          >{TABS.AddBulk}
          </button>
        </li>
      </ul>
      <div class='tab-content'>
        {/* <Show when={selectedTab() === TABS.Browse}> */}
        <div class={selectedSubTabBrowse() === TABS.Browse ? 'd-block' : 'd-none'}>
          <TypeBrowserList setSelectedType={setSelectedType} setSelectedTab={setSelectedTab} />
        </div>

        {/* </Show> */}
        {/* <Show when={selectedTab() === TABS.Favourites}> */}
        <div class={selectedSubTabBrowse() === TABS.Favourites ? 'd-block' : 'd-none'}>
          <TypeBrowserFavourites setSelectedType={setSelectedType} favourites={favourites} toggleFavourites={toggleFavourites} setSelectedTab={setSelectedTab} />
        </div>
        {/* </Show> */}
        {/* <Show when={selectedTab() === TABS.AddBulk}> */}
        <div class={selectedSubTabBrowse() === TABS.AddBulk ? 'd-block' : 'd-none'}>
          <TypeBrowserAddBulk setSelectedType={setSelectedType} setSelectedTab={setSelectedTab} />
        </div>
        {/* </Show> */}

      </div>
    </>
  )
}
export default TypeBrowserSection
