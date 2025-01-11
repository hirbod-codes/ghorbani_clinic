import { ConfigurationContextWrapper } from '../Contexts/Configuration/ConfigurationContextWrapper';
import { AuthContextWrapper } from '../Contexts/AuthContextWrapper';
import { ResultWrapper } from '../Contexts/ResultWrapper';
import { Navigation } from '../Components/Navigation';
import { AnimatedOutlet } from './AnimatedOutlet';
import { MenuBar } from '../Components/MenuBar/MenuBar';
import { GradientBackground } from '../Components/GradientBackground';
import { memo, useMemo } from 'react';
import { Stack } from '../Components/Base/Stack';


export const Layout = memo(function Layout() {
    console.log('Layout');

    const App = useMemo(() => (
        <>
            <GradientBackground />

            <Stack direction='vertical' stackProps={{ className: 'h-screen w-screen overflow-hidden m-0 *:m-0' }}>
                <MenuBar />

                <Stack direction='vertical' stackProps={{ className: 'flex-grow overflow-hidden m-0 *:m-0' }}>
                    <Navigation />

                    <div className='flex-grow w-full relative mt-1 overflow-hidden'>
                        <AnimatedOutlet />
                    </div>
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
