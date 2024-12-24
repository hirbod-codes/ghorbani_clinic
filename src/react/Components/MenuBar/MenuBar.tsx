import type { menuAPI } from '../../../Electron/Menu/renderer/menuAPI'

import { MinimizeIcon } from '../Icons/MinimizeIcon';
import { MaxUnmaxIcon } from '../Icons/MaxUnmaxIcon';
import { memo, useContext } from 'react';
import { Button } from '../Base/Button';
import { MenuIcon, XIcon } from 'lucide-react';
import { ConfigurationContext } from '../../Contexts/Configuration/ConfigurationContext';

export const MenuBar = memo(function MenuBar() {
    const configuration = useContext(ConfigurationContext)!

    const appBarGradientColor = configuration.themeOptions.colors[`${configuration.themeOptions.mode}Foreground`]
    const appBarGradient = `radial-gradient(ellipse farthest-side at top, ${appBarGradientColor}, transparent)`

    console.log('MenuBar')

    return (
        <>
            <div className='w-full h-[4rem] absolute top-0 left-0' style={{ background: appBarGradient }}/>
            <div className='w-full ' dir='ltr'>
                <div className='flex flex-row justify-between' style={{ WebkitAppRegion: 'drag' } as any}>
                    <Button
                        size='icon'
                        className='rounded-none bg-transparent'
                        onClick={(e: { movementX: number; movementY: number; }) => (window as typeof window & { menuAPI: menuAPI }).menuAPI.openMenu(e.movementX, e.movementY)}
                        style={{ WebkitAppRegion: 'no-drag' } as any}
                    >
                        <MenuIcon />
                    </Button>

                    <div className='flex flex-row' style={{ WebkitAppRegion: 'no-drag' } as any}>
                        <Button size='icon' className='rounded-none bg-transparent' onClick={() => (window as typeof window & { menuAPI: menuAPI }).menuAPI.minimize()} style={{ WebkitAppRegion: 'no-drag' } as any} ><MinimizeIcon /></Button>
                        <Button size='icon' className='rounded-none bg-transparent' onClick={() => (window as typeof window & { menuAPI: menuAPI }).menuAPI.maxUnmax()} style={{ WebkitAppRegion: 'no-drag' } as any} ><MaxUnmaxIcon /></Button>
                        <Button size='icon' className='rounded-none bg-transparent' onClick={() => (window as typeof window & { menuAPI: menuAPI }).menuAPI.close()} style={{ WebkitAppRegion: 'no-drag' } as any} ><XIcon className='text-destructive' /></Button>
                    </div>
                </div>
            </div>
        </>
    )
})
