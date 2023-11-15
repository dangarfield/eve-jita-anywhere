import { updatePaymentsFromCorpJournal } from '../app/payments.js'

const executeJob = async () => {
  await updatePaymentsFromCorpJournal()
  process.exit()
}
executeJob()
