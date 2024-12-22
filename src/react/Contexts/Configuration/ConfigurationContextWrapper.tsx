// import { CssBaseline, GlobalStyles, ThemeProvider } from '@mui/material';
import { ReactNode, memo, useMemo, useState } from 'react';
import { ConfigurationContext } from './ConfigurationContext';
// import { CacheProvider } from '@emotion/react';
// import createCache from '@emotion/cache';
// import { prefixer } from 'stylis';
// import rtlPlugin from 'stylis-plugin-rtl';
import { useConfigurationHook } from './hook';

// // Create rtl cache
// const rtlCache = createCache({
//     key: 'muirtl',
//     stylisPlugins: [prefixer, rtlPlugin],
// });

// const ltrCache = createCache({
//     key: 'mui',
// });


export const ConfigurationContextWrapper = memo(function ConfigurationContextWrapper({ children }: { children?: ReactNode; }) {
    const memoizedChildren = useMemo(() => children, [])

    const [collection, setCollection] = useState([{ key: '0', elm: <p>0</p> }, { key: '1', elm: <p>1</p> }, { key: '2', elm: <p>2</p> }, { key: '3', elm: <p>3</p> }, { key: '4', elm: <p>4</p> }])

    const { updateTheme, updateThemeMode, updateLocal, setShowGradientBackground, isConfigurationContextReady, ...configuration } = useConfigurationHook()

    console.log('-------------ConfigurationContextWrapper', { collection, configuration, isConfigurationContextReady })

    return (
        <>
            {isConfigurationContextReady &&
                <ConfigurationContext.Provider value={{ ...configuration, updateTheme, updateThemeMode, updateLocal, setShowGradientBackground, isConfigurationContextReady }}>
                    <div className={'size-full overflow-hidden'}>
                        {memoizedChildren}
                    </div>
                    {/* <CacheProvider value={configuration.local.direction === 'rtl' ? rtlCache : ltrCache}>
                        <ThemeProvider theme={theme}>
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

                        </ThemeProvider>
                    </CacheProvider> */}
                </ConfigurationContext.Provider >
            }
        </>
    );
})
