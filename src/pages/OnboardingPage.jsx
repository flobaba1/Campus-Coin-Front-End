import { useState } from 'react'

import Button from '../components/Button'
import Icon from '../components/Icon'
import Logo from '../components/Logo'

import { navigate } from '../routes/AppRoutes'

import '../styles/onboarding.css'

import {
  detectCurrencyCode,
  getCurrencyInfo,
  setCurrencyCode,
} from '../utils/currency'

import { signup } from '../api/authApi'

function Stepper({ step }) {
  return (
    <div
      className="onboarding-stepper"
      aria-label={`Onboarding step ${step} of 3`}
    >
      <div className="stepper-item complete">
        <span>
          <Icon name="checkplain" size={15} />
        </span>
        <b>Profile</b>
      </div>

      <i className={`stepper-line ${step >= 2 ? 'complete' : ''}`} />

      <div className={`stepper-item ${step >= 2 ? 'active' : ''}`}>
        <span>2</span>
        <b>Goals</b>
      </div>

      <i className={`stepper-line ${step >= 3 ? 'complete' : ''}`} />

      <div className={`stepper-item ${step >= 3 ? 'active' : ''}`}>
        <span>3</span>
        <b>First entry</b>
      </div>
    </div>
  )
}

const academicYearMap = {
  'Year 1': '100 level',
  'Year 2': '200 level',
  'Year 3': '300 level',
  'Year 4': '400 level',
}

