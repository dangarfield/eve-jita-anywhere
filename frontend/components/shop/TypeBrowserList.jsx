import { For, Show, createSignal } from 'solid-js'
import { useStaticData } from '../../stores/StaticDataProvider'

import './TypeBrowserList.css'
import EveTypeIcon from '../common/EveTypeIcon'
import { Alert, Button, FormControl, InputGroup } from 'solid-bootstrap'

const createItem = (item, setSelectedType) => {
  const handleClick = () => {
    // console.log('click item', item)
    setSelectedType(item.type_id)
  }

  return (
    <li class='text-start' data-type-id={item.type_id} data-parent-group-id={item.parent_group_id}>
      <span class='content w-100 h-100 d-block' onClick={handleClick}>
        <span class='px-1'>
          <EveTypeIcon type={item} />
        </span>
        <span>{item.name}</span>
      </span>
    </li>
  )
}

const createGroup = (item, setSelectedType) => {
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
      <span class='content w-100 h-100 d-block' onClick={toggleGroup}>
        <i class={`expanded-icon bi bi-caret-${expanded() ? 'down-fill' : 'right-fill'}`} />
        <span class='px-1'>
          <img class='width-32' src={`/generated-icons/${item.icon_id}.png`} />
        </span>
        <span>{item.name}</span>
      </span>
      <ul style={{ display: expanded() ? 'block' : 'none' }}>
        {drawnOnce() && item.child_groups?.map((child) => createGroup(child, setSelectedType))}
        {drawnOnce() && item.types?.map((child) => createItem(child, setSelectedType))}
      </ul>
    </li>
  )
}

const TypeBrowserList = (props) => {
  const [staticData] = useStaticData()
  const [searchResults, setSearchResults] = createSignal(null)
  // const [searchText, setSearchText] = createSignal('')

  const handleSearchInput = (event) => {
    const searchText = event.target.value.toLowerCase()

    const filteredTypes = Object.values(staticData().types).filter(t => t.name.toLowerCase().includes(searchText))
    // console.log('searchText', searchText, filteredTypes)

    if (searchText.length >= 3 && filteredTypes.length < 20) {
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
            {staticData().marketTypes.map((item) => createGroup(item, props.setSelectedType))}
          </ul>
}
      >
        {/* <p>Search results: {JSON.stringify(searchResults())}</p> */}
        <ul class='list-group list-group-root'>
          <For each={searchResults()} fallback={<Alert variant='dark'>No items found</Alert>}>
            {(item) => (
              createItem(item, props.setSelectedType)
            // <p>{item.name}</p>
            )}
          </For>
        </ul>
      </Show>

    </>
  )
}

export default TypeBrowserList
