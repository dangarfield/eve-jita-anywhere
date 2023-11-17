import { For, Match, Show, Switch, createSignal } from 'solid-js'
import CharacterCountTextarea from './CharacterCountTextarea'
import { Button } from 'solid-bootstrap'
import Loading from './Loading'

const DisputeContent = ({ disputes, savingDisputeComments, handleAddDisputeCallback, userType }) => {
  const [disputeComment, setDisputeComment] = createSignal('')
  const handleSaveClick = async () => {
    const comment = disputeComment()
    if (comment.length > 0) {
      handleAddDisputeCallback(comment)
    }
    setDisputeComment('')
  }
  return (
    <>
      <For
        each={disputes}
        fallback={<div role='alert' class='alert alert-secondary border-secondary text-light text-center mt-1 fade show'>No dispute history</div>}
      >
        {(dispute) =>

          <Switch>
            <Match when={dispute.user === 'user'}>
              <div class='d-flex col-11 gap-2 mb-3'>
                <div class='pe'><i class='bi bi-person-fill' /></div>
                <div class='px-2 rounded text-break border border-success pre-line'>{dispute.comment}</div>
              </div>

            </Match>
            <Match when={dispute.user === 'agent'}>
              <div class='d-flex col-11 offset-1 justify-content-end gap-2 mb-3'>
                <div class='px-2 rounded text-break border border-primary pre-line'>{dispute.comment}</div>
                <div class='pe'><i class='bi bi-headset' /></div>
              </div>
            </Match>
            <Match when={dispute.user === 'admin'}>
              <div class='d-flex col-11 gap-2 mb-3'>
                <div class='pe'><i class='bi bi-exclamation-triangle-fill' /></div>
                <div class='px-2 rounded text-break border border-danger pre-line'>{dispute.comment}</div>
              </div>
            </Match>
          </Switch>}
      </For>
      <Show when={savingDisputeComments()}>
        <Loading />
      </Show>
      <CharacterCountTextarea
        controlId='dispute-add'
        label='Enter your comments'
        placeholder='Enter your comments'
        style={{ height: '120px' }}
        maxlength={200}
        value={disputeComment}
        setDisputeComment={setDisputeComment}
      />
      <Button class='w-100' onClick={handleSaveClick} disabled={savingDisputeComments()}>
        Add comment
      </Button>
    </>
  )
}

export default DisputeContent
