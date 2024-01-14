const EveTypeIcon = (props) => {
  if (props.type.skin_id) {
    return (
      // <img class='width-32' src={`/generated-icons/s-${props.type.skin_id}.png`} />
      <img class='width-32' src={`https://everef.net/img/Icons/UI/SKINIcons/${props.type.skin_id}.png`} /> // Note: Not all skins are available here
    )
  } else {
    return (
      <img src={`https://images.evetech.net/types/${props.type.type_id}/${props.type.name.includes('Blueprint') || props.type.name.includes('Reaction Formula') ? 'bp' : 'icon'}`} class='width-32' />
    )
  }
}
export default EveTypeIcon
