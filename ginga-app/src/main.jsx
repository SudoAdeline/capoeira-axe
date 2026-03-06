import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { AuthProvider } from './context/AuthContext'
import { PremiumProvider } from './context/PremiumContext'
import App from './CapoeiraApp.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <PremiumProvider>
        <App />
      </PremiumProvider>
    </AuthProvider>
  </StrictMode>,
)
