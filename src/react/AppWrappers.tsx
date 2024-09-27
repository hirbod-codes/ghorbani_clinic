import { App } from './App';
import { ConfigurationContextWrapper } from './Contexts/ConfigurationContextWrapper';
import { AuthContextWrapper } from './Contexts/AuthContextWrapper';
import { NavigationContextWrapper } from './Contexts/NavigationContextWrapper';
import { ResultWrapper } from './Contexts/ResultWrapper';

export function AppWrappers() {
    console.log('AppWrappers')
    return (
        <>
            <ConfigurationContextWrapper>
                <AuthContextWrapper>
                    <NavigationContextWrapper>
                        <App />
                    </NavigationContextWrapper>
                </AuthContextWrapper>
                {/* </ResultWrapper> */}
            </ConfigurationContextWrapper>
            <ResultWrapper />
        </>
    )
}


