import { Button } from 'solid-bootstrap'
import { Show } from 'solid-js'

const ProgressButton = ({ currentSlide, progress, setIsPaused, setSlide, slideID, children, variant }) => {
  return (
    <Button
      variant='outline-light w-100 p-0 h-100 position-relative'
      onMouseEnter={() => { setIsPaused(true); setSlide(slideID) }}
      onMouseLeave={() => setIsPaused(false)}
    >
      <span
        class='position-absolute top-75 start-0 translate-middles badge bg-light text-dark fs-6'
        style={{ 'border-bottom-left-radius': 0, 'border-top-right-radius': 0 }}
      >Step {slideID}
      </span>
      <Show when={!variant}>
        <span class='py-4 d-block'>{children}</span>
      </Show>
      <div class='px-0' style={{ width: '100%', height: '5px' }}>
        <div
          style={{
            width: `${currentSlide() === slideID ? progress() : 0}%`,
            height: '100%',
            background: 'white',
            transition: 'width 0.1s linear'
          }}
        />
      </div>

      <Show when={variant === 'top'}>
        <span class='py-4 d-block'>{children}</span>
      </Show>

    </Button>
  )
}
export default ProgressButton
