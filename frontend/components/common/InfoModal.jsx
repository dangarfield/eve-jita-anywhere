import { Button, Modal } from 'solid-bootstrap'
import { createEffect, createSignal } from 'solid-js'

const [show, setShow] = createSignal(false)
const [title, setTitle] = createSignal('Info')
const [modalContent, setModalContent] = createSignal((<p>Content</p>))
const [action, setAction] = createSignal(null)

export const openInfoModal = (newTitle, newContent, newAction) => {
  setTitle(newTitle || 'Info')
  setModalContent(newContent || <p>Content</p>)
  setAction(newAction || null)
  setShow(true)
}
const InfoModal = () => {
  const handleClose = () => setShow(false)

  createEffect(() => {
    if (!show()) {
      setTitle('Info')
      setModalContent(<p>Default Content</p>)
      setAction(null)
    }
  })
  return (
    <>
      <Modal show={show()} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>{title()}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{modalContent()}</Modal.Body>
        <Modal.Footer>
          {action()}
          <Button variant='secondary' onClick={handleClose}>Close</Button>
        </Modal.Footer>
      </Modal>
    </>

  )
}
export default InfoModal
