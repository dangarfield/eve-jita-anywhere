import logo from '../../assets/logo.svg'

const Footer = () => {
  return (
    <footer>
      <nav class='navbarasd sticky-bottom text-center border-top'>
        <div class='d-flex justify-content-center flex-row'>
          <div class='p-3'>
            <img src={logo} class='align-text-top' height='18px' />
            <span>Jita Anywhere</span> -
            Made by <a href='https://github.com/dangarfield/eve-jita-anywhere' target='_blank' rel='noreferrer'>Dan Garfield</a>
          </div>
        </div>
      </nav>
    </footer>
  )
}
export default Footer
