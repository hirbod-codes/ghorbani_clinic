import { ConfigurationContextWrapper } from '../Contexts/Configuration/ConfigurationContextWrapper';
import { AuthContextWrapper } from '../Contexts/AuthContextWrapper';
import { ResultWrapper } from '../Contexts/ResultWrapper';
import { AppBar } from '../Components/AppBar';
import { AnimatedOutlet } from './AnimatedOutlet';
import { MenuBar } from '../Components/MenuBar/MenuBar';
import { GradientBackground } from '../Components/GradientBackground';
import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { Stack } from '../Components/Base/Stack';
import { Navigation } from '../Components/Navigation';

export const Layout = memo(function Layout() {
    const authContextWrapper = useMemo(() => <AuthContextWrapper><App /></AuthContextWrapper>, [])
    const resultWrapper = useMemo(() => <ResultWrapper>{authContextWrapper}</ResultWrapper>, [])

    return (
        <ConfigurationContextWrapper>
            {resultWrapper}
        </ConfigurationContextWrapper>
    );
})

export const App = memo(function App() {
    const stackRef = useRef<HTMLDivElement>(null)
    const [width, setWidth] = useState<string | undefined>(undefined)

    useEffect(() => {
        if (stackRef.current) {
            const rect = stackRef.current?.getBoundingClientRect()
            let w = rect?.width
            if (w)
                setWidth(`${w - 64}px`)
        }
    }, [stackRef.current])

    return (
        <>
            <GradientBackground />

            <Stack direction='vertical' stackProps={{ className: 'h-screen w-screen overflow-hidden mx-0' }}>
                <div className="w-full">
                    <MenuBar />
                </div>

                <Stack stackRef={stackRef} stackProps={{ className: 'flex-grow w-full overflow-hidden p-2' }}>
                    <div className="w-[64px] h-full">
                        <Navigation />
                    </div>

                    <Stack direction='vertical' stackProps={{ className: 'flex-grow h-full relative overflow-hidden bg-surface', style: { width } }}>
                        <AppBar />
                        <div className="flex-grow h-0">
                            <AnimatedOutlet />
                        </div>
                    </Stack>
                </Stack>
            </Stack>
        </>
    )
})
