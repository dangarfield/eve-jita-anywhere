import { createContext, createEffect, createMemo, createSignal, useContext } from 'solid-js'
import { createStore } from 'solid-js/store'
import { refreshTokenAndGetNewUserAccessToken, triggerLoginFlow } from '../services/auth'
import { getUserBalance } from '../services/ja-api'

const UserContext = createContext()

export function UserProvider (props) {
  const localUser = window.localStorage.getItem('jita-anywhere-user')
  const [user, setUser] = createStore(localUser ? JSON.parse(localUser) : null)
  const [userBalance, setUserBalance] = createSignal(null)

  createEffect(() => {
    console.log('createEffect UserProvider')
    window.localStorage.setItem('jita-anywhere-user', JSON.stringify(user))
    triggerDataUpdate()
  })

  const triggerDataUpdate = () => {
    if (user && user.access_token) {
      const isExpired = (new Date().getTime() / 1000) > user.payload.exp
      console.log('isExpired', isExpired)
      if (isExpired) {
        refreshTokenAndGetNewUserAccessToken(user, setUser) // Hopefully this should trigger another createEffect, but it does ensure refresh tokens
      } else {
        getUserBalance(user, setUser).then((balance) => {
          console.log('userBalance', balance)
          setUserBalance(balance)
        })
      }
    }
  }

  const characterID = createMemo(() => user?.character_id)
  const characterName = createMemo(() => user?.payload?.name)
  const isLoggedIn = createMemo(() => !!user.character_id)

  // console.log('localUser', localUser, user, characterID(), characterName())
  const userStore = [
    user,
    {
      beginLoginProcess () {
        triggerLoginFlow()
      },
      logout () {
        window.localStorage.removeItem('jita-anywhere-user')
        setUser(null)
        console.log('logout', user)
        window.location.reload() // For some reason setUser above does not actually clear the user
      },
      characterID,
      characterName,
      isLoggedIn,
      triggerDataUpdate,
      userBalance
    }
  ]

  return (
    <UserContext.Provider value={userStore}>
      {props.children}
    </UserContext.Provider>
  )
}

export function useUser () {
  return useContext(UserContext)
}
