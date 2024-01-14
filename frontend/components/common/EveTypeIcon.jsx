const EveTypeIcon = (props) => {
  // console.log('EveTypeIcon', props)
  if (props.type.skin_material_id) {
    return (
      <img class='width-32' src={`/generated-icons/skin-${props.type.skin_material_id}.png`} />
    )
  } else {
    return (
      <img src={`https://images.evetech.net/types/${props.type.type_id}/${props.type.name.includes('Blueprint') || props.type.name.includes('Reaction Formula') ? 'bp' : 'icon'}`} class='width-32' />
    )
  }
}
export default EveTypeIcon
