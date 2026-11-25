import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/compiled.css'
import App from './App.tsx'
import { applyBrand } from './config/brand'
import { setupInstallableApp } from './pwa/install'

applyBrand()
setupInstallableApp()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
