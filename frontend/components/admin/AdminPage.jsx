import { Show, createEffect } from 'solid-js'
import Header from '../common/Header'
import { Button, Form } from 'solid-bootstrap'
import { A, Outlet } from '@solidjs/router'
import { password, setPassword } from './PasswordSignal'
import { get } from '../../services/utils'

const AdminPage = () => {
  createEffect(() => {
    if (password()) {
      console.log('Password is set')
      window.localStorage.setItem('jita-anywhere-password', password())
    }
  })

  const handleEnterPassword = async (e) => {
    e.preventDefault()
    const potentialPassword = e.target.querySelector('[type="password"]').value
    console.log('potentialPassword', potentialPassword)
    const res = await get('/api/app-config/admin', potentialPassword)
    console.log('fetchAppConfig', res)
    if (!res.error) {
      setPassword(potentialPassword)
    }
  }
  return (
    <div class='container-fluid'>
      <div class='row'>
        <div class='col'>
          <Header />
        </div>
      </div>
      <div class='row'>
        <div class='col'>
          <Show
            when={password()} fallback={
              <Form onSubmit={handleEnterPassword}>
                <Form.Group class='mb-3' controlId='formBasicPassword'>
                  <Form.Label>Password</Form.Label>
                  <Form.Control type='password' placeholder='Password' value={password()} />
                </Form.Group>
                <Button variant='primary' type='submit'>Login</Button>
              </Form>
          }
          >
            <ul role='tablist' class='mb-3 nav nav-underline' data-active-key='browse'>
              <li role='presentation' class='nav-item'>
                <A href='/admin' class='nav-link' activeClass='active' end>App Config</A>
              </li>
              <li role='presentation' class='nav-item'>
                <A href='/admin/journal' class='nav-link' activeClass='active'>Journal</A>
              </li>
              <li role='presentation' class='nav-item'>
                <A href='/admin/balances' class='nav-link' activeClass='active'>Balances</A>
              </li>
            </ul>
            <Outlet />
          </Show>
        </div>
      </div>
    </div>
  )
}
export default AdminPage
