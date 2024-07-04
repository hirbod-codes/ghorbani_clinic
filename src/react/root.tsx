import { createRoot } from 'react-dom/client';
import { AppWrappers } from './AppWrappers'

import './i18next'

const root = createRoot(document.getElementById('root'))

root.render(<AppWrappers />)
