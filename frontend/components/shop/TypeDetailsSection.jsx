import { Show, createMemo, createResource } from 'solid-js'
import { useStaticData } from '../../stores/StaticDataProvider'
import { Alert } from 'solid-bootstrap'
import { getJitaSellOrders, getRegionHistory } from '../../services/esi'
import Loading from '../common/Loading'
import TypeDetailsActions from './TypeDetailsActions'
import TypeDetailsPrice from './TypeDetailsPrice'
import EveTypeIcon from '../common/EveTypeIcon'
import TypeDetailsHistory from './TypeDetailsHistory'

//
const TypeDetailsSection = ({ selectedType, favourites, toggleFavourites, setSelectedTab }) => {
  const [staticData] = useStaticData()
  // console.log('TypeDetails props', props)
  // createEffect(() => {
  //   console.log('Market Types Data:', staticData)
  // })
  const [orders] = createResource(selectedType, getJitaSellOrders)
  const [history] = createResource(selectedType, getRegionHistory)

  const selectedTypeData = createMemo(() => {
    // console.log('selectedTypeData', staticData().types[selectedType()])
    return staticData().types[selectedType()]
  })

  // const name = staticData().types[selectedType()].name
  return (
    <>
      {staticData.loading
        ? (<p>LOADING...</p>)
        : (
            selectedType() === null
              ? <Alert variant='dark'>Select Type</Alert>
              : (
                <>
                  <div class='align-items-center d-flex align-items-center mb-2'>
                    {/* <EveTypeIcon type={selectedTypeData()} /> */}
                    {/* TODO - The above icon doesn't update properly when switching between a skin and an asset. Need to investigate */}
                    {selectedTypeData().skin_material_id
                      ? (
                        <img class='width-32' src={`/generated-icons/skin-${selectedTypeData().skin_material_id}.png`} />
                        )
                      : (
                        <img src={`https://images.evetech.net/types/${selectedTypeData().type_id}/${selectedTypeData().name.includes('Blueprint') || selectedTypeData().name.includes('Reaction Formula') ? 'bp' : 'icon'}`} class='width-32' />
                        )}

                    <h3 className='ps-2 mb-0'>
                      {selectedTypeData().name}
                    </h3>
                    <i class={`bi ${favourites().includes(selectedType()) ? 'bi-star-fill' : 'bi-star'} fs-5 text-s ps-2 pointer`} onClick={() => toggleFavourites(selectedType())} />
                  </div>
                  {/* <Tabs defaultActiveKey='details' class='mb-3' variant='underline'>
                    <Tab eventKey='details' title='Details'> */}
                  <TypeDetailsActions orders={orders} selectedType={selectedTypeData} setSelectedTab={setSelectedTab} />

                  {/* <Show when={history()} fallback={<Loading />}>
                        <TypeDetailsHistory selectedType={selectedType} history={history} />
                      </Show> */}
                  {/* </Tab>
                    <Tab eventKey='price' title='Jita Price'> */}
                  <TypeDetailsPrice orders={orders} favourites={favourites} />
                  {/* </Tab>
                    <Tab eventKey='history' title='History'> */}
                  <Show when={history()} fallback={<Loading />}>
                    <TypeDetailsHistory selectedType={selectedTypeData} history={history} />
                  </Show>
                  {/* </Tab> */}
                </>)

      // <p>Type: {selectedType()} - {JSON.stringify(staticData().types[selectedType()])}</p>
          )}
    </>
  )
}
export default TypeDetailsSection
