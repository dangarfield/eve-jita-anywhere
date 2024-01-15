import { Spinner } from 'solid-bootstrap'

const Loading = (props) => {
  return (
    <div classList={{ [props.class ?? '']: true }}>
      <div class='container'>
        <div class='row justify-content-center align-items-center h-100'>
          <div class='col-auto'>
            <Spinner animation='border' />
          </div>
        </div>
      </div>
    </div>
  )
}
export default Loading
