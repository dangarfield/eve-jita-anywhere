import ShopPage from './components/shop/ShopPage'
import { StaticDataProvider } from './stores/StaticDataProvider'
import { BasketProvider } from './stores/BasketProvider'

import { Navigate, Route, Router, Routes } from '@solidjs/router'
import InfoPage from './components/pages/InfoPage'
import AvailableJobsPage from './components/agents/AvailableJobsPage'
import { UserProvider } from './stores/UserProvider'
import SSOReturnPage from './components/pages/SSOReturnPage'
import MyOrdersPage from './components/pages/MyOrdersPage'
import NotFoundPage from './components/pages/NotFoundPage'
import AdminPage from './components/admin/AdminPage'
import AdminConfigForms from './components/admin/AdminConfigForms'
import AdminJournal from './components/admin/AdminJournal'
import AdminBalances from './components/admin/AdminBalances'
import MyBalancePage from './components/pages/MyBalancePage'
import InfoModal from './components/common/InfoModal'
import './services/notifications'
import { Toaster } from 'solid-toast'
import MyJobsPage from './components/agents/MyJobsPage'
import Header from './components/common/Header'

function App () {
  return (
    <StaticDataProvider>
      <BasketProvider>
        <UserProvider>
          <Router>
            <div class='container-fluid'>
              <div class='row'>
                <div class='col'>
                  <Header />
                </div>
              </div>

              <Routes>
                {/* <Route path='/' component={HomePage} /> */}
                <Route path='/' element={<Navigate href='/shop' />} />
                <Route path='/info' component={InfoPage} />
                <Route path='/shop' component={ShopPage} />
                <Route path='/available-jobs' component={AvailableJobsPage} />
                <Route path='/my-jobs' component={MyJobsPage} />
                <Route path='/my-balance' component={MyBalancePage} />
                <Route path='/my-orders' component={MyOrdersPage} />
                <Route path='/sso-return' component={SSOReturnPage} />
                <Route path='/admin' component={AdminPage}>
                  <Route path='/' component={AdminConfigForms} />
                  <Route path='/journal' component={AdminJournal} />
                  <Route path='/balances' component={AdminBalances} />
                </Route>
                <Route path='*' component={NotFoundPage} />
              </Routes>

              <InfoModal />
              <Toaster />
            </div>
          </Router>
        </UserProvider>
      </BasketProvider>
    </StaticDataProvider>
  )
}

export default App
