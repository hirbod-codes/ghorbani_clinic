import { createRoot } from 'react-dom/client';
import { Main } from './Main'

import './i18next'

const root = createRoot(document.getElementById('root')!)

root.render(<Main />)
