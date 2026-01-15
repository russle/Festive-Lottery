import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import FestiveLottery from '../FestiveLottery';
import CheckPage from '../components/CheckPage';
import { ErrorBoundary } from '../components';
import { LotteryProvider } from '../contexts/LotteryContext';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <ErrorBoundary>
            <LotteryProvider>
                <BrowserRouter>
                    <Routes>
                        <Route path="/" element={<FestiveLottery />} />
                        <Route path="/check" element={<CheckPage />} />
                    </Routes>
                </BrowserRouter>
            </LotteryProvider>
        </ErrorBoundary>
    </StrictMode>
);
