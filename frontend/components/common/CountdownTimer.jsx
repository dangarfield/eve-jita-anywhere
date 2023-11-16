import { createSignal, onCleanup } from 'solid-js'

const CountdownTimer = ({ targetDate }) => {
  const calculateTimeRemaining = () => {
    const now = new Date().getTime()
    const targetTime = new Date(targetDate).getTime()
    const timeRemaining = targetTime - now

    const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000)

    return { minutes, seconds }
  }

  const [timeRemaining, setTimeRemaining] = createSignal(calculateTimeRemaining())

  const updateTimer = () => {
    setTimeRemaining(calculateTimeRemaining())
  }
  const timerInterval = setInterval(updateTimer, 1000)
  onCleanup(() => {
    clearInterval(timerInterval)
  })

  return (
    <span>{timeRemaining().minutes > 0 ? `${timeRemaining().minutes}m ` : ''}{timeRemaining().seconds}s</span>
  )
}

export default CountdownTimer
