import { Button, Col, Form, Row } from 'solid-bootstrap'
import { Show, createSignal } from 'solid-js'
import Loading from '../common/Loading'
import { password, setPassword } from './PasswordSignal'
import { get, post } from '../../services/utils'

const AdminConfigForms = () => {
  const [appConfig, setAppConfig] = createSignal()
  const [authConfig, setAuthConfig] = createSignal()

  const fetchAppConfig = async (potentialPassword) => {
    console.log('potentialPassword', potentialPassword)
    const res = await get('/api/app-config/admin', potentialPassword)
    console.log('fetchAppConfig', res)
    if (!res.error) {
      setPassword(potentialPassword)
      setAppConfig(res)
    }
    return res
  }
  const saveAppConfig = async (newAppConfig) => {
    const res = await post('/api/app-config', newAppConfig, password())
    console.log('saveAppConfig', res, password())
    setAppConfig(res)
  }
  const fetchAuthConfig = async (potentialPassword) => {
    const res = await get('/api/app-auth', potentialPassword)
    console.log('fetchAuthConfig', res)
    if (!res.error) {
      setAuthConfig(res)
    }
    return res
  }

  const handleSaveAdminConfig = (e) => {
    e.preventDefault()
    const brokerPercent = parseFloat(e.target.querySelector('#brokerPercent').value)
    const agentPercent = parseFloat(e.target.querySelector('#agentPercent').value)
    const plexForGoodPercent = parseFloat(e.target.querySelector('#plexForGoodPercent').value)
    const minOrder = parseFloat(e.target.querySelector('#minOrder').value)
    console.log('handleSaveAdminConfig', brokerPercent, agentPercent, plexForGoodPercent)
    saveAppConfig({ brokerPercent, agentPercent, plexForGoodPercent, minOrder })
  }
  const handleSSOAdminLogin = async (e) => {
    e.preventDefault()
    console.log('handleSaveAuthConfig')
    const res = await get('/api/sso/login', password())
    console.log('handleSSOAdminLogin', res)
    window.location.assign(res.loginUrl)
  }
  if (password()) {
    fetchAppConfig(password())
    fetchAuthConfig(password())
  }
  return (
    <>
      <Show when={appConfig()} fallback={<><h3>Admin Config</h3><div class='col-2'><Loading /></div></>}>
        <h3>App Config</h3>
        {/* <p>{JSON.stringify(appConfig())}</p> */}

        <Form onSubmit={handleSaveAdminConfig}>
          <Form.Group class='mb-3' controlId='brokerPercent' as={Row}>
            <Form.Label column sm={2}>Broker Percent</Form.Label>
            <Col sm={4}>
              <Form.Control type='text' placeholder='Agent Percent' value={appConfig().brokerPercent} />
            </Col>
          </Form.Group>
          <Form.Group class='mb-3' controlId='agentPercent' as={Row}>
            <Form.Label column sm={2}>Agent Percent</Form.Label>
            <Col sm={4}>
              <Form.Control type='text' placeholder='Agent Percent' value={appConfig().agentPercent} />
            </Col>
          </Form.Group>
          <Form.Group class='mb-3' controlId='plexForGoodPercent' as={Row}>
            <Form.Label column sm={2}>Isk For Good Percent</Form.Label>
            <Col sm={4}>
              <Form.Control type='text' placeholder='Agent Percent' value={appConfig().plexForGoodPercent} />
            </Col>
          </Form.Group>
          <Form.Group class='mb-3' controlId='minOrder' as={Row}>
            <Form.Label column sm={2}>Minimum Order</Form.Label>
            <Col sm={4}>
              <Form.Control type='text' placeholder='Agent Percent' value={appConfig().minOrder} />
            </Col>
          </Form.Group>
          <Form.Group class='mb-3' controlId='plexForGoodCharacterID' as={Row}>
            <Form.Label column sm={2}>Plex For Good Character ID</Form.Label>
            <Col sm={4}>
              <Form.Control type='text' placeholder='plexForGoodCharacterID' value={appConfig().plexForGoodCharacterID} />
            </Col>
          </Form.Group>
          <Form.Group class='mb-3' controlId='formBasicPassword' as={Row}>
            <Col sm={{ span: 2, offset: 4 }}>
              <Button variant='primary' type='submit' class='w-100'>Save Admin Config</Button>
            </Col>
          </Form.Group>
        </Form>
      </Show>

      <Show when={authConfig()} fallback={<><h3>Auth Config</h3><div class='col-2'><Loading /></div></>}>
        <h3>Auth Config</h3>
        {/* <p>{JSON.stringify(authConfig())}</p> */}
        <Form onSubmit={handleSSOAdminLogin}>
          <Form.Group class='mb-3' controlId='characterID' as={Row}>
            <Form.Label column sm={2}>Character ID</Form.Label>
            <Col sm={4}>
              <Form.Control type='text' placeholder='Agent Percent' value={authConfig().characterID} disabled />
            </Col>
          </Form.Group>
          <Form.Group class='mb-3' controlId='characterName' as={Row}>
            <Form.Label column sm={2}>Character Name</Form.Label>
            <Col sm={4}>
              <Form.Control type='text' placeholder='Agent Percent' value={authConfig().characterName} disabled />
            </Col>
          </Form.Group>
          <Form.Group class='mb-3' controlId='corpID' as={Row}>
            <Form.Label column sm={2}>Corp ID</Form.Label>
            <Col sm={4}>
              <Form.Control type='text' placeholder='Agent Percent' value={authConfig().corpID} disabled />
            </Col>
          </Form.Group>
          <Form.Group class='mb-3' controlId='corpName' as={Row}>
            <Form.Label column sm={2}>Corp Name</Form.Label>
            <Col sm={4}>
              <Form.Control type='text' placeholder='Agent Percent' value={authConfig().corpName} disabled />
            </Col>
          </Form.Group>
          <Form.Group class='mb-3' controlId='accessToken' as={Row}>
            <Form.Label column sm={2}>Access Token</Form.Label>
            <Col sm={4}>
              <Form.Control type='text' placeholder='Agent Percent' value={authConfig().accessToken} disabled />
            </Col>
          </Form.Group>
          <Form.Group class='mb-3' controlId='refreshToken' as={Row}>
            <Form.Label column sm={2}>Refresh Token</Form.Label>
            <Col sm={4}>
              <Form.Control type='text' placeholder='Agent Percent' value={authConfig().refreshToken} disabled />
            </Col>
          </Form.Group>
          <Form.Group class='mb-3' controlId='formBasicPassword' as={Row}>
            <Col sm={{ span: 2, offset: 2 }}>
              <Button variant='outline-primary' type='submit' class='w-100 button-outline-primary'>SSO Auth Config</Button>
            </Col>
            <Col sm={{ span: 2 }}>
              <Button variant='primary' type='button' class='w-100' onclick={() => get('/api/admin-task', password())}>Trigger Admin Function</Button>
            </Col>
          </Form.Group>
        </Form>
      </Show>
    </>
  )
}
export default AdminConfigForms
