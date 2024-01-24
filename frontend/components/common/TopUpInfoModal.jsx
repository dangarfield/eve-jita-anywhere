import { Button, Modal } from 'solid-bootstrap'
import { useStaticData } from '../../stores/StaticDataProvider'
import { Show, createSignal } from 'solid-js'
import { copyTextToClipboard } from '../../services/utils'
import Loading from './Loading'
import toast from 'solid-toast'
import corpImage from '../../assets/corp-image.png'

const [show, setShow] = createSignal(false)
export const openTopUpInfoModal = () => setShow(true)
const handleClose = () => setShow(false)

const handleCopyToClipboardClick = (text) => {
  console.log('text', text)
  copyTextToClipboard(text)
  toast.success('Copied To Clipboard')
}

export const topUpInfoText = (staticData) => (
  <Show when={staticData()} fallback={<Loading />}>
    <>
      <p>In game, search for and right click on the
        <a href={`/copy-to-clipboard/${staticData().appConfig.corpName}`} class='show-on-hovers ps-1' onClick={(e) => { e.preventDefault(); handleCopyToClipboardClick(staticData().appConfig.corpName) }}>
          <code>{staticData().appConfig.corpName}</code> <i class='bi bi-clipboard-plus pe-1' />
        </a>

        corporation, then click 'Give Money'. Fill in the details as follows:
      </p>
      <div class='alert alert-info fade show col-lg-8 offset-lg-2' role='alert'>
        <p class='mb-0 d-flex justify-content-between'><b>Amount:</b> <code>100000000</code></p>
        <p class='mb-0 d-flex justify-content-between'><b>Reason:</b> <code>deposit</code></p>
      </div>
      <img src={corpImage} class='align-text-top w-100 pb-2' />
      <p><i>Note: Amount can be however much you like, 100,000,000 ISK above is just an example</i></p>
      <p>Please be careful to fill this information in carefully</p>
      <p>It may take up to 1 hour for the transaction to be registered and your balance to be updated, but you will be notified in game</p>
      <p>You can request to withdraw your entire balance at any point</p>
    </>
  </Show>

)
const TopUpInfoModal = () => {
  const [staticData] = useStaticData()
  return (
    <>
      <Modal
        show={show()}
        onHide={handleClose}
      >
        <Modal.Header closeButton>
          <Modal.Title>Top up balance</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {topUpInfoText(staticData)}
        </Modal.Body>
        <Modal.Footer>
          <Button variant='secondary' onClick={handleClose}>Close</Button>
        </Modal.Footer>
      </Modal>
    </>

  )
}
export default TopUpInfoModal
