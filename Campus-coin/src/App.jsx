import { useEffect, useState } from 'react'
import AppRoutes from './routes/AppRoutes'

function App() {
  const [, setRoute] = useState(window.location.pathname)

  useEffect(() => {
    const handlePopState = () => setRoute(window.location.pathname)
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  return <AppRoutes />
}

export default App
