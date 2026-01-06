import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import FestiveLottery from '../FestiveLottery'

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <FestiveLottery />
    </StrictMode>,
)
