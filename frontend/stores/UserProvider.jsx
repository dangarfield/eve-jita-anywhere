import { createContext, createEffect, createMemo, createSignal, useContext } from 'solid-js'
import { createStore } from 'solid-js/store'
import { refreshTokenAndGetNewUserAccessToken, triggerLoginFlow } from '../services/auth'
import { getUserBalance } from '../services/ja-api'

const UserContext = createContext()
const localUser = window.localStorage.getItem('jita-anywhere-user')
// console.log('localUser', localUser, '----', localUser ? JSON.parse(localUser) : null)
const [user, setUser] = createStore(localUser ? JSON.parse(localUser) : null)

export const ensureAccessTokenIsValid = async () => {
  if (user && user.access_token) {
    const isExpired = (new Date().getTime() / 1000) > user.payload.exp
    if (isExpired) {
      const accessToken = await refreshTokenAndGetNewUserAccessToken(user, setUser)
      return accessToken
    } else {
      return user.access_token
    }
  }
  return null
}
export function UserProvider (props) {
  const [userBalance, setUserBalance] = createSignal(null)

  createEffect(() => {
    console.log('createEffect UserProvider', user)
    if (user.access_token) {
      window.localStorage.setItem('jita-anywhere-user', JSON.stringify(user))
    } else {
      window.localStorage.removeItem('jita-anywhere-user')
    }

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
          balance.characterName = characterName
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
        window.localStorage.removeItem('jita-anywhere-basket')
        setUser(null)
        console.log('logout', user)
        window.location.reload() // For some reason setUser above does not actually clear the user
      },
      characterID,
      characterName,
      isLoggedIn,
      triggerDataUpdate,
      userBalance,
      ensureAccessTokenIsValid
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
