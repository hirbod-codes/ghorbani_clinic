import { App } from './App';
import { ConfigurationContextWrapper } from './Contexts/ConfigurationContextWrapper';
import { AuthContextWrapper } from './Contexts/AuthContextWrapper';
import { NavigationContextWrapper } from './Contexts/NavigationContextWrapper';
import { ResultWrapper } from './Contexts/ResultWrapper';

export function AppWrappers() {
    console.group('AppWrappers')
    return (
        <>
            <ConfigurationContextWrapper>
                <ResultWrapper>
                    <AuthContextWrapper>
                        <NavigationContextWrapper>
                            <App />
                        </NavigationContextWrapper>
                    </AuthContextWrapper>
                </ResultWrapper>
            </ConfigurationContextWrapper >
        </>
    )
}


