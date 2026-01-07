import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import FestiveLottery from '../FestiveLottery'
import CheckPage from '../components/CheckPage'
import { ErrorBoundary } from '../components'

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <ErrorBoundary>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<FestiveLottery />} />
                    <Route path="/check" element={<CheckPage />} />
                </Routes>
            </BrowserRouter>
        </ErrorBoundary>
    </StrictMode>,
)

