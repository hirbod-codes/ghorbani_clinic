import App from './App';
import { ConfigurationContextWrapper } from './Contexts/ConfigurationContextWrapper';
import { AuthContextWrapper } from './Contexts/AuthContextWrapper';
import { NavigationContextWrapper } from './Contexts/NavigationContextWrapper';
import { ResultContextWrapper } from './Contexts/ResultContextWrapper';

export function AppWrappers() {
    console.log('AppWrappers')
    return (
        <>
            <ConfigurationContextWrapper>
                <ResultContextWrapper>
                    <AuthContextWrapper>
                        <NavigationContextWrapper>
                            <App />
                        </NavigationContextWrapper>
                    </AuthContextWrapper>
                </ResultContextWrapper>
            </ConfigurationContextWrapper >
        </>
    )
}


