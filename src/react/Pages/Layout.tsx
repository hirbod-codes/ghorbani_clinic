import { ConfigurationContextWrapper } from '../Contexts/Configuration/ConfigurationContextWrapper';
import { AuthContextWrapper } from '../Contexts/AuthContextWrapper';
import { ResultWrapper } from '../Contexts/ResultWrapper';
import { Navigation } from '../Components/Navigation';
import { AnimatedOutlet } from './AnimatedOutlet';
import { MenuBar } from '../Components/MenuBar/MenuBar';
import { GradientBackground } from '../Components/GradientBackground';
import { memo, useMemo } from 'react';


export const Layout = memo(function Layout() {
    console.log('Layout');

    const App = useMemo(() => (
        <>
            <GradientBackground />

            <div className='border absolute size-full top-o left-0 flex flex-col overflow-hidden'>
                <MenuBar />

                <div className='flex flex-col flex-grow overflow-hidden'>
                    <Navigation />

                    <div className='overflow-hidden flex-grow w-full relative mt-3'>
                        <AnimatedOutlet />
                    </div>
                </div>
            </div>
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
