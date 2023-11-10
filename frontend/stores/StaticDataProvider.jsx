import { createContext, useContext, createResource } from 'solid-js'
import { createStore } from 'solid-js/store'
import { get } from '../services/utils'

const StaticDataContext = createContext()

const gatherTypeObjects = (node, typeObjects = {}) => {
  if (node.types) {
    for (const type of node.types) {
      typeObjects[type.type_id] = type
    }
  }
  if (node.child_groups) {
    for (const child of node.child_groups) {
      gatherTypeObjects(child, typeObjects)
    }
  }
  return typeObjects
}

const createStaticDataResource = () => {
  const [staticData, setStaticData] = createStore({ marketTypes: 'initial' })

  const resource = createResource(async () => {
    const jsonData = await get('/generated-data/market-types.json')
    const appConfig = await get('/api/app-config')
    const data = { marketTypes: jsonData, types: gatherTypeObjects({ child_groups: jsonData }), appConfig }
    // const data = jsonData
    setStaticData('staticData', data) // Update the store with the fetched data
    // await sleep(30000)
    // console.log('data', data)
    return data
  })

  return resource
}

export function StaticDataProvider (props) {
  const staticDataResource = createStaticDataResource()

  return (
    <StaticDataContext.Provider value={staticDataResource}>
      {props.children}
    </StaticDataContext.Provider>
  )
}

export function useStaticData () {
  return useContext(StaticDataContext)
}
