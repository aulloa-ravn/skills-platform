import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { ApolloProvider } from '@apollo/client/react'
import { apolloClient } from '@/shared/lib/apollo-client'
import { Toaster } from '@/shared/components/ui/sonner'
import reportWebVitals from './reportWebVitals.ts'
import { App } from './app.tsx'
import './styles.css'

// Render the app
const rootElement = document.getElementById('app')
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <ApolloProvider client={apolloClient}>
        <App />
        <Toaster />
      </ApolloProvider>
    </StrictMode>,
  )
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
