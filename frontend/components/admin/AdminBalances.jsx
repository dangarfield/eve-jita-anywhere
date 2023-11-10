import { For, Show, createResource } from 'solid-js'
import Loading from '../common/Loading'
import { getAdmin } from '../../services/utils'
import { Col } from 'solid-bootstrap'
import { addCharacterNames } from '../../services/esi'
import BalanceList from '../common/BalanceList'
const getBalances = async () => {
  const balances = await getAdmin('/api/balances')
  await addCharacterNames(balances)
  console.log('balances', balances)
  return balances
}
const AdminBalances = () => {
  const [balances] = createResource(getBalances)
  return (
    <>
      <Show when={balances()} fallback={<Loading />}>
        {/* <p>{JSON.stringify(balances())}</p> */}
        <Col sm={6}>
          <For each={balances()}>
            {(userBalance) =>
              <>
                <BalanceList userBalance={userBalance} />
              </>}
          </For>
        </Col>
      </Show>
    </>
  )
}
export default AdminBalances

//
// PROCESS
//
// User adds ISK to their balance - 120m
// User creates a cart - 100m (90m materials, 5m for agent, 5m for P4G)
// We 'reserve' that money from their balance AND include a 10% contingency as prices may go up, eg 110m
// Order is ready for agents (more detail another time)
// An agent picks up the order (more detail another time)
// A agent purchases the items - Cost to the agent = 92m materials (expected cost 90m)
// ^^^ THIS IS THE DISCUSSION POINT

// Agent updates / delivers, user accepts etc
// The user reserve of 110m is released
// The user payment of 102m (92+5+5) is secured, user balance now 8m
// Agent payout balance is increased by 97 (92+5)
// P4G payout balance is increased by 5
