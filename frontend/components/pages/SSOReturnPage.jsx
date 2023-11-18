import { triggerReturnFlow } from '../../services/auth'
import Loading from '../common/Loading'

const SSOReturnPage = () => {
  triggerReturnFlow()
  return (
    <div class='container d-flex justify-content-center align-items-center mt-5' style='min-height: 100vh;'>
      <div class='text-center'>
        <Loading />
      </div>
    </div>
  )
}
export default SSOReturnPage
