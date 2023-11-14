import { Alert } from 'solid-bootstrap'
import { For, createMemo } from 'solid-js'
import { useStaticData } from '../../stores/StaticDataProvider'
import EveTypeIcon from '../common/EveTypeIcon'
import './TypeBrowserFavourites.css'

const TypeBrowserFavourites = (props) => {
  const [staticData] = useStaticData()
  const items = createMemo(() => {
    console.log('types', staticData().types)
    return props.favourites().map(typeID => staticData().types[typeID])
  })
  return (
    <>
      <ul class='favourites'>
        <For each={items()} fallback={<Alert variant='dark'>No favourites set</Alert>}>
          {(item) => (
            <li class='text-start' data-type-id={item.type_id} data-parent-group-id={item.parent_group_id}>
              <span class='content w-100 h-100 d-block d-flex align-items-center' onClick={() => props.setSelectedType(item.type_id)}>
                <span class='px-1'>
                  <EveTypeIcon type={item} />
                </span>
                <span>{item.name}</span>
                <i class='ms-auto bi bi-x pe-3' onClick={() => props.toggleFavourites(item.type_id)} />
              </span>
            </li>
          )}
        </For>
      </ul>
    </>
  )
}
export default TypeBrowserFavourites
