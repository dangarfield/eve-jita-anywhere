import { Button } from 'solid-bootstrap'
import { createSignal, createEffect } from 'solid-js'

const ConfirmButton = (props) => {
  const [confirming, setConfirming] = createSignal(false)
  const [disabled, setDisabled] = createSignal(false)

  const handleClick = () => {
    if (confirming()) {
      props.onClick && props.onClick()
      setDisabled(true)
      setConfirming(false)
    } else {
      setConfirming(true)
    }
  }
  createEffect(() => () => setConfirming(false))

  return (
    <Button {...props} onClick={handleClick} disabled={disabled()}>
      {confirming() ? 'Are you sure?' : props.children}
    </Button>
  )
}

export default ConfirmButton
