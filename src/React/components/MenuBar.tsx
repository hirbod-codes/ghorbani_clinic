import type { menuAPI } from '../../renderer-types'

import { alpha, styled } from '@mui/material/styles';
import { IconButton, Stack } from "@mui/material";

import MenuOutlinedIcon from '@mui/icons-material/MenuOutlined';
import MinimizeOutlinedIcon from '@mui/icons-material/MinimizeOutlined';
import SquareOutlinedIcon from '@mui/icons-material/SquareOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import React from 'react';

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

const CloseButton = styled(CustomIconButton)(({ theme }) => ({
    '&:hover': {
        backgroundColor: alpha(theme.palette.error.main, 0.16)
    }
}))

export function MenuBar() {
    return (
        <>
            <Stack direction={'row'}>
                <IconButton
                    size="small"
                    edge="start"
                    color="inherit"
                    sx={{ borderRadius: 1, fontSize: "1rem", padding: '0.2rem', margin: '0.2rem' }}
                    onClick={(e: { movementX: number; movementY: number; }) => (window as typeof window & { menuAPI: menuAPI }).menuAPI.openMenu(e.movementX, e.movementY)}
                >
                    <MenuOutlinedIcon fontSize='inherit' />
                </IconButton>
                <Stack direction={'row'} justifyContent={'flex-end'} sx={{ width: '100%' }}>
                    <CustomIconButton
                        onClick={() => (window as typeof window & { menuAPI: menuAPI }).menuAPI.minimize()}
                    >
                        <MinimizeOutlinedIcon fontSize='inherit' />
                    </CustomIconButton>

                    <CustomIconButton
                        onClick={() => (window as typeof window & { menuAPI: menuAPI }).menuAPI.maxUnmax()}
                    >
                        <SquareOutlinedIcon fontSize='inherit' />
                    </CustomIconButton>

                    <CloseButton
                        onClick={() => (window as typeof window & { menuAPI: menuAPI }).menuAPI.close()}
                    >
                        <CloseOutlinedIcon fontSize='inherit' />
                    </CloseButton>
                </Stack>
            </Stack>
        </>
    )
}
