import { Alert } from 'solid-bootstrap'
import Header from '../common/Header'

const HomePage = () => {
  return (
    <div class='container-fluid'>
      <div class='row'>
        <div class='col'>
          <Header />
        </div>
      </div>
      <div class='row'>
        <div class='col-4'>
          <Alert variant='border border-info text-info text-center mt-1'>Coming Soon: Info</Alert>
        </div>
      </div>
    </div>
  )
}
export default HomePage
