
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { initialLoad, startPolling } from './utils/storage'

// Sync with server before mounting
initialLoad().then(() => {
  startPolling(3000); // Poll every 3 seconds

  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
});
