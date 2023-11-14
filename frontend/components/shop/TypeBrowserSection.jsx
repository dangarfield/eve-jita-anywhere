import { Tabs, Tab, Alert } from 'solid-bootstrap'
import TypeBrowserList from './TypeBrowserList'
import TypeBrowserFavourites from './TypeBrowserFavourites'

const TypeBrowserSection = (props) => {
  return (
    <Tabs defaultActiveKey='browse' id='uncontrolled-tab-example' class='mb-3' variant='underline'>
      <Tab eventKey='browse' title='Browse'>
        <TypeBrowserList setSelectedType={props.setSelectedType} />
      </Tab>
      <Tab eventKey='favourites' title='Favourites'>
        <TypeBrowserFavourites setSelectedType={props.setSelectedType} favourites={props.favourites} toggleFavourites={props.toggleFavourites} />
      </Tab>
      <Tab eventKey='add-bulk' title='Add Bulk'>
        <Alert variant='border border-info text-info text-center mt-1'>Coming Soon: Add Bulk</Alert>
      </Tab>
    </Tabs>
  )
}
export default TypeBrowserSection
