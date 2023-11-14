import PubNub from 'pubnub'
import { createSignal } from 'solid-js'
import toast from 'solid-toast'
const { VITE_PUBNUB_SUBSCRIBE_KEY } = import.meta.env

export const [connectedUsers, setConnectedUsers] = createSignal(1)

// Should really use the useUser store, but it seems like too much hassle, maybe try later

const user = window.localStorage.getItem('jita-anywhere-user')
if (user) {
  const uuid = JSON.parse(user).character_id
  const pubnubConfig = {
    subscribeKey: VITE_PUBNUB_SUBSCRIBE_KEY,
    uuid
  }

  const pubnubInstance = new PubNub(pubnubConfig)
  pubnubInstance.subscribe({
    channels: ['orders'],
    withPresence: true
  })
  pubnubInstance.addListener({
    message: function (message) {
      console.log('Received message:', message)
      if (message.message.text) {
        toast.success(message.message.text)
      }
    },
    presence: function (presence) {
      console.log('Presence event:', presence)
      setConnectedUsers(Math.max(1, presence.occupancy)) // Page refreshes can mess the join / leave events
    }
  })
  console.log('connected to pubnub', uuid)
}
