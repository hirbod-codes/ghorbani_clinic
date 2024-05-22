import { CssBaseline, PaletteMode, ThemeProvider, createTheme, useMediaQuery } from '@mui/material'
import * as React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Home } from './routes/Home'
import { MenuBar } from './components/MenuBar'

export function App() {
    let modee: PaletteMode = useMediaQuery('(prefers-color-scheme: dark)') ? 'dark' : 'light'
    modee = 'dark'

    const theme = React.useMemo(
        () =>
            createTheme({
                palette: {
                    mode: modee,
                },
            }),
        [modee],
    )

    return (
        <>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <MenuBar />
                <BrowserRouter>
                    <Routes>
                        <Route path='/main_window' element={<Home />} />
                    </Routes>
                </BrowserRouter>
            </ThemeProvider>
        </>
    )
}
