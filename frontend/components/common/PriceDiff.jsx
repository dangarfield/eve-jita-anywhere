const PriceDiff = (props) => {
  const { old, new: newValue, class: additionalClasses } = props
  let icon, textClass
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
  return (
    <span class={`price-component ${additionalClasses} ${textClass}`}>
      {newValue.toLocaleString()} ISK {icon}
    </span>
  )
}
export default PriceDiff
