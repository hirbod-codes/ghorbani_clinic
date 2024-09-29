import type { menuAPI } from '../../Electron/Menu/renderer/menuAPI'

import { alpha } from '@mui/material/styles';
import { IconButton, Box, Stack } from "@mui/material";

import MenuOutlinedIcon from '@mui/icons-material/MenuOutlined';
import MinimizeOutlinedIcon from '@mui/icons-material/MinimizeOutlined';
import SquareOutlinedIcon from '@mui/icons-material/SquareOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';

const CustomIconButtonStyle = {
    borderRadius: 0,
    padding: '0.4rem',
    margin: '0 0.15rem',
    fontSize: '1rem'
}

const CustomIconButton = ({ children, onClick }: { children: React.ReactNode, onClick: React.MouseEventHandler<HTMLButtonElement> }): JSX.Element =>
    <IconButton
        size="small"
        edge="start"
        color="inherit"
        onClick={onClick}
        sx={(theme) => ({
            ...CustomIconButtonStyle,
        })}
    >
        {children}
    </IconButton>

const CloseButton = ({ children, onClick }: { children: React.ReactNode, onClick: React.MouseEventHandler<HTMLButtonElement> }): JSX.Element =>
    <IconButton
        size="small"
        edge="start"
        onClick={onClick}
        sx={(theme) => ({
            ...CustomIconButtonStyle,
            color: theme.palette.error.main,
            ':hover': {
                backgroundColor: alpha(theme.palette.error.main, 0.16)
            }
        })}
    >
        {children}
    </IconButton>

export function MenuBar() {
    return (
        <Box dir='ltr' sx={{ width: '100%', height: '2rem', position: 'absolute', top: '0', left: '0', background: '#00000000', zIndex: 10 }}>
            <Stack direction='row' justifyContent='space-between' sx={{ WebkitAppRegion: 'drag' }}>
                <IconButton
                    size="small"
                    edge="start"
                    color="inherit"
                    sx={{ borderRadius: 1, fontSize: "1rem", padding: '0.2rem', margin: '0.2rem', WebkitAppRegion: 'no-drag' }}
                    onClick={(e: { movementX: number; movementY: number; }) => (window as typeof window & { menuAPI: menuAPI }).menuAPI.openMenu(e.movementX, e.movementY)}
                >
                    <MenuOutlinedIcon fontSize='inherit' />
                </IconButton>
                <Stack direction='row' sx={{ WebkitAppRegion: 'no-drag' }}>
                    <CustomIconButton onClick={() => (window as typeof window & { menuAPI: menuAPI }).menuAPI.minimize()} >
                        <MinimizeOutlinedIcon fontSize='inherit' />
                    </CustomIconButton>
                    <CustomIconButton onClick={() => (window as typeof window & { menuAPI: menuAPI }).menuAPI.maxUnmax()} >
                        <SquareOutlinedIcon fontSize='inherit' />
                    </CustomIconButton>
                    <CloseButton onClick={() => (window as typeof window & { menuAPI: menuAPI }).menuAPI.close()} >
                        <CloseOutlinedIcon fontSize='inherit' />
                    </CloseButton>
                </Stack>
            </Stack>
        </Box>
    )
}
