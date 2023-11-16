import { Alert, Form } from 'solid-bootstrap'
import { For, Show, createResource } from 'solid-js'
import { copyTextToClipboard, getAdmin, patchAdmin } from '../../services/utils'
import Loading from '../common/Loading'
import { addCharacterNames } from '../../services/esi'
import toast from 'solid-toast'

const AdminWithdrawalRequests = () => {
  const fetchWithdrawalRequests = async () => {
    const withdrawals = await getAdmin('/api/withdrawals')
    await addCharacterNames(withdrawals)
    console.log('withdrawals', withdrawals)
    return withdrawals
  }
  const [withdrawals] = createResource(fetchWithdrawalRequests)

  const handleCopyToClipboardClick = (text) => {
    console.log('text', text)
    copyTextToClipboard(text)
    toast.success('Copied To Clipboard')
  }
  const handleClickSwitch = async (characterID, checked) => {
    console.log('handleClickSwitch', characterID, checked)
    const res = await patchAdmin('/api/withdrawals', { characterID, complete: checked })
    console.log('res', res)
  }
  return (
    <div class='col-6'>
      <h3>Process:</h3>
      <div class='alert alert-info fade show col-lg-8 offset-lg-2' role='alert'>
        <p class='mb-0 d-flex justify-content-between'><b>Copy character name:</b> <code>Using <i class='bi bi-clipboard-plus text-light' /> icon</code></p>
        <p class='mb-0 d-flex justify-content-between'><b>Search for name in EVE:</b></p>
        <p class='mb-0 d-flex justify-content-between'><b>Right click character:</b> <code>Transfer Corporation Cash</code></p>
        <p class='mb-0 d-flex justify-content-between'><b class='ps-2'>Amount:</b> <code>eg, 100000000</code></p>
        <p class='mb-0 d-flex justify-content-between'><b class='ps-2'>Reason:</b> <code>withdrawal</code></p>
        <p class='mb-0 d-flex justify-content-between'><b class=''>Mark as complete:</b> <code>true</code></p>
      </div>
      <p>When the ESI data is scraped (max 1 hour), the user will be informed, the request will be fulfilled and disappear from this screen</p>

      <h3>Pending Withdrawals:</h3>
      <Show when={withdrawals()} fallback={<Loading />}>
        <hr />

        <div class='row'>
          <div class='col'><h5>Name</h5></div>
          <div class='col text-end'><h5>Amount</h5></div>
          <div class='col text-end'><h5>Reason</h5></div>
          <div class='col text-end'><h5>Payment sent?</h5></div>
        </div>
        <hr />
        <For each={withdrawals()} fallback={<Alert variant='border border-light text-center mt-1'>No withdrawal requests</Alert>}>
          {(req) =>
          // <p>yo {req.characterID} {req.characterName} {req.amount} {req.characterName}</p>
            <>
              <div class='row'>
                <div class='col'>
                  {req.characterName}
                  <a href={`/copy-to-clipboard/${req.characterName}`} class='show-on-hover ps-1' onClick={(e) => { e.preventDefault(); handleCopyToClipboardClick(req.characterName) }}><i class='bi bi-clipboard-plus' /></a>
                </div>
                <div class='col text-end'>
                  <code>{req.amount.toLocaleString()} ISK</code>
                  <a href={`/copy-to-clipboard/${req.amount}`} class='show-on-hover ps-1' onClick={(e) => { e.preventDefault(); handleCopyToClipboardClick(req.amount) }}><i class='bi bi-clipboard-plus' /></a>
                </div>
                <div class='col text-end'>
                  <code>withdrawal</code>
                  <a href='/copy-to-clipboard/withdrawal' class='show-on-hover text-light ps-1' onClick={(e) => { e.preventDefault(); handleCopyToClipboardClick('withdrawal') }}><i class='bi bi-clipboard-plus' /></a>
                </div>
                <div class='col'>
                  <Form.Check
                    class='float-end'
                    type='switch'
                    label='COMPLETE'
                    onClick={(e) => handleClickSwitch(req.characterID, e.target.checked)}
                    checked={req.complete}
                  />
                </div>
              </div>
              <hr />
            </>}
        </For>
      </Show>

    </div>
  )
}
export default AdminWithdrawalRequests
