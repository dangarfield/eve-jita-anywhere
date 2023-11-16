import { Show, createMemo, createResource } from 'solid-js'
import { getAdmin } from '../../services/utils'
import { SimpleTable } from 'solid-simple-table'
import Loading from '../common/Loading'
import '../common/SimpleTable.css'
import CountdownTimer from '../common/CountdownTimer'

const AdminJournal = () => {
  const fetchJournal = async () => {
    const journal = await getAdmin('/api/journal')
    for (const j of journal.journal.data) {
      j.date = new Date(j.date).toLocaleString()
    }
    return journal
  }
  const [journal] = createResource(fetchJournal)

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
  //   const newDate = new Date(originalDate);
  // newDate.setHours(newDate.getHours() + 1);

  const targetDate = createMemo(() => {
    if (journal()) {
      const newDate = new Date(journal().lastModified)
      newDate.setHours(newDate.getHours() + 1)
      return newDate
    }
    return null
  })

  return (
    <>
      <Show when={journal()} fallback={<Loading />}>
        <p>
          Next refresh in: <code><CountdownTimer targetDate={targetDate()} /></code>
        </p>
        <SimpleTable rows={journal().journal.data} columns={columns} className='table table-hover table-striped table-dark' />
      </Show>

    </>

  )
}
export default AdminJournal
