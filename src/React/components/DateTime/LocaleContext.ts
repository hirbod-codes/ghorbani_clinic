import { createContext } from 'react';
import type { Locale } from '../Localization/types';

export const LocaleContext = createContext<Locale>(undefined);
