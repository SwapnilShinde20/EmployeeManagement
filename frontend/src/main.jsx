import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { QueryClientProvider } from './context/QueryClientProvider.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider>
    <AuthProvider>
      <App />
    </AuthProvider>
  </QueryClientProvider>
  </StrictMode>,
)
