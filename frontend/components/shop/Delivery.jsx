import { For, Show, createMemo, createResource, createSignal } from 'solid-js'
import { get } from '../../services/utils'
import MultiSelect from '@digichanges/solid-multiselect'
// import { XMLParser } from 'fast-xml-parser'
import path from 'ngraph.path'
import createGraph from 'ngraph.graph'
import Loading from '../common/Loading'
import './MultiSelect.css'
import { getDeliveryCharges } from '../../services/delivery-estimate'
import { ButtonGroup, ToggleButton, OverlayTrigger, Tooltip } from 'solid-bootstrap'

const getSystemStations = async () => {
  const systemsData = await get('/generated-data/system-stations.json')
  const stations = systemsData.systems.flatMap(({ systemName, systemID, stations, security }) =>
    stations.map(station => ({ systemName, systemID, station, security }))
  )
  stations.sort((a, b) => a.systemName.localeCompare(b.systemName) || a.station.localeCompare(b.station))
  //   console.log('stations', stations)

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
  //   console.log('connections', systemsData.connections.length, systemsData.connectionsHighSec.length, g.getNodeCount(), gH.getNodeCount())
  return { stations, systems: systemsData.systems, pathFinder, pathFinderHighSec }
}
const Delivery = (props) => {
  const [systemStations] = createResource(getSystemStations)
  const [selectedStationName, setSelectedStationName] = createSignal(
    window.localStorage.getItem('jita-anywhere-station') || null
  )

  const radios = [
    { name: 'None', value: 'None' },
    { name: 'Normal', value: 'Normal' },
    { name: 'Rush', value: 'Rush' }
  ]

  //   const xmlParser = new XMLParser()

  const selectedRoute = createMemo(() => {
    if (systemStations()) {
    //   console.log('calculate selectedRoute')
      const stationName = selectedStationName()
      //   console.log('stationName', stationName, systemStations())
      const station = systemStations().stations.find(s => s.station === stationName)
      //   console.log('station', station)

      let route = null
      try {
        route = systemStations().pathFinderHighSec.find(30000142, station.systemID).map(n => n.id).reverse()
        // console.log('highsec route chosen')
      } catch (error) {
        // console.log('route not available in high sec')
        try {
          route = systemStations().pathFinder.find(30000142, station.systemID).map(n => n.id).reverse()
        //   console.log('whole graph route chosen')
        } catch (error) {
        //   console.log('route not available in whole graph')
          // TODO - Compare if deliveryCharges is the same then only envoke if it is
          //   props.setDeliveryCharges({ error: 'No route available' })
          const estimate = { error: 'No route available' }
          if (JSON.stringify(estimate) !== JSON.stringify(props.deliveryCharges())) {
            console.log('setDeliveryCharges', estimate)
            props.setDeliveryCharges(estimate)
          }
          return { station }
        }
      }

      // console.log('routeHigh', routeHigh)
      //   console.log('route', route)
      // TODO - error when no route found

      // TODO - This route is really not the shortest, implement properly myself another time
      // const route = await get(`https://esi.evetech.net/latest/route/30000142/${selectedStation.systemID}/?datasource=tranquility&flag=shortest`)

      // const systemsHigh = routeHigh.map(s => systemStations().systems.find(sS => sS.systemID === s))
      //   const systems = route.map(s => systemStations().systems.find(sS => sS.systemID === s))

      // console.log('systemsHigh', systemsHigh)
      //   console.log('systems', systems)
      const securityValues = route.map(s => systemStations().systems.find(sS => sS.systemID === s).security)
      const security = securityValues.reduce(
        (acc, security) => {
          acc.all++
          if (security >= 0.45) {
            acc.highSec++
          } else if (security >= 0) {
            acc.lowSec++
          } else {
            acc.nullSec++
          }
          return acc
        },
        { all: 0, highSec: 0, lowSec: 0, nullSec: 0 }
      )

      //   console.log('security', security)
      //   console.log('basket', props.basketData())
      //   console.log('selectedRoute security', security)

      //   console.log('totalVolume', props.totalVolume)
      //   console.log('totalMaterialCost', props.totalMaterialCost)
      const estimate = getDeliveryCharges(route.length + 1, security.highSec, security.lowSec, security.nullSec, props.totalVolume, props.totalMaterialCost)
      estimate.jumps = security
      estimate.station = station
      console.log('station', station)
      //   estimate.route = selectedRoute()
      //   console.log('estimate')
      //   console.log(JSON.stringify(estimate))
      //   console.log(JSON.stringify(props.deliveryCharges()))
      //   console.log('match', JSON.stringify(estimate) === JSON.stringify(props.deliveryCharges()))
      // TODO - Compare if deliveryCharges is the same then only envoke if it is

      //   if (props.deliveryCharges() === undefined) {
      if (JSON.stringify(estimate) !== JSON.stringify(props.deliveryCharges())) {
        console.log('setDeliveryCharges', estimate)
        props.setDeliveryCharges(estimate)
      }

      return { station, security }
    }
  })
  const handleSelectStation = async (selectedStations) => {
    // console.log('handleSelectStation', selectedStations)
    if (selectedStations.length === 0) {
    //   console.log('handleSelectStation length 0', selectedStations)
      setSelectedStationName(null)
      window.localStorage.setItem('jita-anywhere-station', null)
      //   console.log('No station selected')
      props.setDeliveryCharges({ error: 'No station selected' })
      props.setDeliverySelectedValue('None')
      return
    }
    // console.log('selectedStations', selectedStations)
    const selectedStation = selectedStations[0]
    // console.log('selectedStation', selectedStation)
    window.localStorage.setItem('jita-anywhere-station', selectedStation.station)
    setSelectedStationName(selectedStation.station)
    // console.log('selectedStation', selectedStation, selectedStationName())
  }

  return (
    <>
      <Show when={systemStations()} fallback={<Loading />}>
        {/* <p class='text-info'>{selectedStationName()}</p>
        <p class='text-info'>{JSON.stringify(selectedRoute())}</p> */}
        {/* <p class='text-info'>{JSON.stringify(props.deliveryCharges())}</p> */}
        {/* <p class='mb-1'>Select delivery station:</p> */}
        <div class='mb-3'>

          <MultiSelect
            placeholder='Select station'
            loadingMessage='Loading'
            style={{ notFound: { color: 'black' } }}
            emptyRecordMsg='No stations found'
            selectedValues={selectedRoute().station ? [selectedRoute().station] : null}
            options={systemStations().stations}
            isObject
            displayValue='station'
            onSelect={handleSelectStation}
            onRemove={handleSelectStation}
            singleSelect
            // closeIcon='circle2'
            // showArrow='false'
            // customCloseIcon='https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Angle_down_font_awesome.svg/600px-Angle_down_font_awesome.svg.png'
            customCloseIcon={<p>CLOSE</p>}
          />
        </div>
      </Show>

      <Show
        when={props.deliveryCharges()} fallback={
          <div class='d-flex'>
            <span class='col-4'>Delivery</span>
            <span class='ms-auto'>No station selected</span>
          </div>
}
      >
        <Show
          when={props.deliveryCharges().error === undefined} fallback={(
            // <p>Note: {props.deliveryCharges().error}</p>

            <div class='d-flex'>
              <span class='col-4'>Delivery</span>
              <span class='ms-auto'>{props.deliveryCharges().error}</span>
            </div>
        )}
        >
          <div class='d-flex'>
            <span class='col-4'>Service Type</span>
            <span class='ms-auto'>{props.deliveryCharges().serviceType}</span>
          </div>
          <div class='d-flex'>
            <span class='col-4'>Jumps</span>
            <span class='ms-auto'>
              {props.deliveryCharges().jumps.highSec ? ` ${props.deliveryCharges().jumps.highSec} HighSec` : ''}
              {props.deliveryCharges().jumps.lowSec ? ` ${props.deliveryCharges().jumps.lowSec} LowSec` : ''}
              {props.deliveryCharges().jumps.nullSec ? ` ${props.deliveryCharges().jumps.nullSec} NullSec` : ''}
            </span>
          </div>
          <div class='d-flex justify-content-between'>
            <span class=''>Total Volume</span>
            <span class=''>{props.totalVolume.toLocaleString()} m<sup>3</sup></span>
          </div>
          <div class='d-flex'>
            <span class='col-4'>
              Delivery Fee
&nbsp;
              <OverlayTrigger
                placement='right'
                delay={{ hide: 500 }}
                overlay={<Tooltip id='button-tooltip'>Based on PushX<br />Prices may differ</Tooltip>}
              >
                <i class='bi bi-info-circle' style='cursor: pointer;' />
              </OverlayTrigger>
            </span>
            <span class='ms-auto'>{props.deliveryCharges().charge.toLocaleString()} ISK</span>
          </div>
          <div class='d-flex'>
            <span class='col-4'>Rush Fee</span>
            <span class='ms-auto'>{props.deliveryCharges().rush.toLocaleString()} ISK</span>
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
                      checked={props.deliverySelectedValue() === radio.value}
                      onChange={(e) => props.setDeliverySelectedValue(e.currentTarget.value)}
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
