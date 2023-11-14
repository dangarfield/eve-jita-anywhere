import { Show, createMemo, createResource } from 'solid-js'
import { useStaticData } from '../../stores/StaticDataProvider'
import { Alert } from 'solid-bootstrap'
import { getJitaSellOrders, getRegionHistory } from '../../services/esi'
import Loading from '../common/Loading'
import TypeDetailsActions from './TypeDetailsActions'
import TypeDetailsPrice from './TypeDetailsPrice'
import EveTypeIcon from '../common/EveTypeIcon'
import TypeDetailsHistory from './TypeDetailsHistory'

const TypeDetailsSection = (props) => {
  const [staticData] = useStaticData()
  // console.log('TypeDetails props', props)
  // createEffect(() => {
  //   console.log('Market Types Data:', staticData)
  // })
  const [orders] = createResource(props.selectedType, getJitaSellOrders)
  const [history] = createResource(props.selectedType, getRegionHistory)

  const selectedType = createMemo(() => {
    return staticData().types[props.selectedType()]
  })

  // const name = staticData().types[props.selectedType()].name
  return (
    <>
      {staticData.loading
        ? (<p>LOADING...</p>)
        : (
            props.selectedType() === null
              ? <Alert variant='dark'>Select Type</Alert>
              : (
                <>
                  <div class='align-items-center d-flex align-items-center mb-2'>
                    <EveTypeIcon type={selectedType()} />
                    <h3 className='ps-2 mb-0'>
                      {selectedType().name}
                    </h3>
                    <i class={`bi ${props.favourites().includes(props.selectedType()) ? 'bi-star-fill' : 'bi-star'} fs-5 text-s ps-2 pointer`} onClick={() => props.toggleFavourites(props.selectedType())} />
                  </div>
                  {/* <Tabs defaultActiveKey='details' class='mb-3' variant='underline'>
                    <Tab eventKey='details' title='Details'> */}
                  <TypeDetailsActions orders={orders} selectedType={selectedType} />

                  {/* <Show when={history()} fallback={<Loading />}>
                        <TypeDetailsHistory selectedType={selectedType} history={history} />
                      </Show> */}
                  {/* </Tab>
                    <Tab eventKey='price' title='Jita Price'> */}
                  <TypeDetailsPrice orders={orders} favourites={props.favourites} setFavourites={props.setFavourites} />
                  {/* </Tab>
                    <Tab eventKey='history' title='History'> */}
                  <Show when={history()} fallback={<Loading />}>
                    <TypeDetailsHistory selectedType={selectedType} history={history} />
                  </Show>
                  {/* </Tab> */}
                </>)

      // <p>Type: {props.selectedType()} - {JSON.stringify(staticData().types[props.selectedType()])}</p>
          )}
    </>
  )
}
export default TypeDetailsSection
