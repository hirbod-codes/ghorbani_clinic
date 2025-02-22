import { ReactNode, memo } from 'react';
import { ConfigurationContext } from './ConfigurationContext';
import { useConfigurationHook } from './hook';

export const ConfigurationContextWrapper = memo(function ConfigurationContextWrapper({ children }: { children?: ReactNode; }) {
    const { updateTheme, updateLocal, setShowGradientBackground, isConfigurationContextReady, ...configuration } = useConfigurationHook()

    console.log('-------------ConfigurationContextWrapper', { configuration, isConfigurationContextReady })

    return (
        <>
            {isConfigurationContextReady &&
                <ConfigurationContext.Provider value={{ ...configuration, updateTheme, updateLocal, setShowGradientBackground, isConfigurationContextReady }}>
                    {children}
                </ConfigurationContext.Provider >
            }
        </>
    );
})
