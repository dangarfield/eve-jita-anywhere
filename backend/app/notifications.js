import PubNub from 'pubnub'

export const sendOnSiteNotification = async (channel, text) => {
  console.log('sendOnSiteNotification START', channel, text)
  try {
    const pubnub = new PubNub({
      subscribeKey: process.env.PUBNUB_SUBSCRIBE_KEY,
      publishKey: process.env.PUBNUB_PUBLISH_KEY,
      uuid: 'server'
    })
    const response = await pubnub.publish({ channel, message: { text } })
    console.log('sendOnSiteNotification response', response)
  } catch (error) {
    console.log('sendOnSiteNotification error', error)
  }
  console.log('sendOnSiteNotification END')
}
