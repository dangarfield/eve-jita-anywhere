import { Show, createResource } from 'solid-js'
import { get } from '../../services/utils'
import MultiSelect from '@digichanges/solid-multiselect'
import { XMLParser } from 'fast-xml-parser'
import path from 'ngraph.path'
import createGraph from 'ngraph.graph'

import './MultiSelect.css'
import { getDeliveryCharges } from '../../services/delivery-estimate'
const getSystemStations = async () => {
  const systemsData = await get('/generated-data/system-stations.json')
  const stations = systemsData.systems.flatMap(({ systemName, systemID, stations, security }) =>
    stations.map(station => ({ systemName, systemID, station, security }))
  )
  stations.sort((a, b) => a.systemName.localeCompare(b.systemName) || a.station.localeCompare(b.station))
  console.log('stations', stations)

  const gH = createGraph()
  for (const con of systemsData.connectionsHighSec) {
    gH.addLink(con[0], con[1])
  }
  const pathFinderHighSec = path.aStar(gH)

  const g = createGraph()
  for (const con of systemsData.connections) {
    g.addLink(con[0], con[1])
  }
  const pathFinder = path.aStar(g)
  console.log('connections', systemsData.connections.length, systemsData.connectionsHighSec.length, g.getNodeCount(), gH.getNodeCount())
  return { stations, systems: systemsData.systems, pathFinder, pathFinderHighSec }
}
const Delivery = () => {
  const [systemStations] = createResource(getSystemStations)

  const xmlParser = new XMLParser()

  const handleSelectStation = async (selectedStations) => {
    console.log('handleSelectStation', selectedStations)
    if (selectedStations.length === 0) {
      console.log('No station selected')
      return
    }
    const selectedStation = selectedStations[0]

    let route = null
    try {
      route = systemStations().pathFinderHighSec.find(30000142, selectedStation.systemID).map(n => n.id).reverse()
      console.log('highsec route chosen')
    } catch (error) {
      console.log('route not available in high sec')
      try {
        route = systemStations().pathFinder.find(30000142, selectedStation.systemID).map(n => n.id).reverse()
        console.log('whole graph route chosen')
      } catch (error) {
        console.log('route not available in whole graph')
      }
    }

    // console.log('routeHigh', routeHigh)
    console.log('route', route)
    // TODO - error when no route found

    // TODO - This route is really not the shortest, implement properly myself another time
    // const route = await get(`https://esi.evetech.net/latest/route/30000142/${selectedStation.systemID}/?datasource=tranquility&flag=shortest`)

    // const systemsHigh = routeHigh.map(s => systemStations().systems.find(sS => sS.systemID === s))
    const systems = route.map(s => systemStations().systems.find(sS => sS.systemID === s))

    // console.log('systemsHigh', systemsHigh)
    console.log('systems', systems)
    const securityValues = route.map(s => systemStations().systems.find(sS => sS.systemID === s).security)
    const security = securityValues.reduce(
      (acc, security) => {
        if (security >= 0.45) {
          acc.highSec++
        } else if (security >= 0) {
          acc.lowSec++
        } else {
          acc.nullSec++
        }
        return acc
      },
      { highSec: 0, lowSec: 0, nullSec: 0 }
    )

    console.log('security', security)

    const estimate = getDeliveryCharges(route.length + 1, security.highSec, security.lowSec, security.nullSec, 1000000, 1e9)

    console.log('estimate', estimate)
  }
  return (
    <>
      <Show when={systemStations()}>
        <MultiSelect
          loadingMessage='loading'
          style={{ notFound: { color: 'black' } }}
          emptyRecordMsg='No stations found'
          selectedValues={null}
          options={systemStations().stations}
          isObject
          displayValue='station'
          onSelect={handleSelectStation}
          onRemove={handleSelectStation}
          singleSelect
        />
      </Show>

      {/* <p>Delivery: {systemStations()}</p> */}

    </>
  )
}
export default Delivery
