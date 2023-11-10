import { Show, createResource } from 'solid-js'
import { get } from '../../services/utils'
import MultiSelect from '@digichanges/solid-multiselect'
import './MultiSelect.css'
const getSystemStations = async () => {
  const systems = await get('/generated-data/system-stations.json')
  const stations = systems.flatMap(({ systemName, systemID, stations }) =>
    stations.map(station => ({ systemName, systemID, station }))
  )
  stations.sort((a, b) => a.systemName.localeCompare(b.systemName) || a.station.localeCompare(b.station))
  console.log('stations', stations)
  return stations
}
const Delivery = () => {
  const [systemStations] = createResource(getSystemStations)

  const handleSelectStation = (selectedStations) => {
    console.log('handleSelectStation', selectedStations)
  }
  return (
    <>
      <Show when={systemStations()}>
        <MultiSelect
          loadingMessage='loading'
          style={{ notFound: { color: 'black' } }}
          emptyRecordMsg='No stations found'
          selectedValues={null}
          options={systemStations()}
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
