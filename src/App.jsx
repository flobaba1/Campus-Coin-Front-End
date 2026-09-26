import { useEffect, useState } from 'react'
import AppRoutes from './routes/AppRoutes'
import { applyThemePreference, getThemePreference } from './utils/theme'
import { localizeCurrencyDom, detectCurrencyFromAccess, setCurrencyCode } from './utils/currency'

function App(){
  const [,setRoute]=useState(window.location.pathname)

  useEffect(()=>{
    const preference=getThemePreference()
    applyThemePreference(preference)

    const localizeAfterRender=()=>{
      requestAnimationFrame(()=>localizeCurrencyDom(document.body))
    }

    const handlePopState=()=>{
      setRoute(window.location.pathname)
      localizeAfterRender()
    }
    const handleTheme=()=>applyThemePreference(getThemePreference())
    const handleSystem=()=>{
      if(getThemePreference()==='system') applyThemePreference('system')
    }
    const handleCurrency=()=>localizeAfterRender()

    window.addEventListener('popstate',handlePopState)
    window.addEventListener('campuscoin-theme-change',handleTheme)
    window.addEventListener('campuscoin-currency-change',handleCurrency)

    const media=window.matchMedia?.('(prefers-color-scheme: dark)')
    media?.addEventListener?.('change',handleSystem)

    localizeAfterRender()

    // Geolocation is progressive enhancement. It can never block the app from rendering.
    if (!localStorage.getItem('campuscoin.currency')) {
      detectCurrencyFromAccess().then((code)=>{
        if(code) setCurrencyCode(code)
      }).catch(()=>{})
    }

    return()=>{
      window.removeEventListener('popstate',handlePopState)
      window.removeEventListener('campuscoin-theme-change',handleTheme)
      window.removeEventListener('campuscoin-currency-change',handleCurrency)
      media?.removeEventListener?.('change',handleSystem)
    }
  },[])

  return <AppRoutes/>
}

export default App
