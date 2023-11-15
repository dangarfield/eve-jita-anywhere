import { Tabs, Tab, Alert } from 'solid-bootstrap'
import TypeBrowserList from './TypeBrowserList'
import TypeBrowserFavourites from './TypeBrowserFavourites'
import TypeBrowserAddBulk from './TypeBrowserAddBulk'

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
        <TypeBrowserAddBulk setSelectedType={props.setSelectedType} />
      </Tab>
    </Tabs>
  )
}
export default TypeBrowserSection
