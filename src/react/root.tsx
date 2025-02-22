import { createRoot } from 'react-dom/client';
import { Main } from './Main'
import { StrictMode } from 'react';

import './i18next'

const root = createRoot(document.getElementById('root')!)

root.render(
    <StrictMode>
        <Main />
    </StrictMode>
)
