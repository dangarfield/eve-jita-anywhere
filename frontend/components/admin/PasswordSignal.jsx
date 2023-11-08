import { createSignal } from 'solid-js'
const localPassword = window.localStorage.getItem('jita-anywhere-password')
export const [password, setPassword] = createSignal(localPassword || undefined)
