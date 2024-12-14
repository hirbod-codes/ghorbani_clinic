import { CssBaseline, GlobalStyles, ThemeProvider } from '@mui/material';
import { ReactNode, memo, useMemo } from 'react';
import { ConfigurationContext } from './ConfigurationContext';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { prefixer } from 'stylis';
import rtlPlugin from 'stylis-plugin-rtl';
import { useConfigurationHook } from './Configuration/hook';

// Create rtl cache
const rtlCache = createCache({
    key: 'muirtl',
    stylisPlugins: [prefixer, rtlPlugin],
});

const ltrCache = createCache({
    key: 'mui',
});


export const ConfigurationContextWrapper = memo(function ConfigurationContextWrapper({ children }: { children?: ReactNode; }) {
    const memoizedChildren = useMemo(() => children, [])

    const { updateTheme, updateLocal, setShowGradientBackground, isConfigurationContextReady, ...configuration } = useConfigurationHook()

    console.log('-------------ConfigurationContextWrapper', { configuration, isConfigurationContextReady })

    return (
        <>
            {isConfigurationContextReady &&
                <ConfigurationContext.Provider value={{ ...configuration, updateTheme, updateLocal, setShowGradientBackground, isConfigurationContextReady }}>
                    <CacheProvider value={configuration.local.direction === 'rtl' ? rtlCache : ltrCache}>
                        <ThemeProvider theme={configuration.theme}>
                            <GlobalStyles styles={{
                                '*::-webkit-scrollbar': {
                                    width: '0.4em',
                                    height: '0.4em',
                                },
                                '*::-webkit-scrollbar-track': {
                                    'WebkitBoxShadow': 'inset 0 0 5px rgb(0,0,0)',
                                },
                                '*::-webkit-scrollbar-thumb': {
                                    backgroundColor: 'rgba(0,0,0,.8)',
                                    outline: '1px solid slategrey',
                                    borderRadius: '5px'
                                },
                            }} />
                            <CssBaseline enableColorScheme />

                            {memoizedChildren}
                        </ThemeProvider>
                    </CacheProvider>
                </ConfigurationContext.Provider>
            }
        </>
    );
})
