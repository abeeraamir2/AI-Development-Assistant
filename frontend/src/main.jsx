import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from "react-router-dom"
import './App.css'
import App from './App.jsx'
import { setupFetchInterceptor } from './utils/authUtils.js'

// Initialize global auth fetch interceptor
setupFetchInterceptor()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
)
