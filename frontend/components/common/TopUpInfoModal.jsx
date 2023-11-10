import { Button, Modal } from 'solid-bootstrap'
import { useStaticData } from '../../stores/StaticDataProvider'
import { createSignal } from 'solid-js'

const [show, setShow] = createSignal(false)
export const openTopUpInfoModal = () => setShow(true)
const handleClose = () => setShow(false)

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
          <p>In game, search for and right click on the <code>{staticData().appConfig.corpName}</code> corporation, then click 'Give Money'. Fill in the details as follows:</p>
          <div class='alert alert-info fade show col-lg-8 offset-lg-2' role='alert'>
            <p class='mb-0 d-flex justify-content-between'><b>Amount:</b> <code>100000000</code></p>
            <p class='mb-0 d-flex justify-content-between'><b>Reason:</b> <code>deposit</code></p>
          </div>
          <p><i>Note: Amount can be however much you like, 100,000,000 ISK above is just an example</i></p>
          <p>Please be careful to fill this information in carefully</p>
          <p>It may take up to 1 hour for the transation to be registered and your balance to be updated, but you will be notified in game</p>
          <p>You can request to withdraw your entire balance at any point</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant='secondary' onClick={handleClose}>Close</Button>
        </Modal.Footer>
      </Modal>
    </>

  )
}
export default TopUpInfoModal
