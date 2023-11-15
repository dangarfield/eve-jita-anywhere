import { updatePaymentsFromCorpJournal } from '../app/payments.js'

const executeJob = async () => {
  await updatePaymentsFromCorpJournal()
}
executeJob()
