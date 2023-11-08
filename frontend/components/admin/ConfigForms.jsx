import { Button, Col, Form, Row } from 'solid-bootstrap'
import { Show, createSignal } from 'solid-js'
import Loading from '../common/Loading'
import { password, setPassword } from './PasswordSignal'

const ConfigForms = () => {
  const [appConfig, setAppConfig] = createSignal()
  const [authConfig, setAuthConfig] = createSignal()

  const fetchAppConfig = async (potentialPassword) => {
    console.log('potentialPassword', potentialPassword)
    const req = await window.fetch('/api/app-config/admin', {
      method: 'GET',
      headers: {
        Accept: 'application/json, text/plain, */*',
        'Content-Type': 'application/json',
        Authorization: potentialPassword
      }
    })
    const res = await req.json()
    console.log('fetchAppConfig', res)
    if (!res.error) {
      setPassword(potentialPassword)
      setAppConfig(res)
    }
    return res
  }
  const saveAppConfig = async (newAppConfig) => {
    const req = await window.fetch('/api/app-config', {
      method: 'POST',
      headers: {
        Accept: 'application/json, text/plain, */*',
        'Content-Type': 'application/json',
        Authorization: password()
      },
      body: JSON.stringify(newAppConfig)
    })
    const res = await req.json()
    console.log('saveAppConfig', res, password())
    setAppConfig(res)
  }
  const fetchAuthConfig = async (potentialPassword) => {
    const req = await window.fetch('/api/app-auth', {
      method: 'GET',
      headers: {
        Accept: 'application/json, text/plain, */*',
        'Content-Type': 'application/json',
        Authorization: potentialPassword
      }
    })
    const res = await req.json()
    console.log('fetchAuthConfig', res)
    if (!res.error) {
      setAuthConfig(res)
    }
    return res
  }

  const handleSaveAdminConfig = (e) => {
    e.preventDefault()
    const agentPercent = parseFloat(e.target.querySelector('#agentPercent').value)
    const iskForGoodPercent = parseFloat(e.target.querySelector('#iskForGoodPercent').value)
    console.log('handleSaveAdminConfig', agentPercent, iskForGoodPercent)
    saveAppConfig({ agentPercent, iskForGoodPercent })
  }
  const handleSSOAdminLogin = async (e) => {
    e.preventDefault()
    console.log('handleSaveAuthConfig')
    const req = await window.fetch('/api/sso/login', {
      method: 'GET',
      headers: {
        Accept: 'application/json, text/plain, */*',
        'Content-Type': 'application/json',
        Authorization: password()
      }
    })
    const res = await req.json()
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
          <Form.Group class='mb-3' controlId='agentPercent' as={Row}>
            <Form.Label column sm={2}>Agent Percent</Form.Label>
            <Col sm={4}>
              <Form.Control type='text' placeholder='Agent Percent' value={appConfig().agentPercent} />
            </Col>
          </Form.Group>
          <Form.Group class='mb-3' controlId='iskForGoodPercent' as={Row}>
            <Form.Label column sm={2}>Isk For Good Percent</Form.Label>
            <Col sm={4}>
              <Form.Control type='text' placeholder='Agent Percent' value={appConfig().iskForGoodPercent} />
            </Col>
          </Form.Group>
          <Form.Group class='mb-3' controlId='formBasicPassword' as={Row}>
            <Col sm={{ span: 4, offset: 2 }}>
              <Button variant='primary' type='submit'>Save Admin Config</Button>
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
            <Col sm={{ span: 4, offset: 2 }}>
              <Button variant='primary' type='submit'>SSO Auth Config</Button>
            </Col>
          </Form.Group>
        </Form>
      </Show>
    </>
  )
}
export default ConfigForms
