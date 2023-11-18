import anime from 'animejs'
import { createEffect, onCleanup } from 'solid-js'
import './InfoCarousel.css'

// https://codepen.io/pasqualevitiello/pen/wZrbEL

const InfoCarousel = ({ sliderData }) => {
  const bigDarkRectangle = anime.timeline({
    targets: '.hero-figure-box-05',
    autoplay: false
  })
  createEffect(() => {
    bigDarkRectangle.add({
      duration: 400,
      easing: 'easeInOutExpo',
      scaleX: [0.05, 0.05],
      scaleY: [0, 1],
      perspective: '500px'
    }).add({
      duration: 400,
      easing: 'easeInOutExpo',
      scaleX: 1
    }).add({
      duration: 800,
      rotateY: '-15deg',
      rotateX: '8deg',
      rotateZ: '-1deg'
    })
  })

  const smallDarkRectangles = anime.timeline({
    targets: '.hero-figure-box-06, .hero-figure-box-07',
    autoplay: false
  })
  createEffect(() => {
    smallDarkRectangles.add({
      duration: 400,
      delay: anime.random(0, 200),
      easing: 'easeInOutExpo',
      scaleX: [0.05, 0.05],
      scaleY: [0, 1],
      perspective: '500px'
    }).add({
      duration: 400,
      easing: 'easeInOutExpo',
      scaleX: 1
    }).add({
      duration: 800,
      rotateZ: '20deg'
    })
  })

  // const targets = '.hero-figure-box-01, .hero-figure-box-02, .hero-figure-box-03, .hero-figure-box-04, .hero-figure-box-08, .hero-figure-box-09, .hero-figure-box-10'
  const colouredRectangles = anime.timeline({
    targets: '.hero-figure-box-01, .hero-figure-box-02, .hero-figure-box-04, .hero-figure-box-08, .hero-figure-box-09, .hero-figure-box-10',
    autoplay: false
  })
  createEffect(() => {
    colouredRectangles.add({
      duration: anime.random(600, 800),
      delay: anime.random(600, 800),
      rotate: [anime.random(-360, 360), function (el) { return el.getAttribute('data-rotation') }],
      scale: [0.7, 1],
      opacity: [0, 1],
      easing: 'easeInOutExpo'
    })
  })

  const playAll = () => {
    bigDarkRectangle.play()
    smallDarkRectangles.play()
    colouredRectangles.play()
  }

  createEffect(() => {
    console.log('play', sliderData())
    playAll()
  })

  onCleanup(() => {
    bigDarkRectangle.restart() // Pause the animation during cleanup
    smallDarkRectangles.restart()
    colouredRectangles.restart()
  })

  // createEffect(() => {
  //   return () => {
  //     const subscription = sliderData.subscribe(() => {
  //       playAll() // Execute playAll when the title changes
  //     })

  //     onCleanup(() => {
  //       subscription() // Unsubscribe when the component unmounts
  //     })
  //   }
  // })

  return (
    <section class='hero'>
      <div class='container gx-0'>
        <div class='hero-inner rowZZ'>
          <div class='hero-copy colZZ'>
            <h1 class='mt-0 mb-5'>{sliderData().title}</h1>
            <div class='divider bg-primary mb-5' />
            {sliderData().content}
          </div>
          <div class='hero-figure anime-element colZZ'>
            <svg class='placeholderZZ' width='550' height='400' viewBox='0 0 550 400'>
              <rect width='550' height='400' style='fill:#212529;' />
            </svg>
            <div class='hero-figure-box hero-figure-box-01' data-rotation='45deg' />
            <div class='hero-figure-box hero-figure-box-02' data-rotation='-45deg' />
            {/* <div class='hero-figure-box hero-figure-box-03' data-rotation='0deg' /> */}
            <div class='hero-figure-box hero-figure-box-04' data-rotation='-135deg' />
            <div class={`hero-figure-box hero-figure-box-05 ${sliderData().image}`} />
            <div class='hero-figure-box hero-figure-box-06' />
            <div class='hero-figure-box hero-figure-box-07' />
            <div class='hero-figure-box hero-figure-box-08' data-rotation='-22deg' />
            <div class='hero-figure-box hero-figure-box-09' data-rotation='-52deg' />
            <div class='hero-figure-box hero-figure-box-10' data-rotation='-50deg' />
          </div>
        </div>
      </div>
    </section>
  )
}

export default InfoCarousel
