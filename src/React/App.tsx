import { Box, CssBaseline, Fade, Modal, PaletteMode, Paper, ThemeProvider, createTheme, useMediaQuery } from '@mui/material'
import { useMemo, useState } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Home } from './routes/Home'
import { MenuBar } from './components/MenuBar'
import { Auth } from './auth'
import { LoginForm } from './LoginForm'

export function App() {
    const mode: PaletteMode = useMediaQuery('(prefers-color-scheme: dark)') ? 'dark' : 'light'

    const theme = useMemo(
        () =>
            createTheme({
                palette: {
                    mode: mode,
                },
            }),
        [mode],
    )

    const [user, setUser] = useState(Auth.user)

    return (
        <>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <MenuBar />
                <Box sx={{ height: '20px' }} />
                <BrowserRouter>
                    <Routes>
                        <Route path='/main_window' element={<Home />} />
                    </Routes>
                </BrowserRouter>
                <Modal open={user == null} closeAfterTransition disableEscapeKeyDown disableAutoFocus>
                    <Fade in={user == null} timeout={500}>
                        <Paper sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '30rem' }}>
                            <LoginForm onLoggedIn={(u) => { setUser(u); }} />
                        </Paper>
                    </Fade>
                </Modal>
            </ThemeProvider>
        </>
    )
}
