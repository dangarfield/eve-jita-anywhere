import { createMemo, createSignal, onCleanup } from 'solid-js'
import ProgressButton from './ProgressButton'
import { A } from '@solidjs/router'
import InfoCarousel from './InfoCarousel'

const InfoPage = () => {
  const slides = [
    {
      link: <><b>All:</b> What do we do?</>,
      title: 'Buy EVE goods away from your desk',
      content:
  <>
    <p class='fs-4 ps-3'><i class='bi bi-person-fill text-primary pe-3' /><span class='opacity-75'>Purchase and receive EVE Online items without logging in</span></p>
    <p class='fs-4 ps-3'><i class='bi bi-headset text-primary pe-3' /><span class='opacity-75'>Earn as a personal shopper</span></p>
  </>,
      image: 'image-info'
    },
    {
      link: <><b>User:</b> Deposit ISK</>,
      title: 'Add a deposit to secure your purchases',
      content:
  <>
    <p class='fs-4 ps-3'><i class='bi bi-person-fill text-primary pe-3' /><span class='opacity-75'>We have a proven track record. <a href='#trust'>Why trust us?</a></span></p>
    <p class='fs-4 ps-3'><i class='bi bi-person-fill text-primary pe-3' /><span class='opacity-75'>Pay only what you agree on</span></p>
  </>,
      image: 'image-deposit'
    },
    {
      link: <><b>User:</b> Browse Jita Anywhere Store</>,
      title: 'Jita Prices accurate to 5 mins',
      content:
  <>
    <p class='fs-4 ps-3'><i class='bi bi-person-fill text-primary pe-3' /><span class='opacity-75'>Affordable convenience</span></p>
    <p class='fs-4 ps-3'><i class='bi bi-person-fill text-primary pe-3' /><span class='opacity-75'>Forget about spending time creating hauling contracts</span></p>
  </>,
      image: 'image-browse'
    },
    {
      link: <><b>User:</b> Checkout</>,
      title: 'Checkout without opening the client',
      content:
  <>
    <p class='fs-4 ps-3'><i class='bi bi-person-fill text-primary pe-3' /><span class='opacity-75'>No EVE client? No problem. Buy from your mobile</span></p>
    <p class='fs-4 ps-3'><i class='bi bi-person-fill text-primary pe-3' /><span class='opacity-75'>Checked out? Now just sit back, relax and wait for it to arrive</span></p>
  </>,
      image: 'image-checkout'
    },
    {
      link: <><b>Agent:</b> View available jobs</>,
      title: 'Jobs come to you',
      content:
  <>
    <p class='fs-4 ps-3'><i class='bi bi-headset text-primary pe-3' /><span class='opacity-75'>Get notified instantly when an order is requested</span></p>
    <p class='fs-4 ps-3'><i class='bi bi-headset text-primary pe-3' /><span class='opacity-75'>Select the jobs you want</span></p>
  </>,
      image: 'image-jobs'
    },
    {
      link: <><b>Agent:</b> Purchase and deliver</>,
      title: 'Purchase',
      content:
  <>
    <p class='fs-4 ps-3'><i class='bi bi-headset text-primary pe-3' /><span class='opacity-75'>Accurate prices mean less wasted time</span></p>
    <p class='fs-4 ps-3'><i class='bi bi-headset text-primary pe-3' /><span class='opacity-75'>Personal shopper: A new career in the EVE universe</span></p>
  </>,
      image: 'image-purchase'
    },
    {
      link: <><b>Agent:</b> Profit</>,
      title: 'Gimme that ISK',
      content:
  <>
    <p class='fs-4 ps-3'><i class='bi bi-headset text-primary pe-3' /><span class='opacity-75'>Agents have certainty in payment</span></p>
    <p class='fs-4 ps-3'><i class='bi bi-headset text-primary pe-3' /><span class='opacity-75'>The easiest job you'll ever have</span></p>
  </>,
      image: 'image-profit'
    }]

  const [currentSlide, setCurrentSlide] = createSignal(0)
  const [isPaused, setIsPaused] = createSignal(false)
  const [progress, setProgress] = createSignal(0)

  const autoPlayInterval = 6000

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
              {slides[1].link}
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
              {slides[2].link}
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
              {slides[3].link}
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
              {slides[4].link}
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
              {slides[5].link}
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
              {slides[6].link}
            </ProgressButton>
          </div>
        </div>
      </div>
      <div class='container gx-0 py-5 my-5'>
        <div class='row row-cols-1 row-cols-md-2 align-items-md-center g-5 py-5'>
          <div class='col d-flex flex-column align-items-start gap-2'>
            <h2 class='fw-bold text-body-emphasis' id='trust'>Why trust us?</h2>

            <div class='d-flex align-items-center mb-2'>
              <i class='bi bi-person-fill text-primary pe-2 fs-5' />
              <span class='text-body-secondary'>Project led by Kukela, CEO of <a href='https://discord.gg/tBJmdmtvQq' target='_blank' rel='noreferrer'>United Standings Improvement Agency</a> - a tried and tested standings raising service operating for the last 14 years</span>
            </div>
            <div class='d-flex align-items-center mb-2'>
              <i class='bi bi-person-fill text-primary pe-2 fs-5' />
              <span class='text-body-secondary'>Developed by Seraph Sephiroth, behind <a href='https://abyssboard.space' target='_blank' rel='noreferrer'>abyssboard.space</a>. All <a href='https://github.com/dangarfield' target='_blank' rel='noreferrer'>source code</a> is publically available</span>
            </div>
            <div class='d-flex align-items-center mb-2'>
              <i class='bi bi-person-fill text-primary pe-2 fs-5' />
              <span class='text-body-secondary'>Backend and sponsored by <a href='https://community.eveonline.com/community/csm/current-csm' target='_blank' rel='noreferrer'>CSM member Oz</a> and his team of trillionaire investors at <a href='https://discord.com/invite/FZccntUScP' target='_blank' rel='noreferrer'>Oz Discord</a></span>
            </div>

            <div class='d-flex justify-content-center w-100'>
              <A href='/shop' class='btn btn-primary btn-lg'>Shop Now</A>
            </div>
          </div>

          <div class='col'>
            <div class='row row-cols-1 row-cols-sm-2 g-4'>
              <div class='col d-flex flex-column gap-2 text-center'>
                <div class='feature-icon-small d-inline-flex align-items-center justify-content-center fs-4'>
                  <i class='bi bi bi-person-fill' />
                </div>
                <h4 class='fw-semibold mb-0 text-body-emphasis'>Become a User</h4>
                <p class='text-body-secondary'>Purchase and receive EVE Online items without logging in</p>
              </div>

              <div class='col d-flex flex-column gap-2 text-center'>
                <div class='feature-icon-small d-inline-flex align-items-center justify-content-center fs-4'>
                  <i class='bi bi bi-headset' />
                </div>
                <h4 class='fw-semibold mb-0 text-body-emphasis'>Become an Agent</h4>
                <p class='text-body-secondary'>Personal shopper: A new career in the EVE universe</p>
              </div>

              <div class='col d-flex flex-column gap-2 text-center'>
                <div class='feature-icon-small d-inline-flex align-items-center justify-content-center fs-4'>
                  <i class='bi bi-globe' />
                </div>
                <h4 class='fw-semibold mb-0 text-body-emphasis'>Plex for Good</h4>
                <p class='text-body-secondary'>We don't make ISK from this.<br />All profits to Plex for good</p>
              </div>

              <div class='col d-flex flex-column gap-2 text-center'>
                <div class='feature-icon-small d-inline-flex align-items-center justify-content-center fs-4'>
                  <i class='bi bi-sun' />
                </div>
                <h4 class='fw-semibold mb-0 text-body-emphasis'>Low Risk</h4>
                <p class='text-body-secondary'>Agents have certainty in payment with our hardened process</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* <div class='container gx-0'>
        <div class='row'>
          <div class='col'>
            <h5>TODO - FAQ - Why you can trust us</h5>
          </div>
        </div>
      </div> */}
    </>
  )
}
export default InfoPage
