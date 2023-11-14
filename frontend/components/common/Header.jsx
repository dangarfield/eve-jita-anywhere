import { A } from '@solidjs/router'
import { Button, Image, Nav, NavDropdown, Navbar } from 'solid-bootstrap'
import { useUser } from '../../stores/UserProvider'
import { Show } from 'solid-js'
import { connectedUsers } from '../../services/notifications'

const Header = () => {
  const [user, { beginLoginProcess, logout, characterID, characterName, isLoggedIn }] = useUser()

  const handleLogout = (e) => {
    e.preventDefault()
    logout()
  }
  return (
    <Navbar collapseOnSelect expand='lg' bg='dark' variant='dark'>
      <div class='container-fluid px-0'>
        <A href='/' class='navbar-brand'>Jita Anywhere</A>
        <Navbar.Toggle aria-controls='responsive-navbar-nav' />
        <Navbar.Collapse id='responsive-navbar-nav'>
          <Nav class='me-auto'>
            <A href='/info' class='nav-link' activeClass='active'>Info</A>
            <A href='/shop' class='nav-link' activeClass='active'>Shop</A>
            <Show when={isLoggedIn()}>
              <A href='/my-balance' class='nav-link' activeClass='active'>My Balance</A>
              <A href='/my-orders' class='nav-link' activeClass='active'>My Orders</A>
            </Show>
          </Nav>
          <Nav>

            <Show when={isLoggedIn()}>
              <A href='/my-jobs' class='nav-link position-relative me-2' activeClass='active'>
                My Jobs
              </A>
            </Show>
            <A href='/available-jobs' class='nav-link position-relative me-2' activeClass='active'>
              Available Jobs
            </A>
            <div class='navbar-text position-relative me-2' activeClass='active' title={`${connectedUsers()} users online`}>
              Agents Online
              <span class='position-absolute top-75 start-100 translate-middle badge rounded-pill bg-primary'>
                {connectedUsers() !== 0 ? connectedUsers() : ''}
              </span>
            </div>
            <Show when={isLoggedIn()} fallback={<Button class='nav-link' variant='' onClick={beginLoginProcess}><Image src='https://web.ccpgamescdn.com/eveonlineassets/developers/eve-sso-login-white-small.png' /></Button>}>

              <NavDropdown
                title={
                  <>
                    <img src={`https://image.eveonline.com/Character/${characterID()}_32.jpg`} class='rounded width-32' />
                    <span class='ps-2 text-light'>{characterName}</span>
                  </>
              }
                id='collasible-nav-dropdown'
              >
                <A href='/logout' class='dropdown-item' onclick={handleLogout}>Logout</A>
              </NavDropdown>
            </Show>
          </Nav>
        </Navbar.Collapse>
      </div>
    </Navbar>

  )
}
export default Header
