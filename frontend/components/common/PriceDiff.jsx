const PriceDiff = (props) => {
  const { old, new: newValue, class: additionalClasses } = props

  let icon, textClass

  // Determine the appropriate icon and text class based on the comparison of old and new values
  if (newValue > old) {
    icon = <i class='bi bi-caret-up-fill' />
    textClass = 'text-danger'
  } else if (newValue === old) {
    icon = <i class='bi bi-caret-left-fill' />
    textClass = 'text-primary'
  } else {
    icon = <i class='bi bi-caret-down-fill' />
    textClass = 'text-success'
  }

  console.log('Price diff', old, newValue)
  return (
    <span class={`price-component ${additionalClasses} ${textClass}`}>
      {newValue.toLocaleString()} ISK {icon}
    </span>
  )
}
export default PriceDiff
