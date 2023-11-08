import { createContext, createEffect, createMemo, useContext } from 'solid-js'
import { createStore } from 'solid-js/store'
import { triggerLoginFlow } from '../services/auth'

const UserContext = createContext()

export function UserProvider (props) {
  const localUser = window.localStorage.getItem('jita-anywhere-user')
  const [user, setUser] = createStore(localUser ? JSON.parse(localUser) : null)
  // const [user, setUser] = createStore(null)
  createEffect(() => {
    console.log('createEffect user', user)
    window.localStorage.setItem('jita-anywhere-user', JSON.stringify(user))
  })

  const characterID = createMemo(() => user?.character_id)
  const characterName = createMemo(() => user?.payload?.name)
  const isLoggedIn = createMemo(() => !!user.character_id)

  console.log('localUser', localUser, user, characterID(), characterName())
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
      isLoggedIn
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
