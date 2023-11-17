import { createEffect, createMemo, createSignal } from 'solid-js'
import { FloatingLabel, Form } from 'solid-bootstrap'

function CharacterCountTextarea (props) {
  const { controlId, label, placeholder, style, maxlength, onChange, value, setDisputeComment, disabled } = props

  const [remaining, setRemaining] = createSignal(maxlength)

  createEffect(() => {
    console.log('CharacterCountTextarea effect', value(), disabled)
  })
  const handleTextareaChange = (event) => {
    const remainingText = maxlength - event.target.value.length
    console.log('handleTextareaChange', event.target.value, remainingText)
    setRemaining(remainingText)
    const inputValue = event.target.value.slice(0, maxlength)
    setDisputeComment(inputValue)
    onChange && onChange(inputValue)
  }

  return (
    <FloatingLabel controlId={controlId} label={label}>
      <Form.Control
        as='textarea'
        placeholder={placeholder}
        style={style}
        maxlength={maxlength}
        onInput={handleTextareaChange}
        value={value()}
        disabled={disabled}
      />
      <div class='text-end' style={{ fontSize: '12px', marginTop: '5px', color: remaining() < 10 ? 'red' : 'white' }}>
        {remaining} / {maxlength}
      </div>
    </FloatingLabel>
  )
}
export default CharacterCountTextarea
