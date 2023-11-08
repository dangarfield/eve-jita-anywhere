import { triggerReturnFlow } from '../../services/auth'
import Header from '../common/Header'
import Loading from '../common/Loading'

const SSOReturnPage = () => {
  triggerReturnFlow()
  return (
    <div class='container d-flex justify-content-center align-items-center' style='min-height: 100vh;'>
      <div class='text-center'>
        <Loading />
      </div>
    </div>
  )
}
export default SSOReturnPage
