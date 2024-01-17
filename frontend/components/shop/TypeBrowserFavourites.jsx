import { Alert } from 'solid-bootstrap'
import { For, createMemo } from 'solid-js'
import { useStaticData } from '../../stores/StaticDataProvider'
import EveTypeIcon from '../common/EveTypeIcon'
import './TypeBrowserFavourites.css'
import { TABS } from './ShopPage'

const TypeBrowserFavourites = ({ favourites, toggleFavourites, setSelectedType, setSelectedTab }) => {
  const [staticData] = useStaticData()
  const items = createMemo(() => {
    console.log('types', staticData().types)
    return favourites().map(typeID => staticData().types[typeID])
  })
  return (
    <>
      <ul class='favourites'>
        <For each={items()} fallback={<Alert variant='dark'>Browse items and click <i class='bi bi-star' /> to add to favourites</Alert>}>
          {(item) => (
            <li class='text-start' data-type-id={item.type_id} data-parent-group-id={item.parent_group_id}>
              <span class='content w-100 h-100 d-block d-flex align-items-center' onClick={() => { setSelectedType(item.type_id); setSelectedTab(TABS.Details) }}>
                <span class='px-1'>
                  <EveTypeIcon type={item} />
                </span>
                <span>{item.name}</span>
                <i class='ms-auto bi bi-x pe-3' onClick={() => { toggleFavourites(item.type_id) }} />
              </span>
            </li>
          )}
        </For>
      </ul>
    </>
  )
}
export default TypeBrowserFavourites
