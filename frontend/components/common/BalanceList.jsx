import { Badge, ListGroup } from 'solid-bootstrap'
import { For } from 'solid-js'

const BalanceList = (props) => {
  return (
    <ListGroup class='mb-3'>
      <ListGroup.Item variant='light'>
        <div class='w-100 d-flex flex-row align-items-justify' data-character-id={props.userBalance.characterID}>
          <h3>{props.userBalance.characterName}</h3>
          <Badge class='ms-auto fs-4'>{props.userBalance.balance.toLocaleString()} ISK</Badge>
        </div>
      </ListGroup.Item>
      <For each={props.userBalance.entries}>
        {(entry) =>
          <ListGroup.Item>
            {/* <div class='w-100 d-flex flex-row justify-content-between'> */}
            <div class='row'>
              <p class='col-5'>{`${new Date(entry.date).toLocaleDateString()} ${new Date(entry.date).toLocaleTimeString()}`}</p>
              <p class='col text-uppercase'>{entry.type.replace(/_/g, ' ')}</p>
              <p class='col text-end'>{entry.amount.toLocaleString()} ISK</p>
            </div>
          </ListGroup.Item>}
      </For>
    </ListGroup>
  )
}
export default BalanceList
