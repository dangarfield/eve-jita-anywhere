import { Show, createResource } from 'solid-js'
import { getAdmin } from '../../services/utils'
import { SimpleTable } from 'solid-simple-table'
import Loading from '../common/Loading'
import '../common/SimpleTable.css'

const AdminJournal = () => {
  const [journal] = createResource('/api/journal', getAdmin)

  const columns = [
    { id: 'id', label: 'Transaction ID' },
    { id: 'date', label: 'Date' },

    { id: 'first_party_id', label: 'First Party ID' },
    { id: 'second_party_id', label: 'Second Party ID' },

    { id: 'ref_type', label: 'Type' },
    { id: 'description', label: 'Description' },
    { id: 'reason', label: 'Reason' },
    { id: 'amount', label: 'Amount' }
  ]

  return (
    <>
      <Show when={journal()} fallback={<Loading />}>
        {/* <p>{JSON.stringify(journal().journal.data)}</p> */}
        <SimpleTable rows={journal().journal.data} columns={columns} className='table table-hover table-striped table-dark' />
      </Show>

    </>

  )
}
export default AdminJournal
