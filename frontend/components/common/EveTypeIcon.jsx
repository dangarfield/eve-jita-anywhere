const EveTypeIcon = (props) => {
  if (props.type.name.includes('SKIN')) {
    return (
      <img class='width-32' src='/generated-icons/21481.png' /> // Eg, A question mark. Leave this like this for now
    )
  } else {
    return (
      <img src={`https://images.evetech.net/types/${props.type.type_id}/${props.type.name.includes('Blueprint') || props.type.name.includes('Reaction Formula') ? 'bp' : 'icon'}`} class='width-32' />
    )
  }
}
export default EveTypeIcon
