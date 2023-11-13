import { Alert } from 'solid-bootstrap'
import BalanceList from '../common/BalanceList'
import { Show } from 'solid-js'
import Loading from '../common/Loading'
import { useUser } from '../../stores/UserProvider'
import { useStaticData } from '../../stores/StaticDataProvider'
import { topUpInfoText } from '../common/TopUpInfoModal'

const MyBalancePage = () => {
  const [staticData] = useStaticData()
  const [user, { userBalance }] = useUser()
  return (
    <div class='row'>
      <div class='col-6'>
        <h3>Your balance</h3>
        <Show when={userBalance()} fallback={<Loading />}>
          <BalanceList userBalance={userBalance()} />
        </Show>
      </div>
      <div class='col-4'>
        <h3>How To Top Up Your Balance</h3>
        {topUpInfoText(staticData)}
        <h3 class='mt-5'>How To Top Withdraw Your ISK</h3>
        <Alert variant='border border-info text-info text-center mt-1'>Coming Soon: Withdraw my ISK</Alert>
      </div>
    </div>
  )
}
export default MyBalancePage
