import type { menuAPI } from '../../../Electron/Menu/renderer/menuAPI'

import { CloseIcon } from '../Icons/CloseIcon';
import { MinimizeIcon } from '../Icons/MinimizeIcon';
import { MenuIcon } from '../Icons/MenuIcon';
import { MaxUnmaxIcon } from '../Icons/MaxUnmaxIcon';
import { memo } from 'react';
import { Button } from '../../shadcn/components/ui/button';

// function IconButton({ children, onClick, sx }: { children: React.ReactNode, onClick: React.MouseEventHandler<HTMLButtonElement>, sx?: SxProps<Theme> }): JSX.Element {
//     return (
//         <Button
//             onClick={onClick}
//             className='rounded-none p-2 mx-0 my-1 text-base'
//             sx={{
//                 borderRadius: 0,
//                 padding: '0.4rem',
//                 margin: '0 0.15rem',
//                 fontSize: '1rem',
//                 ...sx
//             }}
//         >
//             {children}
//         </Button>
//     )
// }

// function CloseIconButton({ onClick, sx }: { onClick: React.MouseEventHandler<HTMLButtonElement>, sx?: SxProps<Theme> }): JSX.Element {
//     const theme = useTheme()

//     return (
//         <MUIIconButton
//             size="small"
//             edge="start"
//             onClick={onClick}
//             sx={{
//                 borderRadius: 0,
//                 padding: '0.4rem',
//                 margin: '0 0.15rem',
//                 fontSize: '1rem',
//                 color: theme.palette.error.main,
//                 ':hover': {
//                     backgroundColor: alpha(theme.palette.error.main, 0.16)
//                 },
//                 ...sx
//             }}
//         >
//             <CloseIcon />
//         </MUIIconButton>
//     )
// }

export const MenuBar = memo(function MenuBar() {
    console.log('MenuBar')

    return (
        <div className='w-full h-[2rem] absolute top-0 left-0 bg-transparent z-10' dir='ltr'>
            <div className='flex flex-row justify-between' style={{ WebkitAppRegion: 'drag' }}>
                <Button
                    size="icon"
                    style={{ borderRadius: 1, fontSize: "1rem", padding: '0.2rem', margin: '0.2rem', WebkitAppRegion: 'no-drag' }}
                    onClick={(e: { movementX: number; movementY: number; }) => (window as typeof window & { menuAPI: menuAPI }).menuAPI.openMenu(e.movementX, e.movementY)}
                >
                    <MenuIcon />
                </Button>
                <div className='flex flex-row' style={{ WebkitAppRegion: 'no-drag' }}>
                    <Button size='icon' onClick={() => (window as typeof window & { menuAPI: menuAPI }).menuAPI.minimize()} ><MinimizeIcon /></Button>
                    <Button size='icon' onClick={() => (window as typeof window & { menuAPI: menuAPI }).menuAPI.maxUnmax()} ><MaxUnmaxIcon /></Button>
                    <Button size='icon' className='rounded-none p-2 mx-0 my-1 text-base' onClick={() => (window as typeof window & { menuAPI: menuAPI }).menuAPI.close()} ><CloseIcon /></Button>
                </div>
            </div>
        </div>
    )
})
