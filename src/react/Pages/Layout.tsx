import { ConfigurationContextWrapper } from '../Contexts/Configuration/ConfigurationContextWrapper';
import { AuthContextWrapper } from '../Contexts/AuthContextWrapper';
import { ResultWrapper } from '../Contexts/ResultWrapper';
import { AppBar } from '../Components/AppBar';
import { AnimatedOutlet } from './AnimatedOutlet';
import { MenuBar } from '../Components/MenuBar/MenuBar';
import { GradientBackground } from '../Components/GradientBackground';
import { memo, useMemo } from 'react';
import { Stack } from '../Components/Base/Stack';
import { Navigation } from '../Components/Navigation';

export const Layout = memo(function Layout() {
    console.log('Layout');

    const App = useMemo(() => (
        <>
            <GradientBackground />

            <Stack direction='vertical' size={3} stackProps={{ className: 'h-screen w-screen overflow-hidden mx-0' }}>
                <div className="w-full">
                    <MenuBar />
                </div>

                <Stack size={3} stackProps={{ className: 'flex-grow size-full overflow-hidden my-0 p-2' }}>
                    <Navigation />

                    <Stack size={3} direction='vertical' stackProps={{ className: 'flex-grow w-full relative overflow-hidden bg-surface h-full' }}>
                        <AppBar />
                        <div className="flex-grow">
                            <AnimatedOutlet />
                        </div>
                    </Stack>
                </Stack>
            </Stack>
        </>
    ), [])

    const authContextWrapper = useMemo(() => <AuthContextWrapper>{App}</AuthContextWrapper>, [])
    const resultWrapper = useMemo(() => <ResultWrapper>{authContextWrapper}</ResultWrapper>, [])

    return (
        <>
            <ConfigurationContextWrapper>
                {resultWrapper}
            </ConfigurationContextWrapper>
        </>
    );
})
