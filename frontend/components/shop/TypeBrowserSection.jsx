import { Tabs, Tab, Alert } from 'solid-bootstrap'
import TypeBrowserList from './TypeBrowserList'

const TypeBrowserSection = (props) => {
  return (
    <Tabs defaultActiveKey='browse' id='uncontrolled-tab-example' class='mb-3' variant='underline'>
      <Tab eventKey='browse' title='Browse'>
        <TypeBrowserList setSelectedType={props.setSelectedType} />
      </Tab>
      <Tab eventKey='favourites' title='Favourites'>
        <Alert variant='border border-info text-info text-center mt-1'>Coming Soon: Favourites</Alert>
      </Tab>
      <Tab eventKey='add-bulk' title='Add Bulk'>
        <Alert variant='border border-info text-info text-center mt-1'>Coming Soon: Add Bulk</Alert>
      </Tab>
    </Tabs>
  )
}
export default TypeBrowserSection
