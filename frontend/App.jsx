// import styles from './App.module.css'
// import TodoList from './components/todos/TodoList'
// import { createSignal } from 'solid-js'
// import TodosCompleted from './components/todos/TodosCompleted'
// import Nav from './components/todos/Nav'
// import { TodosProvider } from './TodosProvider'
// import Header from './components/common/Header'
import ShopPage from './components/shop/ShopPage'
import { StaticDataProvider } from './stores/StaticDataProvider'
import { BasketProvider } from './stores/BasketProvider'

import { Navigate, Route, Router, Routes } from '@solidjs/router' // 👈 Import the router
// import HomePage from './components/pages/HomePage'
import InfoPage from './components/pages/InfoPage'
import AgentsPage from './components/agents/AgentsPage'
import { UserProvider } from './stores/UserProvider'
import SSOReturnPage from './components/pages/SSOReturnPage'
import SettingsPage from './components/pages/SettingsPage'
import MyOrdersPage from './components/pages/MyOrdersPage'
import NotFoundPage from './components/pages/NotFoundPage'
import AdminPage from './components/admin/AdminPage'
import AdminConfigForms from './components/admin/AdminConfigForms'
import AdminJournal from './components/admin/AdminJournal'
import AdminBalances from './components/admin/AdminBalances'

// const AllTodos = () => {
//   return (
//     <section>
//       <TodoList />
//       <TodosCompleted />
//     </section>
//   )
// }

function App () {
  // const [viewSelected, setViewSelected] = createSignal('all')
  // const defaultTodos = {
  //   items: [
  //     { text: 'Finish SolidJS demo', completed: false },
  //     { text: 'Write blog post about SolidJS', completed: false }
  //   ]
  // }

  // return (
  //   <TodosProvider todoItems={defaultTodos}>
  //     <div class={styles.App}>
  //       <Nav setView={setViewSelected} view={viewSelected} />
  //       <Switch fallback={<AllTodos />}>
  //         <Match when={viewSelected() === "to do"}>
  //           <TodoList />
  //         </Match>
  //         <Match when={viewSelected() === "completed"}>
  //           <TodosCompleted />
  //         </Match>
  //       </Switch>
  //     </div>
  //   </TodosProvider>
  // );\
  return (
    <StaticDataProvider>
      <BasketProvider>
        <UserProvider>
          <Router>
            <Routes>
              {/* <Route path='/' component={HomePage} /> */}
              <Route path='/' element={<Navigate href='/shop' />} />
              <Route path='/info' component={InfoPage} />
              <Route path='/shop' component={ShopPage} />
              <Route path='/agents' component={AgentsPage} />
              <Route path='/settings' component={SettingsPage} />
              <Route path='/my-orders' component={MyOrdersPage} />
              <Route path='/sso-return' component={SSOReturnPage} />
              <Route path='/admin' component={AdminPage}>
                <Route path='/' component={AdminConfigForms} />
                <Route path='/journal' component={AdminJournal} />
                <Route path='/balances' component={AdminBalances} />
              </Route>
              <Route path='*' component={NotFoundPage} />
            </Routes>
          </Router>
        </UserProvider>
      </BasketProvider>
    </StaticDataProvider>
  )
}

export default App
