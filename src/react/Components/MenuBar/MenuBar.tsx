import type { menuAPI } from '../../../Electron/Menu/renderer/menuAPI'

import { SxProps, Theme, alpha, useTheme } from '@mui/material/styles';
import { IconButton as MUIIconButton, Box, Stack } from "@mui/material";
import { CloseIcon } from '../Icons/CloseIcon';
import { MinimizeIcon } from '../Icons/MinimizeIcon';
import { MenuIcon } from '../Icons/MenuIcon';
import { MaxUnmaxIcon } from '../Icons/MaxUnmaxIcon';
import { memo } from 'react';

function IconButton({ children, onClick, sx }: { children: React.ReactNode, onClick: React.MouseEventHandler<HTMLButtonElement>, sx?: SxProps<Theme> }): JSX.Element {
    return (
        <MUIIconButton
            size="small"
            edge="start"
            color="inherit"
            onClick={onClick}
            sx={{
                borderRadius: 0,
                padding: '0.4rem',
                margin: '0 0.15rem',
                fontSize: '1rem',
                ...sx
            }}
        >
            {children}
        </MUIIconButton>
    )
}

function CloseIconButton({ onClick, sx }: { onClick: React.MouseEventHandler<HTMLButtonElement>, sx?: SxProps<Theme> }): JSX.Element {
    const theme = useTheme()

    return (
        <MUIIconButton
            size="small"
            edge="start"
            onClick={onClick}
            sx={{
                borderRadius: 0,
                padding: '0.4rem',
                margin: '0 0.15rem',
                fontSize: '1rem',
                color: theme.palette.error.main,
                ':hover': {
                    backgroundColor: alpha(theme.palette.error.main, 0.16)
                },
                ...sx
            }}
        >
            <CloseIcon />
        </MUIIconButton>
    )
}

export const MenuBar = memo(function MenuBar() {
    console.log('MenuBar')

    return (
        <Box dir='ltr' sx={{ width: '100%', height: '2rem', position: 'absolute', top: '0', left: '0', background: '#00000000', zIndex: 10 }}>
            <Stack direction='row' justifyContent='space-between' sx={{ WebkitAppRegion: 'drag' }}>
                <MUIIconButton
                    size="small"
                    edge="start"
                    color="inherit"
                    sx={{ borderRadius: 1, fontSize: "1rem", padding: '0.2rem', margin: '0.2rem', WebkitAppRegion: 'no-drag' }}
                    onClick={(e: { movementX: number; movementY: number; }) => (window as typeof window & { menuAPI: menuAPI }).menuAPI.openMenu(e.movementX, e.movementY)}
                >
                    <MenuIcon />
                </MUIIconButton>
                <Stack direction='row' sx={{ WebkitAppRegion: 'no-drag' }}>
                    <IconButton onClick={() => (window as typeof window & { menuAPI: menuAPI }).menuAPI.minimize()} ><MinimizeIcon /></IconButton>
                    <IconButton onClick={() => (window as typeof window & { menuAPI: menuAPI }).menuAPI.maxUnmax()} ><MaxUnmaxIcon /></IconButton>
                    <CloseIconButton onClick={() => (window as typeof window & { menuAPI: menuAPI }).menuAPI.close()} />
                </Stack>
            </Stack>
        </Box>
    )
})
