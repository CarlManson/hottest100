import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/compiled.css'
import App from './App.tsx'
import { applyBrand } from './config/brand'
import { startAppIconSync } from './hooks/useAppIcon'
import './utils/installPrompt'
import { registerServiceWorker } from './pwa/registerServiceWorker'

applyBrand()
startAppIconSync()
registerServiceWorker()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
