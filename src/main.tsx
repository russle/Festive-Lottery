import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import FestiveLottery from '../FestiveLottery';
import CheckPage from '../components/CheckPage';
import { ErrorBoundary } from '../components';
import { LotteryProvider } from '../contexts/LotteryContext';
import Controller from './Controller';
import RemoteControlListener from '../components/RemoteControlListener';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <ErrorBoundary>
            <LotteryProvider>
                <BrowserRouter>
                    <Routes>
                        <Route path="/" element={
                            <>
                                <RemoteControlListener />
                                <FestiveLottery />
                            </>
                        } />
                        <Route path="/check" element={<CheckPage />} />
                        <Route path="/controller" element={<Controller />} />
                    </Routes>
                </BrowserRouter>
            </LotteryProvider>
        </ErrorBoundary>
    </StrictMode>
);
