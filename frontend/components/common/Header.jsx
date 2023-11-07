import { Image, Nav, Navbar } from 'solid-bootstrap'

const Header = () => {
  return (
    <Navbar collapseOnSelect expand='lg' bg='dark' variant='dark'>
      <div class='container-fluid px-0'>
        <Navbar.Brand href='/'>Jita Anywhere</Navbar.Brand>
        <Navbar.Toggle aria-controls='responsive-navbar-nav' />
        <Navbar.Collapse id='responsive-navbar-nav'>
          <Nav class='me-auto'>
            <Nav.Link href='/info'>Info</Nav.Link>
            <Nav.Link href='/shop'>Shop</Nav.Link>
            <Nav.Link href='/agents'>Agents</Nav.Link>
            {/* <NavDropdown title='Dropdown' id='collasible-nav-dropdown'>
              <NavDropdown.Item href='#action/3.1'>Action</NavDropdown.Item>
              <NavDropdown.Item href='#action/3.2'>Another action</NavDropdown.Item>
              <NavDropdown.Item href='#action/3.3'>Something</NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item href='#action/3.4'>Separated link</NavDropdown.Item>
            </NavDropdown> */}
          </Nav>
          <Nav>
            <Nav.Link href='/login'><Image src='https://web.ccpgamescdn.com/eveonlineassets/developers/eve-sso-login-white-small.png' /></Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </div>
    </Navbar>

  )
}
export default Header