function OnboardingPage() {
  const incomingPayload = window.history.state?.onboardingPayload || {}

  const detected = getCurrencyInfo(detectCurrencyCode())

  const savedGoals = incomingPayload.goals || {}
  const savedFirstEntry = incomingPayload.firstEntry || {}

  const [step, setStep] = useState(incomingPayload.currentStep || 2)

  const [currency, setCurrency] = useState(
    savedGoals.currency || detected.code
  )

  const initialCurrencyInfo = getCurrencyInfo(
    savedGoals.currency || detected.code
  )

  const [allowance, setAllowance] = useState(
    savedGoals.allowance || `${initialCurrencyInfo.symbol}600.00`
  )

  const [goal, setGoal] = useState(
    savedGoals.savingsGoal || `${initialCurrencyInfo.symbol}300`
  )

  const [selectedFirstEntry, setSelectedFirstEntry] = useState(
    savedFirstEntry.type || ''
  )

  const [payload, setPayload] = useState(incomingPayload)

  const [signupLoading, setSignupLoading] = useState(false)

  const [signupError, setSignupError] = useState('')

  const updatePayload = changes => {
    setPayload(previous => {
      const next = {
        ...previous,
        ...changes,
      }

      window.history.replaceState(
        { onboardingPayload: next },
        '',
        window.location.pathname
      )

      return next
    })
  }

  const updateGoalsPayload = changes => {
    setPayload(previous => {
      const next = {
        ...previous,
        goals: {
          ...(previous.goals || {}),
          ...changes,
        },
      }

      window.history.replaceState(
        { onboardingPayload: next },
        '',
        window.location.pathname
      )

      return next
    })
  }

  const goToStep = nextStep => {
    setStep(nextStep)

    updatePayload({
      currentStep: nextStep,
    })
  }

  const goBackToProfile = () => {
    navigate('/sign-up', {
      onboardingPayload: payload,
    })
  }

  const handleCurrencyChange = next => {
    setCurrency(next)

    setCurrencyCode(next)

    const nextInfo = getCurrencyInfo(next)

    setAllowance(value => {
      const updated = value.replace(/^[^0-9-]*/, nextInfo.symbol)

      updateGoalsPayload({
        currency: next,
        allowance: updated,
      })

      return updated
    })

    setGoal(value => {
      if (value === 'Custom') {
        updateGoalsPayload({
          currency: next,
        })

        return value
      }

      const updated = value.replace(/^[^0-9-]*/, nextInfo.symbol)

      updateGoalsPayload({
        currency: next,
        savingsGoal: updated,
      })

      return updated
    })

    updateGoalsPayload({
      currency: next,
    })
  }

  const handleAllowanceChange = value => {
    setAllowance(value)

    updateGoalsPayload({
      allowance: value,
    })
  }

  const handleGoalChange = value => {
    setGoal(value)

    updateGoalsPayload({
      savingsGoal: value,
    })
  }

  const handleFirstEntry = type => {
    setSelectedFirstEntry(type)

    updatePayload({
      firstEntry: {
        ...(payload.firstEntry || {}),
        type,
      },
      currentStep: 3,
    })
  }

  const handleSignup = async () => {
    setSignupError('')

    if (!payload.profile?.fullName?.trim()) {
      setSignupError('Your full name is required.')
      return
    }

    if (!payload.profile?.email?.trim()) {
      setSignupError('Your email address is required.')
      return
    }

    if (!payload.profile?.password) {
      setSignupError('Your password is required.')
      return
    }

    if (!payload.profile?.academicYear) {
      setSignupError('Please select your academic year.')
      return
    }

    if (!allowance) {
      setSignupError('Please enter your monthly allowance.')
      return
    }

    if (!goal) {
      setSignupError('Please select your monthly savings goal.')
      return
    }

    setSignupLoading(true)

    try {
      const finalPayload = {
        ...payload,

        currentStep: 3,

        goals: {
          ...(payload.goals || {}),
          currency,
          allowance,
          savingsGoal: goal,
        },

        firstEntry: {
          ...(payload.firstEntry || {}),
          type: selectedFirstEntry,
        },
      }

      /*
       * Convert the CampusCoin onboarding payload
       * into the exact payload expected by the Spring Boot backend.
       */
      const signupPayload = {
        name: finalPayload.profile.fullName.trim(),

        email: finalPayload.profile.email.trim(),

        password: finalPayload.profile.password,

        academicYear:
          academicYearMap[finalPayload.profile.academicYear] ||
          finalPayload.profile.academicYear,

        monthlySavingsGoal: Number(
          String(finalPayload.goals.savingsGoal).replace(/[^\d.-]/g, '')
        ),

        monthlyIncome: Number(
          String(finalPayload.goals.allowance).replace(/[^\d.-]/g, '')
        ),
      }

      console.log('CampusCoin signup payload:', signupPayload)

      /*
       * Call:
       * POST /api/auth/signup
       */
      const response = await signup(signupPayload)

      console.log('CampusCoin signup response:', response)

      /*
       * Signup succeeded.
       *
       * We do NOT send the user to the dashboard.
       * They must sign in using the account they just created.
       */
      navigate('/sign-in')
    } catch (error) {
      console.error('CampusCoin signup failed:', error)

      setSignupError(
        error.message ||
          'Unable to create your account. Please try again.'
      )
    } finally {
      setSignupLoading(false)
    }
  }

  return (
    <div className="onboarding-page">
      <header className="onboarding-header">
        <button
          className="onboarding-logo"
          onClick={() => navigate('/')}
          aria-label="CampusCoin home"
        >
          <Logo />
        </button>

        <Stepper step={step} />
      </header>

      <main className="onboarding-main">
        {step === 2 ? (
          <section className="onboarding-card onboarding-goals-card">
            <div className="onboarding-icon">
              <Icon name="target" size={27} />
            </div>

            <h1>Set your money baseline</h1>

            <p>
              This powers your budgets, tips and forecasts. You can
              change it any time in Settings.
            </p>

            <div className="onboarding-field">
              <label htmlFor="currency">Currency</label>

              <div className="onboarding-control onboarding-select">
                <span className="money-symbol">◉</span>

                <select
                  id="currency"
                  value={currency}
                  onChange={e =>
                    handleCurrencyChange(e.target.value)
                  }
                >
                  <option value="USD">
                    US dollar ($)
                  </option>

                  <option value="NGN">
                    Nigerian naira (₦)
                  </option>

                  <option value="GBP">
                    British pound (£)
                  </option>

                  <option value="CAD">
                    Canadian dollar (CA$)
                  </option>
                </select>

                <Icon name="chevron" size={16} />
              </div>
            </div>

            <div className="onboarding-field">
              <label htmlFor="allowance">
                Usual monthly allowance
              </label>

              <div className="onboarding-control">
                <Icon name="wallet" size={18} />

                <input
                  id="allowance"
                  value={allowance}
                  onChange={e =>
                    handleAllowanceChange(e.target.value)
                  }
                />
              </div>

              <small>
                <Icon name="info" size={14} />
                From family or sponsors. Other income can vary.
              </small>
            </div>

            <div className="onboarding-field savings-field">
              <label>Monthly savings goal</label>

              <div className="saving-options">
                {[
                  `${getCurrencyInfo(currency).symbol}100`,
                  `${getCurrencyInfo(currency).symbol}200`,
                  `${getCurrencyInfo(currency).symbol}300`,
                  'Custom',
                ].map(value => (
                  <button
                    key={value}
                    type="button"
                    className={goal === value ? 'selected' : ''}
                    onClick={() => handleGoalChange(value)}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>

            <div className="onboarding-insight">
              <Icon name="sparkles" size={16} />

              <span>
                Students with a{' '}
                {getCurrencyInfo(currency).symbol}600 allowance
                and part-time income often save{' '}
                {getCurrencyInfo(currency).symbol}150 to{' '}
                {getCurrencyInfo(currency).symbol}300 a month.
              </span>
            </div>

            <div className="onboarding-actions">
              <Button
                className="onboarding-back"
                onClick={goBackToProfile}
              >
                Back
              </Button>

              <Button
                className="onboarding-next"
                onClick={() => goToStep(3)}
              >
                Continue
                <Icon name="arrow" size={18} />
              </Button>
            </div>
          </section>
        ) : (
          <section className="onboarding-card onboarding-first-entry-card">
            <div className="onboarding-icon">
              <Icon name="circlecheck" size={27} />
            </div>

            <h1>
              You are all set,{' '}
              {payload.profile?.fullName
                ?.trim()
                ?.split(/\s+/)?.[0] || 'there'}
            </h1>

            <p>
              How would you like to start? Most students log their
              allowance first.
            </p>

            <button
              className={`entry-option ${
                selectedFirstEntry === 'expense'
                  ? 'entry-option-primary'
                  : ''
              }`}
              type="button"
              onClick={() => handleFirstEntry('expense')}
            >
              <span
                className={`entry-icon ${
                  selectedFirstEntry === 'expense'
                    ? 'entry-icon-green'
                    : ''
                }`}
              >
                <Icon name="plus" size={21} />
              </span>

              <span>
                <b>Add my first expense</b>
                <small>
                  AI picks the category as you type
                </small>
              </span>

              <Icon name="chevron" size={18} />
            </button>

            <button
              className={`entry-option ${
                selectedFirstEntry === 'csv'
                  ? 'entry-option-primary'
                  : ''
              }`}
              type="button"
              onClick={() => handleFirstEntry('csv')}
            >
              <span
                className={`entry-icon ${
                  selectedFirstEntry === 'csv'
                    ? 'entry-icon-green'
                    : ''
                }`}
              >
                <Icon name="upload" size={21} />
              </span>

              <span>
                <b>Import past months from CSV</b>
                <small>
                  Bring history for better tips on day one
                </small>
              </span>

              <Icon name="chevron" size={18} />
            </button>

            {signupError && (
              <div className="auth-error" role="alert">
                {signupError}
              </div>
            )}

            <div className="onboarding-actions onboarding-first-entry-actions">
              <Button
                className="onboarding-back"
                onClick={() => goToStep(2)}
                disabled={signupLoading}
              >
                Back
              </Button>

              <Button
                className="onboarding-dashboard-button"
                onClick={handleSignup}
                disabled={signupLoading}
              >
                {signupLoading
                  ? 'Creating account…'
                  : 'Sign Up'}

                {!signupLoading && (
                  <Icon name="arrow" size={18} />
                )}
              </Button>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}

export default OnboardingPage