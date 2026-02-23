import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './globals.css'
import { NexaErrorBoundary } from './components/SelfHealingBoundary'
import { NexaSyncProvider } from './components/NexaSyncProvider'

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <NexaErrorBoundary>
            <NexaSyncProvider>
                <App />
            </NexaSyncProvider>
        </NexaErrorBoundary>
    </React.StrictMode>,
)
