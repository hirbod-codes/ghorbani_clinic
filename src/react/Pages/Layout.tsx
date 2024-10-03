import { ConfigurationContextWrapper } from '../Contexts/ConfigurationContextWrapper';
import { AuthContextWrapper } from '../Contexts/AuthContextWrapper';
import { ResultWrapper } from '../Contexts/ResultWrapper';
import { Navigation } from '../Components/Navigation';
import { AnimatedOutlet } from './AnimatedOutlet';
import { MenuBar } from '../Components/MenuBar/MenuBar';
import { GradientBackground } from '../Components/GradientBackground';
import { Box, Stack } from '@mui/material';


export function Layout() {
    console.log('Layout');

    return (
        <ConfigurationContextWrapper>
            <ResultWrapper>
                <AuthContextWrapper>
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
                </AuthContextWrapper>
            </ResultWrapper>
        </ConfigurationContextWrapper>
    );
}
