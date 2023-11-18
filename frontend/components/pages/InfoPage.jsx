import { createMemo, createSignal, onCleanup } from 'solid-js'
import ProgressButton from './ProgressButton'
import { A } from '@solidjs/router'
import InfoCarousel from './InfoCarousel'

const InfoPage = () => {
  const slides = [
    {
      title: 'Buy EVE goods away from your desk',
      content:
  <>
    <p class='fs-4 ps-3'><i class='bi bi-person-fill text-primary pe-3' /><span class='opacity-75'>Buy and get items delivered in EVE online without logging in!</span></p>
    <p class='fs-4 ps-3'><i class='bi bi-headset text-primary pe-3' /><span class='opacity-75'>Get paid to be a personal shopper</span></p>
  </>,
      image: 'image-info'
    },
    {
      title: 'Add a deposit to secure your purchases',
      content:
  <>
    <p class='fs-4 ps-3'><i class='bi bi-person-fill text-primary pe-3' /><span class='opacity-75'>We have a proven track record. <a href='#faq'>Why you can trust us</a></span></p>
    <p class='fs-4 ps-3'><i class='bi bi-headset text-primary pe-3' /><span class='opacity-75'>Agents have certainty in payment</span></p>
  </>,
      image: 'image-deposit'
    },
    {
      title: 'Jita Prices accurate to 5 mins',
      content:
  <>
    <p class='fs-4 ps-3'><i class='bi bi-person-fill text-primary pe-3' /><span class='opacity-75'>You only pay what you agree</span></p>
    <p class='fs-4 ps-3'><i class='bi bi-headset text-primary pe-3' /><span class='opacity-75'>Accurate prices mean less wasted time</span></p>
  </>,
      image: 'image-browse'
    },
    {
      title: 'Checkout without opening the client',
      content:
  <>
    <p class='fs-4 ps-3'><i class='bi bi-person-fill text-primary pe-3' /><span class='opacity-75'>No EVE client? No problem. Buy from your mobile</span></p>
    <p class='fs-4 ps-3'><i class='bi bi-headset text-primary pe-3' /><span class='opacity-75'>Get notified the instant an order is requested</span></p>
  </>,
      image: 'image-checkout'
    },
    {
      title: 'Jobs come to you',
      content:
  <>
    <p class='fs-4 ps-3'><i class='bi bi-headset text-primary pe-3' /><span class='opacity-75'>Select which jobs your want to take</span></p>
    <p class='fs-4 ps-3'><i class='bi bi-person-fill text-primary pe-3' /><span class='opacity-75'>Sit back and relax, your goods will come to you</span></p>
  </>,
      image: 'image-jobs'
    },
    {
      title: 'Purchase',
      content:
  <>
    <p class='fs-4 ps-3'><i class='bi bi-headset text-primary pe-3' /><span class='opacity-75'>Sell your stockpiled goods at Jita prices</span></p>
    <p class='fs-4 ps-3'><i class='bi bi-person-fill text-primary pe-3' /><span class='opacity-75'>Forget about spending time creating hauling contracts</span></p>
  </>,
      image: 'image-purchase'
    },
    {
      title: 'Gimme that ISK',
      content:
  <>
    <p class='fs-4 ps-3'><i class='bi bi-headset text-primary pe-3' /><span class='opacity-75'>Personal shopper: A new career in the EVE universe</span></p>
    <p class='fs-4 ps-3'><i class='bi bi-person-fill text-primary pe-3' /><span class='opacity-75'>Play with game wherever you are</span></p>
  </>,
      image: 'image-profit'
    }]

  const [currentSlide, setCurrentSlide] = createSignal(0)
  const [isPaused, setIsPaused] = createSignal(false)
  const [progress, setProgress] = createSignal(0)

  const autoPlayInterval = 5000

  let intervalId

  const startAutoPlay = () => {
    intervalId = setInterval(() => {
      if (!isPaused()) {
        setCurrentSlide((prev) => (prev + 1) % slides.length)
        setProgress(0) // Reset progress for the new slide
      }
    }, autoPlayInterval)

    const progressInterval = 100
    const steps = autoPlayInterval / progressInterval

    let progressCount = steps

    const incrementProgress = () => {
      if (!isPaused()) {
        setProgress((prev) => Math.min(100, prev + (100 / steps)))
        progressCount++

        if (progressCount === steps) {
          progressCount = 0
        }
      }
    }

    setInterval(incrementProgress, progressInterval)
  }

  const stopAutoPlay = () => {
    clearInterval(intervalId)
  }

  const setSlide = (index) => {
    setCurrentSlide(index)
    setProgress(0)
  }

  onCleanup(() => {
    stopAutoPlay()
  })

  startAutoPlay()

  const currentSliderData = createMemo(() => {
    return slides[currentSlide()]
  })
  return (
    <>
      <div class='container gx-0 mt-5'>
        <div class='row'>
          <div class='col'>
            <ProgressButton
              currentSlide={currentSlide}
              progress={progress}
              setIsPaused={setIsPaused}
              setSlide={setSlide}
              slideID={1}
            >
              <b>User:</b> Deposit ISK
            </ProgressButton>
          </div>
          <div class='col'>
            <ProgressButton
              currentSlide={currentSlide}
              progress={progress}
              setIsPaused={setIsPaused}
              setSlide={setSlide}
              slideID={2}
            >
              <b>User:</b> Browse Jita Offline Store
            </ProgressButton>
          </div>
          <div class='col'>
            <ProgressButton
              currentSlide={currentSlide}
              progress={progress}
              setIsPaused={setIsPaused}
              setSlide={setSlide}
              slideID={3}
            >
              <b>User:</b> Checkout
            </ProgressButton>
          </div>
        </div>
      </div>
      <div class='row'>
        <InfoCarousel sliderData={currentSliderData} />
      </div>

      <div class='container gx-0'>
        <div class='row'>
          <div class='col'>
            <ProgressButton
              currentSlide={currentSlide}
              progress={progress}
              setIsPaused={setIsPaused}
              setSlide={setSlide}
              slideID={4}
              variant='top'
            >
              <b>Agent:</b> View available jobs
            </ProgressButton>
          </div>
          <div class='col'>
            <ProgressButton
              currentSlide={currentSlide}
              progress={progress}
              setIsPaused={setIsPaused}
              setSlide={setSlide}
              slideID={5}
              variant='top'
            >
              <b>Agent:</b> Purchase and deliver
            </ProgressButton>
          </div>
          <div class='col'>
            <ProgressButton
              currentSlide={currentSlide}
              progress={progress}
              setIsPaused={setIsPaused}
              setSlide={setSlide}
              slideID={6}
              variant='top'
            >
              <b>Agent:</b> Profit
            </ProgressButton>
          </div>
        </div>
      </div>
      <div class='container gx-0 py-5 my-5'>

        <div class='row row-cols-1 row-cols-md-2 align-items-md-center g-5 py-5'>
          <div class='col d-flex flex-column align-items-start gap-2'>
            <h2 class='fw-bold text-body-emphasis'>Why trust us?</h2>
            <p class='text-body-secondary'>Paragraph of text beneath the heading to explain the heading. We'll add onto it with another sentence and probably just keep going until we run out of words.</p>
            <A href='/shop' class='btn btn-primary btn-lg'>Shop Now</A>
          </div>

          <div class='col'>
            <div class='row row-cols-1 row-cols-sm-2 g-4'>
              <div class='col d-flex flex-column gap-2 text-center'>
                <div class='feature-icon-small d-inline-flex align-items-center justify-content-center fs-4'>
                  <i class='bi bi-pin' />
                </div>
                <h4 class='fw-semibold mb-0 text-body-emphasis'>Become a User</h4>
                <p class='text-body-secondary'>Paragraph of text beneath the heading to explain the heading.</p>
              </div>

              <div class='col d-flex flex-column gap-2 text-center'>
                <div class='feature-icon-small d-inline-flex align-items-center justify-content-center fs-4'>
                  <i class='bi bi-pin' />
                </div>
                <h4 class='fw-semibold mb-0 text-body-emphasis'>Become an Agent</h4>
                <p class='text-body-secondary'>Paragraph of text beneath the heading to explain the heading.</p>
              </div>

              <div class='col d-flex flex-column gap-2 text-center'>
                <div class='feature-icon-small d-inline-flex align-items-center justify-content-center fs-4'>
                  <i class='bi bi-pin' />
                </div>
                <h4 class='fw-semibold mb-0 text-body-emphasis'>Plex for Good</h4>
                <p class='text-body-secondary'>Paragraph of text beneath the heading to explain the heading.</p>
              </div>

              <div class='col d-flex flex-column gap-2 text-center'>
                <div class='feature-icon-small d-inline-flex align-items-center justify-content-center fs-4'>
                  <i class='bi bi-pin' />
                </div>
                <h4 class='fw-semibold mb-0 text-body-emphasis'>Low Risk</h4>
                <p class='text-body-secondary'>Paragraph of text beneath the heading to explain the heading.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class='container gx-0'>
        <div class='row'>
          <div class='col'>
            <h5>TODO - FAQ - Why you can trust us</h5>
          </div>
        </div>
      </div>
    </>
  )
}
export default InfoPage
