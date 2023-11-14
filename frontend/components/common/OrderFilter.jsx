import { For } from 'solid-js'
import { Form } from 'solid-bootstrap'

const OrderFilter = (props) => {
  const { filters, setFilters } = props

  const handleStatusChange = (statusName) => {
    setFilters((prevFilters) => {
      const updatedStatusFilters = prevFilters.status.map((status) => {
        if (status.name === statusName) {
          return { ...status, active: !status.active }
        }
        return status
      })
      return { ...prevFilters, status: updatedStatusFilters }
    })
  }

  const handleDeliveryChange = (deliveryName) => {
    setFilters((prevFilters) => {
      const updatedDeliveryFilters = prevFilters.delivery.map((delivery) => {
        if (delivery.name === deliveryName) {
          return { ...delivery, active: !delivery.active }
        }
        return delivery
      })
      return { ...prevFilters, delivery: updatedDeliveryFilters }
    })
  }

  return (
    <div>
      <h3>Filter Status</h3>
      <For each={filters().status}>
        {(status) =>
          <Form.Check
            type='checkbox'
            id={`status-filter-${status.name}`}
            label={`${status.name.replace('_', ' ')}`}
            key={`status-filter-${status.name}`}
            checked={status.active}
            onChange={() => handleStatusChange(status.name)}
          />}
      </For>

      <h3 class='mt-3'>Filter Delivery</h3>
      <For each={filters().delivery}>
        {(delivery) =>
          <Form.Check
            type='checkbox'
            id={`delivery-filter-${delivery.name}`}
            label={`${delivery.name}`}
            key={`delivery-filter-${delivery.name}`}
            checked={delivery.active}
            onChange={() => handleDeliveryChange(delivery.name)}
            class='text-uppercase'
          />}
      </For>
    </div>
  )
}

export default OrderFilter
