import type { menuAPI } from '../../../Electron/Menu/renderer/menuAPI'

import { CloseIcon } from '../Icons/CloseIcon';
import { MinimizeIcon } from '../Icons/MinimizeIcon';
import { MenuIcon } from '../Icons/MenuIcon';
import { MaxUnmaxIcon } from '../Icons/MaxUnmaxIcon';
import { memo } from 'react';
import { Button } from '../../shadcn/components/ui/button';

export const MenuBar = memo(function MenuBar() {
    console.log('MenuBar')

    return (
        <div className='w-full h-[2rem] absolute top-0 left-0 bg-transparent z-10' dir='ltr'>
            <div className='flex flex-row justify-between' style={{ WebkitAppRegion: 'drag' } as any}>
                <Button
                    size="icon"
                    style={{ borderRadius: 1, fontSize: "1rem", padding: '0.2rem', margin: '0.2rem', WebkitAppRegion: 'no-drag' } as any}
                    onClick={(e: { movementX: number; movementY: number; }) => (window as typeof window & { menuAPI: menuAPI }).menuAPI.openMenu(e.movementX, e.movementY)}
                >
                    <MenuIcon />
                </Button>
                <div className='flex flex-row' style={{ WebkitAppRegion: 'no-drag' } as any}>
                    <Button size='icon' onClick={() => (window as typeof window & { menuAPI: menuAPI }).menuAPI.minimize()} ><MinimizeIcon /></Button>
                    <Button size='icon' onClick={() => (window as typeof window & { menuAPI: menuAPI }).menuAPI.maxUnmax()} ><MaxUnmaxIcon /></Button>
                    <Button size='icon' className='rounded-none p-2 mx-0 my-1 text-base' onClick={() => (window as typeof window & { menuAPI: menuAPI }).menuAPI.close()} ><CloseIcon /></Button>
                </div>
            </div>
        </div>
    )
})
