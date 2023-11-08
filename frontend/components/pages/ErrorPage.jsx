const ErrorPage = (props) => {
  return (
    <div class='container d-flex justify-content-center align-items-center' style='min-height: 100vh;'>
      <div class='text-center'>
        {props.error}
      </div>
    </div>
  )
}
export default ErrorPage
