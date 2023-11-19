import { Button } from 'solid-bootstrap'
import { Show } from 'solid-js'

const ProgressButton = ({ currentSlide, progress, setIsPaused, setSlide, slideID, children, variant }) => {
  return (
    <Button
      variant={`${currentSlide() === slideID ? 'outline-light' : 'outline-secondary'} w-100 p-0 h-100 position-relative`}
      onMouseEnter={() => { setIsPaused(true); setSlide(slideID) }}
      onMouseLeave={() => setIsPaused(false)}
    >
      <span
        class={`position-absolute top-75 start-0 translate-middles badge ${currentSlide() === slideID ? 'bg-light' : 'bg-secondary'} text-dark fs-6`}
        style={{ 'border-bottom-left-radius': 0, 'border-top-right-radius': 0 }}
      >Step {slideID}
      </span>
      <Show when={!variant}>
        <span class='py-4 px-1 d-block fs-5'>{children}</span>
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
        <span class='py-4 px-1 d-block fs-5'>{children}</span>
      </Show>

    </Button>
  )
}
export default ProgressButton
