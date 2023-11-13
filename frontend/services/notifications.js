import PubNub from 'pubnub'
import { createSignal } from 'solid-js'
import toast from 'solid-toast'
const { VITE_PUBNUB_SUBSCRIBE_KEY } = import.meta.env

export const [connectedUsers, setConnectedUsers] = createSignal(null)

// Should really use the useUser store, but it seems like too much hassle, maybe try later

const user = window.localStorage.getItem('jita-anywhere-user')
if (user) {
  const uuid = JSON.parse(user).character_id
  const pubnubConfig = {
  //   publishKey: publishKey,
    subscribeKey: VITE_PUBNUB_SUBSCRIBE_KEY,
    uuid
  }

  const pubnubInstance = new PubNub(pubnubConfig)
  pubnubInstance.subscribe({
    channels: ['orders'],
    withPresence: true // Enable presence to get user count
  })
  pubnubInstance.addListener({
    message: function (message) {
    // Log the received message to the console
      console.log('Received message:', message)
      if (message.message.text) {
        toast.success(message.message.text)
      }
    },
    presence: function (presence) {
      console.log('Presence event:', presence)
      setConnectedUsers(presence.occupancy)
      // toast.success('Presence')
    },
    signal: function (signal) {
      console.log('Signal event:', signal)
    },
    status: function (status) {
      console.log('Status event:', status)
    }

  })
  console.log('connected to pubnub', uuid)
}
