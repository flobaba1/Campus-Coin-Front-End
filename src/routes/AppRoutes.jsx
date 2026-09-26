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
import StudentSitemapPage from '../pages/StudentSitemapPage'

import DashboardPage from '../pages/DashboardPage'
import TransactionsPage from '../pages/TransactionsPage'
import CategoriesPage from '../pages/CategoriesPage'
import MoneyToolsPage from '../pages/MoneyToolsPage'
import AdminConsolePage from '../pages/AdminConsolePage'

import PrivacyPage from '../pages/PrivacyPage'
import TermsPage from '../pages/TermsPage'

import {
  isAdminAuthenticated,
  isStudentAuthenticated,
} from '../utils'

function showAccessMessage(message) {
  window.setTimeout(() => {
    window.alert(message)
  }, 0)
}

function RequireStudent({ children }) {
  const authenticated = isStudentAuthenticated()
  const adminAuthenticated = isAdminAuthenticated()

  useEffect(() => {
    if (authenticated) return

    if (adminAuthenticated) {
      showAccessMessage(
        'You are signed in as an administrator. Please use the admin console.'
      )

      navigate('/admin/overview')
      return
    }

    showAccessMessage(
      'Please sign in to your CampusCoin student account to access this page.'
    )

    navigate('/sign-in')
  }, [authenticated, adminAuthenticated])

  if (!authenticated) return null

  return children
}

function RequireAdmin({ children }) {
  const authenticated = isAdminAuthenticated()
  const studentAuthenticated = isStudentAuthenticated()

  useEffect(() => {
    if (authenticated) return

    if (studentAuthenticated) {
      showAccessMessage(
        'You are currently signed in as a student. You will be logged out before entering the admin console.'
      )

      /*
       * We deliberately do not guess the student's storage key here.
       * Your existing SignOut/session utility should be used by the
       * admin-access flow if one already exists.
       */
      navigate('/admin/sign-in')
      return
    }

    showAccessMessage(
      'Administrator sign-in is required to access this area.'
    )

    navigate('/admin/sign-in')
  }, [authenticated, studentAuthenticated])

  if (!authenticated) return null

  return children
}

function RequireOnboardingAccess({ children }) {
  const studentAuthenticated = isStudentAuthenticated()
  const adminAuthenticated = isAdminAuthenticated()

  useEffect(() => {
    if (!studentAuthenticated && !adminAuthenticated) return

    showAccessMessage(
      'You are already signed in. You will be logged out before entering onboarding.'
    )

    navigate('/')
  }, [studentAuthenticated, adminAuthenticated])

  if (studentAuthenticated || adminAuthenticated) return null

  return children
}

export const routes = {
  '/': LandingPage,

  '/sign-in': SignInPage,
  '/sign-up': SignUpPage,

  /*
   * Onboarding is publicly reachable, but an already authenticated
   * user must leave the current session before entering it.
   */
  '/onboarding': () => (
    <RequireOnboardingAccess>
      <OnboardingPage />
    </RequireOnboardingAccess>
  ),

  '/forgot-password': ForgotPasswordPage,
  '/check-inbox': CheckInboxPage,
  '/reset-password': ResetPasswordPage,
  '/password-updated': PasswordUpdatedPage,

  /*
   * Public admin entry point.
   * The admin console itself remains protected.
   */
  '/admin/sign-in': AdminSignInPage,

  /*
   * Public sitemap.
   */
  '/sitemap': SitemapPage,

  /*
   * Public legal pages.
   */
  '/privacy': PrivacyPage,
  '/terms': TermsPage,

  /*
   * Authenticated student sitemap.
   */
  '/app/sitemap': () => (
    <RequireStudent>
      <StudentSitemapPage />
    </RequireStudent>
  ),

  /*
   * Student application.
   */
  '/dashboard': () => (
    <RequireStudent>
      <DashboardPage />
    </RequireStudent>
  ),

  '/transactions': () => (
    <RequireStudent>
      <TransactionsPage />
    </RequireStudent>
  ),

  '/categories': () => (
    <RequireStudent>
      <CategoriesPage />
    </RequireStudent>
  ),

  '/budgets': () => (
    <RequireStudent>
      <MoneyToolsPage type="/budgets" />
    </RequireStudent>
  ),

  '/reports': () => (
    <RequireStudent>
      <MoneyToolsPage type="/reports" />
    </RequireStudent>
  ),

  '/ai-insights': () => (
    <RequireStudent>
      <MoneyToolsPage type="/ai-insights" />
    </RequireStudent>
  ),

  '/saving-tips': () => (
    <RequireStudent>
      <MoneyToolsPage type="/saving-tips" />
    </RequireStudent>
  ),

  '/bookmarks': () => (
    <RequireStudent>
      <MoneyToolsPage type="/bookmarks" />
    </RequireStudent>
  ),

  '/import-csv': () => (
    <RequireStudent>
      <MoneyToolsPage type="/import-csv" />
    </RequireStudent>
  ),

  '/review-categories': () => (
    <RequireStudent>
      <MoneyToolsPage type="/review-categories" />
    </RequireStudent>
  ),

  '/settings': () => (
    <RequireStudent>
      <MoneyToolsPage type="/settings" />
    </RequireStudent>
  ),

  /*
   * Protected admin console.
   */
  '/admin/overview': () => (
    <RequireAdmin>
      <AdminConsolePage type="overview" />
    </RequireAdmin>
  ),

  '/admin/users': () => (
    <RequireAdmin>
      <AdminConsolePage type="users" />
    </RequireAdmin>
  ),

  '/admin/categories': () => (
    <RequireAdmin>
      <AdminConsolePage type="categories" />
    </RequireAdmin>
  ),

  '/admin/announcements': () => (
    <RequireAdmin>
      <AdminConsolePage type="announcements" />
    </RequireAdmin>
  ),
}

export function navigate(path, state = {}) {
  if (window.location.pathname === path) {
    window.history.replaceState(state, '', path)

    window.dispatchEvent(
      new PopStateEvent('popstate')
    )

    window.scrollTo(0, 0)

    return
  }

  window.history.pushState(
    state,
    '',
    path
  )

  window.dispatchEvent(
    new PopStateEvent('popstate')
  )

  window.scrollTo(0, 0)
}

function AppRoutes() {
  const Page =
    routes[window.location.pathname] || LandingPage

  return <Page />
}

export default AppRoutes