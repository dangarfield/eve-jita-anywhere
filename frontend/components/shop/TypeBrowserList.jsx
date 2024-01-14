import { For, Show, createSignal } from 'solid-js'
import { useStaticData } from '../../stores/StaticDataProvider'

import './TypeBrowserList.css'
import EveTypeIcon from '../common/EveTypeIcon'
import { Alert, FormControl, InputGroup } from 'solid-bootstrap'
import { TABS } from './ShopPage'

const createItem = (item, setSelectedType, setSelectedTab) => {
  const handleClick = () => {
    // setSelectedTab('sfdsf')
    console.log('click item', item)
    setSelectedType(item.type_id)
    setSelectedTab(TABS.Details)
  }

  return (
    <li class='text-start' data-type-id={item.type_id} data-parent-group-id={item.parent_group_id}>
      <span class='content w-100 h-100 d-block d-flex align-items-center' onClick={handleClick}>
        <span class='px-1'>
          <EveTypeIcon type={item} />
        </span>
        <span>{item.name}</span>
      </span>
    </li>
  )
}

const createGroup = (item, setSelectedType, setSelectedTab) => {
  const [expanded, setExpanded] = createSignal(false)
  const [drawnOnce, setDrawnOnce] = createSignal(false)

  const toggleGroup = () => {
    setExpanded(!expanded())
    if (expanded()) {
      setDrawnOnce(true)
    }
  }

  return (
    <li class='text-start' data-market-group-id={item.market_group_id} data-parent-group-id={item.parent_group_id}>
      <span class='content w-100 h-100 d-block d-flex align-items-center' onClick={toggleGroup}>
        <i class={`expanded-icon bi bi-caret-${expanded() ? 'down-fill' : 'right-fill'}`} />
        <span class='px-1'>
          <img class='width-32' src={`/generated-icons/${item.icon_id}.png`} />
        </span>
        <span>{item.name}</span>
      </span>
      <ul style={{ display: expanded() ? 'block' : 'none' }}>
        {drawnOnce() && item.child_groups?.map((child) => createGroup(child, setSelectedType, setSelectedTab))}
        {drawnOnce() && item.types?.sort((a, b) => a.name.localeCompare(b.name)).map((child) => createItem(child, setSelectedType, setSelectedTab))}
      </ul>
    </li>
  )
}
const TypeBrowserList = ({ setSelectedType, setSelectedTab }) => {
  const [staticData] = useStaticData()
  const [searchResults, setSearchResults] = createSignal(null)
  // const [searchText, setSearchText] = createSignal('')

  const handleSearchInput = (event) => {
    const searchText = event.target.value.toLowerCase()

    const filteredTypes = Object.values(staticData().types).filter(t => t.name.toLowerCase().includes(searchText))
    console.log('searchText', searchText, filteredTypes)

    if (searchText.length >= 3 && filteredTypes.length <= 100) {
      // console.log('setSearchResults', searchText, filteredTypes)
      setSearchResults(filteredTypes)// .sort((a, b) => a.typeID - b.typeID))
    } else {
      setSearchResults(null)
    }
  }

  // console.log('props', props, staticData)
  return (
    <>
      <InputGroup class='mb-3'>
        <FormControl
          placeholder='Search'
          aria-label='Search'
          aria-describedby='Search'
          onInput={handleSearchInput}
        />
        {/* <Button variant='outline-secondary'><i class='bi bi-arrows-collapse' /></Button> */}
        {/* <Button variant='outline-secondary'><i class='bi bi-x-lg' /></Button> */}
      </InputGroup>

      <Show
        when={searchResults()} fallback={
          <ul class='list-group list-group-root'>
            {staticData().marketTypes.map((item) => createGroup(item, setSelectedType, setSelectedTab))}
          </ul>
}
      >
        {/* <p>Search results: {JSON.stringify(searchResults())}</p> */}
        <ul class='list-group list-group-root'>
          <For each={searchResults()} fallback={<Alert variant='dark'>No items found</Alert>}>
            {(item) => (
              createItem(item, setSelectedType, setSelectedTab)
            // <p>{item.name}</p>
            )}
          </For>
        </ul>
      </Show>

    </>
  )
}

export default TypeBrowserList
