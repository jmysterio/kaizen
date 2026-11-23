import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Shell } from './app/Shell'
import { captureErrors, requestPersist } from './data/diagnostics'
import './index.css'

captureErrors()
void requestPersist()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Shell />
  </StrictMode>,
)
