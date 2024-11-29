import { ConfigurationContextWrapper } from '../Contexts/ConfigurationContextWrapper';
import { AuthContextWrapper } from '../Contexts/AuthContextWrapper';
import { ResultWrapper } from '../Contexts/ResultWrapper';
import { Navigation } from '../Components/Navigation';
import { AnimatedOutlet } from './AnimatedOutlet';
import { MenuBar } from '../Components/MenuBar/MenuBar';
import { GradientBackground } from '../Components/GradientBackground';
import { Box, Stack } from '@mui/material';
import { memo, useMemo } from 'react';


export const Layout = memo(function Layout() {
    console.log('Layout');

    const App = useMemo(() => (
        <>
            <GradientBackground />

            <Box sx={{ position: 'absolute', height: '100%', width: '100%', top: 0, left: 0 }}>
                <Stack direction='column' spacing={0} sx={{ overflow: 'hidden', height: '100%', width: '100%' }}>
                    <MenuBar />

                    <Navigation />

                    <Box sx={{ overflow: 'hidden', flexGrow: 1, width: '100%', position: 'relative', mt: 3 }}>
                        <AnimatedOutlet />
                    </Box>
                </Stack>
            </Box>
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
