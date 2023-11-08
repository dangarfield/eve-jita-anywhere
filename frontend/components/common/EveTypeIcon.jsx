const EveTypeIcon = (props) => {
  return (
    <img src={`https://images.evetech.net/types/${props.type.type_id}/${props.type.name.includes('Blueprint') || props.type.name.includes('Reaction Formula') ? 'bp' : 'icon'}`} class='width-32' />
  )
}
export default EveTypeIcon
