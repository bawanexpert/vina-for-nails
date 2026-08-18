import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { LanguageProvider } from './context/LanguageContext'
import { ContentProvider } from './context/ContentContext'
import { BookingProvider } from './context/BookingContext'
import App from './App'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LanguageProvider>
      <ContentProvider>
        <BookingProvider>
          <App />
        </BookingProvider>
      </ContentProvider>
    </LanguageProvider>
  </StrictMode>,
)
