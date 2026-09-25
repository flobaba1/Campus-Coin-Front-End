import React, { useEffect } from 'react'
import LandingPage from '../pages/LandingPage'
import SignInPage from '../pages/SignInPage'
import SignUpPage from '../pages/SignUpPage'
import OnboardingPage from '../pages/OnboardingPage'
import ForgotPasswordPage from '../pages/ForgotPasswordPage'
import CheckInboxPage from '../pages/CheckInboxPage'
import ResetPasswordPage from '../pages/ResetPasswordPage'
import PasswordUpdatedPage from '../pages/PasswordUpdatedPage'
import AdminSignInPage from '../pages/AdminSignInPage'
import SitemapPage from '../pages/SitemapPage'
import DashboardPage from '../pages/DashboardPage'
import TransactionsPage from '../pages/TransactionsPage'
import CategoriesPage from '../pages/CategoriesPage'
import MoneyToolsPage from '../pages/MoneyToolsPage'
import AdminConsolePage from '../pages/AdminConsolePage'
import { isAdminAuthenticated, isStudentAuthenticated } from '../utils'

function RequireStudent({ children }) {
  useEffect(() => {
    if (!isStudentAuthenticated()) navigate('/sign-in')
  }, [])
  return isStudentAuthenticated() ? children : null
}

function RequireAdmin({ children }) {
  useEffect(() => {
    if (!isAdminAuthenticated()) navigate('/admin/sign-in')
  }, [])
  return isAdminAuthenticated() ? children : null
}

export const routes = {
  '/': LandingPage,
  '/sign-in': SignInPage,
  '/sign-up': SignUpPage,
  '/onboarding': OnboardingPage,
  '/forgot-password': ForgotPasswordPage,
  '/check-inbox': CheckInboxPage,
  '/reset-password': ResetPasswordPage,
  '/password-updated': PasswordUpdatedPage,
  '/admin/sign-in': AdminSignInPage,
  '/sitemap': SitemapPage,
  '/dashboard': () => <RequireStudent><DashboardPage /></RequireStudent>,
  '/transactions': () => <RequireStudent><TransactionsPage /></RequireStudent>,
  '/categories': () => <RequireStudent><CategoriesPage /></RequireStudent>,
  '/budgets': () => <RequireStudent><MoneyToolsPage type="/budgets" /></RequireStudent>,
  '/reports': () => <RequireStudent><MoneyToolsPage type="/reports" /></RequireStudent>,
  '/ai-insights': () => <RequireStudent><MoneyToolsPage type="/ai-insights" /></RequireStudent>,
  '/saving-tips': () => <RequireStudent><MoneyToolsPage type="/saving-tips" /></RequireStudent>,
  '/bookmarks': () => <RequireStudent><MoneyToolsPage type="/bookmarks" /></RequireStudent>,
  '/import-csv': () => <RequireStudent><MoneyToolsPage type="/import-csv" /></RequireStudent>,
  '/review-categories': () => <RequireStudent><MoneyToolsPage type="/review-categories" /></RequireStudent>,
  '/settings': () => <RequireStudent><MoneyToolsPage type="/settings" /></RequireStudent>,
  '/admin/overview': () => <RequireAdmin><AdminConsolePage type="overview" /></RequireAdmin>,
  '/admin/users': () => <RequireAdmin><AdminConsolePage type="users" /></RequireAdmin>,
  '/admin/categories': () => <RequireAdmin><AdminConsolePage type="categories" /></RequireAdmin>,
  '/admin/announcements': () => <RequireAdmin><AdminConsolePage type="announcements" /></RequireAdmin>,
}

export function navigate(path){
  if(window.location.pathname===path){window.scrollTo(0,0);return}
  window.history.pushState({},'',path)
  window.dispatchEvent(new PopStateEvent('popstate'))
  window.scrollTo(0,0)
}

function AppRoutes(){
  const Page=routes[window.location.pathname]||LandingPage
  return <Page/>
}
export default AppRoutes
