import type { menuAPI } from '../../Electron/Menu/renderer/menuAPI'

import { alpha } from '@mui/material/styles';
import { Grid, IconButton, Box } from "@mui/material";

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
    <IconButton size="small" edge="start" color="inherit" onClick={onClick} sx={CustomIconButtonStyle} >
        {children}
    </IconButton>

const CloseButton = ({ children, onClick }: { children: React.ReactNode, onClick: React.MouseEventHandler<HTMLButtonElement> }): JSX.Element =>
    <IconButton size="small" edge="start" color="inherit" onClick={onClick} sx={(theme) => ({ ...CustomIconButtonStyle, ':hover': { backgroundColor: alpha(theme.palette.error.main, 0.16) } })} >
        {children}
    </IconButton>

export function MenuBar({ backgroundColor }: { backgroundColor: any }) {
    return (
        <>
            <Box dir='ltr' sx={{ width: '100%', position: 'fixed', top: '0', left: '0', height: '2rem', backgroundColor: backgroundColor, zIndex: 10 }}>
                <Grid container direction="row" spacing={2} justifyContent="space-between" alignItems="flex-start" sx={{ 'WebkitAppRegion': 'drag' }}>
                    <Grid item xs={'auto'} sx={{ 'WebkitAppRegion': 'no-drag' }}>
                        <IconButton
                            size="small"
                            edge="start"
                            color="inherit"
                            sx={{ borderRadius: 1, fontSize: "1rem", padding: '0.2rem', margin: '0.2rem' }}
                            onClick={(e: { movementX: number; movementY: number; }) => (window as typeof window & { menuAPI: menuAPI }).menuAPI.openMenu(e.movementX, e.movementY)}
                        >
                            <MenuOutlinedIcon fontSize='inherit' />
                        </IconButton>
                    </Grid>
                    <Grid item container xs={'auto'} spacing={0} direction="row" justifyContent="flex-end" alignItems="flex-start" sx={{ 'WebkitAppRegion': 'no-drag' }}>
                        <Grid item>
                            <CustomIconButton onClick={() => (window as typeof window & { menuAPI: menuAPI }).menuAPI.minimize()} >
                                <MinimizeOutlinedIcon fontSize='inherit' />
                            </CustomIconButton>
                        </Grid>
                        <Grid item>
                            <CustomIconButton onClick={() => (window as typeof window & { menuAPI: menuAPI }).menuAPI.maxUnmax()} >
                                <SquareOutlinedIcon fontSize='inherit' />
                            </CustomIconButton>
                        </Grid>
                        <Grid item>
                            <CloseButton onClick={() => (window as typeof window & { menuAPI: menuAPI }).menuAPI.close()} >
                                <CloseOutlinedIcon fontSize='inherit' />
                            </CloseButton>
                        </Grid>
                    </Grid>
                </Grid >
            </Box>
            <Box sx={{ height: '2rem' }}>
            </Box>
        </>
    )
}
