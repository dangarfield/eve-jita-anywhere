import { Button, Modal } from 'solid-bootstrap'
import { createSignal } from 'solid-js'

const [show, setShow] = createSignal(false)
export const [content, setContent] = createSignal((<p>Content</p>))
export const openInfoModal = () => setShow(true)
const handleClose = () => setShow(false)

const InfoModal = () => {
  return (
    <>
      <Modal
        show={show()}
        onHide={handleClose}
      >
        <Modal.Header closeButton>
          <Modal.Title>Info</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {content()}
        </Modal.Body>
        <Modal.Footer>
          <Button variant='secondary' onClick={handleClose}>Close</Button>
        </Modal.Footer>
      </Modal>
    </>

  )
}
export default InfoModal
