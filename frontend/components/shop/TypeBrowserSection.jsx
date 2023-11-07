import { Tabs, Tab } from 'solid-bootstrap'
import TypeBrowserList from './TypeBrowserList'

const TypeBrowserSection = (props) => {
  return (
    <Tabs defaultActiveKey='browse' id='uncontrolled-tab-example' class='mb-3' variant='underline'>
      <Tab eventKey='browse' title='Browse'>
        <TypeBrowserList setSelectedType={props.setSelectedType} />
      </Tab>
      <Tab eventKey='favourites' title='Favourites'>
        <h2>Favourites</h2>
        <p>tbc</p>
      </Tab>
      <Tab eventKey='add-bulk' title='Add Bulk'>
        <h2>Add Bulk</h2>
        <p>tbc</p>
      </Tab>
    </Tabs>
  )
}
export default TypeBrowserSection
