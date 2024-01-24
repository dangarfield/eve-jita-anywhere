import { Card, Col, Form, Row } from 'solid-bootstrap'
import BalanceList from '../common/BalanceList'
import { Show, createResource, createSignal } from 'solid-js'
import Loading from '../common/Loading'
import { useUser } from '../../stores/UserProvider'
import { useStaticData } from '../../stores/StaticDataProvider'
import { topUpInfoText } from '../common/TopUpInfoModal'
import { get, post } from '../../services/utils'
import { useNavigate } from '@solidjs/router'
import ConfirmButton from '../common/ConfirmButton'

const MyBalancePage = () => {
  const navigate = useNavigate()
  const [user, { ensureAccessTokenIsValid, characterName, isLoggedIn }] = useUser()
  const [staticData] = useStaticData()
  const [withdrawalAmount, setWithdrawalAmount] = createSignal(0)

  if (!isLoggedIn()) {
    navigate('/')
    return
  }

  const fetchUserBalance = async () => {
    const balanceRes = await get('/api/balances/@me', await ensureAccessTokenIsValid())
    balanceRes.characterName = characterName
    console.log('balanceRes', balanceRes)
    setWithdrawalAmount(balanceRes.balance)
    return balanceRes
  }
  const [userBalance, { refetch }] = createResource(fetchUserBalance)

  const handleWithdrawalChange = (event) => {
    setWithdrawalAmount(Number(event.target.value))
  }
  const handleWithdrawalRequest = async () => {
    console.log('handleWithdrawalRequest', withdrawalAmount())
    const res = await post('/api/withdrawals', { amount: withdrawalAmount() }, await ensureAccessTokenIsValid())
    console.log('res', res)
    refetch()
  }

  return (
    <div class='row mb-3'>
      <div class='col-md-6 mt-3'>
        <h3>Your balance</h3>
        <Show when={userBalance()} fallback={<Loading />}>
          <BalanceList userBalance={userBalance()} />
        </Show>
      </div>
      <div class='col-md-4 mt-3'>
        <h3>How To Top Up Your Balance</h3>
        {topUpInfoText(staticData, ensureAccessTokenIsValid)}

        <h3 class='mt-5'>How To Withdraw Your ISK</h3>
        <p>As returning your money to you is a manual process, you have to request a withdrawal.</p>
        <p>We will normally fulfil this within 48 hrs, but it will often be much faster.</p>
        <p>You can only have one active withdrawal at a time.</p>

        <Show when={userBalance()} fallback={<Loading />}>
          <Show
            when={userBalance().withdrawal.amount === 0} fallback={
              <div class='alert alert-info fade show col-lg-8 offset-lg-2' role='alert'>
                <p class='mb-0 d-flex justify-content-between'><b>Withdraw Requested:</b> <code>{userBalance().withdrawal.amount.toLocaleString()} ISK</code></p>
                <p class='mb-0 d-flex justify-content-between'><b>Status:</b> <code>{userBalance().withdrawal.complete ? 'TRANSFER COMPLETE' : 'PENDING'}</code></p>
              </div>
          }
          >
            <Show
              when={userBalance().balance > 0} fallback={
                <div class='alert alert-info fade show col-lg-8 offset-lg-2' role='alert'>
                  <p class='mb-0 d-flex justify-content-between'><b>Nothing to withdraw</b> <span><code>0 ISK</code></span></p>
                </div>
            }
            >
              <Card>
                <Card.Body class='pb-0'>
                  <Form.Group as={Row} controlId='withdrawalAmountText'>
                    <Col sm='4' class='mb-3'>
                      <Form.Label>
                        Withdrawal amount
                      </Form.Label>
                    </Col>
                    <Col sm='3' class='mb-3'>
                      <Form.Control type='number' min={1} max={userBalance().balance} value={withdrawalAmount()} onInput={handleWithdrawalChange} />
                    </Col>
                    <Col sm='5' class='mb-3'>
                      <ConfirmButton class='w-100' onClick={handleWithdrawalRequest}>Request Withdrawal</ConfirmButton>
                    </Col>
                    <Col sm='12' class='mb-3'>
                      <Form.Range min={1} max={userBalance().balance} value={withdrawalAmount()} step={1} onInput={handleWithdrawalChange} />
                    </Col>
                  </Form.Group>
                </Card.Body>
              </Card>
            </Show>

          </Show>
        </Show>
      </div>
    </div>
  )
}
export default MyBalancePage
