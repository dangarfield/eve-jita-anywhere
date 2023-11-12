import { For, Show, createEffect, createMemo, createResource, createSignal } from 'solid-js'
import { get } from '../../services/utils'
import MultiSelect from '@digichanges/solid-multiselect'
import { XMLParser } from 'fast-xml-parser'
import path from 'ngraph.path'
import createGraph from 'ngraph.graph'
import Loading from '../common/Loading'
import './MultiSelect.css'
import { getDeliveryCharges } from '../../services/delivery-estimate'
import { ButtonGroup, ToggleButton } from 'solid-bootstrap'

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
const Delivery = (props) => {
  const [systemStations] = createResource(getSystemStations)
  const [selectedStationName, setSelectedStationName] = createSignal(
    window.localStorage.getItem('jita-anywhere-station') || null
  )
  const [deliveryCharges, setDeliveryCharges] = createSignal()

  const [deliverySelectedValue, setDeliverySelectedValue] = createSignal('1')

  const radios = [
    { name: 'None', value: '1' },
    { name: 'Normal', value: '2' },
    { name: 'Rush', value: '3' }
  ]

  const xmlParser = new XMLParser()

  const selectedStation = createMemo(() => {
    if (systemStations()) {
      const stationName = selectedStationName()
      console.log('stationName', stationName, systemStations())
      const station = systemStations().stations.find(s => s.station === stationName)
      console.log('station', station)
      return station
    }
    return null
  })
  const selectedRoute = createMemo(() => {
    if (systemStations()) {
      console.log('calculate selectedRoute')
      const stationName = selectedStationName()
      //   console.log('stationName', stationName, systemStations())
      const station = systemStations().stations.find(s => s.station === stationName)
    }
  })
  const calculateRoute = () => {

  }
  const calculateDelivery = () => {

  }
  const handleSelectStation = async (selectedStations) => {
    console.log('handleSelectStation', selectedStations)
    if (selectedStations.length === 0) {
      console.log('handleSelectStation length 0', selectedStations)
      setSelectedStationName(null)
      window.localStorage.setItem('jita-anywhere-station', null)
      console.log('No station selected')
      setDeliveryCharges({ error: 'No station selected' })
      calculateRoute()
      calculateDelivery()
      return
    }
    console.log('selectedStations', selectedStations)
    const selectedStation = selectedStations[0]
    console.log('selectedStation', selectedStation)
    setSelectedStationName(selectedStation.station)
    window.localStorage.setItem('jita-anywhere-station', selectedStation.station)
    console.log('selectedStation', selectedStation, selectedStationName())

    calculateRoute()
    calculateDelivery()

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
        setDeliveryCharges({ error: 'No route available' })
        calculateDelivery()
        return
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
    // console.log('basket', props.basketData())

    console.log('totalVolume', props.totalVolume)
    console.log('totalMaterialCost', props.totalMaterialCost)
    const estimate = getDeliveryCharges(route.length + 1, security.highSec, security.lowSec, security.nullSec, props.totalVolume, props.totalMaterialCost)
    estimate.jumps = security
    console.log('estimate', estimate)
    setDeliveryCharges(estimate)
  }

  // TODO - handleSelectStation on intial load and change from basket
  return (
    <>
      <Show when={systemStations()} fallback={<Loading />}>
        {/* <p class='text-info'>{selectedStationName()}</p>
        <p class='text-info'>{JSON.stringify(selectedStation())}</p> */}
        <p class='text-info'>{JSON.stringify(deliveryCharges())}</p>
        <p class='mb-1'>Select delivery station:</p>
        <div class='mb-3'>

          <MultiSelect
            loadingMessage='loading'
            style={{ notFound: { color: 'black' } }}
            emptyRecordMsg='No stations found'
            selectedValues={selectedStation() ? [selectedStation()] : null}
            options={systemStations().stations}
            isObject
            displayValue='station'
            onSelect={handleSelectStation}
            onRemove={handleSelectStation}
            singleSelect
          />
        </div>
      </Show>

      <Show when={deliveryCharges()} fallback={<Loading />}>
        <Show
          when={deliveryCharges().error === undefined} fallback={(
            // <p>Note: {deliveryCharges().error}</p>

            <div class='d-flex'>
              <span class='col-4'>Delivery</span>
              <span class='ms-auto'>{deliveryCharges().error}</span>
            </div>
        )}
        >
          <div class='d-flex'>
            <span class='col-4'>Service Type</span>
            <span class='ms-auto'>{deliveryCharges().serviceType}</span>
          </div>
          <div class='d-flex'>
            <span class='col-4'>Jumps</span>
            <span class='ms-auto'>
              {deliveryCharges().jumps.highSec ? ` ${deliveryCharges().jumps.highSec} HighSec` : ''}
              {deliveryCharges().jumps.lowSec ? ` ${deliveryCharges().jumps.lowSec} LowSec` : ''}
              {deliveryCharges().jumps.nullSec ? ` ${deliveryCharges().jumps.nullSec} NullSec` : ''}
            </span>
          </div>
          <div class='d-flex justify-content-between'>
            <span class=''>Total Volume</span>
            <span class=''>{props.totalVolume.toLocaleString()} m<sup>3</sup></span>
          </div>
          <div class='d-flex'>
            <span class='col-4'>Delivery Fee</span>
            <span class='ms-auto'>{deliveryCharges().charge.toLocaleString()} ISK</span>
          </div>
          <div class='d-flex'>
            <span class='col-4'>Rush Fee</span>
            <span class='ms-auto'>{deliveryCharges().rush.toLocaleString()} ISK</span>
          </div>
          <div class='d-flex align-items-center mt-1'>
            <span class='col-4'>Delivery Type</span>
            <span class='ms-auto'>
              <ButtonGroup>
                <For each={radios}>
                  {(radio, idx) => (
                    <ToggleButton
                      id={`radio2-${idx()}`}
                      type='radio'
                      variant={idx() % 2 ? 'outline-secondary' : 'outline-secondary'}
                      name='radio2'
                      value={radio.value}
                      checked={deliverySelectedValue() === radio.value}
                      onChange={(e) => setDeliverySelectedValue(e.currentTarget.value)}
                    >
                      {radio.name}
                    </ToggleButton>
                  )}
                </For>
              </ButtonGroup>
            </span>
          </div>

        </Show>
      </Show>

    </>
  )
}
export default Delivery
