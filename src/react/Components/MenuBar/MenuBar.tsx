import type { menuAPI } from '../../../Electron/Menu/renderer/menuAPI'

import { memo, useContext } from 'react';
import { Button } from '../Base/Button';
import { CopyIcon, MenuIcon, MinusSquareIcon, XIcon } from 'lucide-react';
import { ConfigurationContext } from '../../Contexts/Configuration/ConfigurationContext';

export const MenuBar = memo(function MenuBar() {
    return (
        <>
            <div dir='ltr' className='w-full flex flex-row justify-between bg-surface-container' style={{ WebkitAppRegion: 'drag' } as any}>
                <Button
                    isIcon
                    className='rounded-none'
                    variant='text'
                    onClick={(e: { movementX: number; movementY: number; }) => (window as typeof window & { menuAPI: menuAPI }).menuAPI.openMenu(e.movementX, e.movementY)}
                    style={{ WebkitAppRegion: 'no-drag' } as any}
                >
                    <MenuIcon />
                </Button>

                <div className='flex flex-row' style={{ WebkitAppRegion: 'no-drag' } as any}>
                    <Button isIcon className='rounded-none' variant='text' onClick={() => (window as typeof window & { menuAPI: menuAPI }).menuAPI.minimize()} style={{ WebkitAppRegion: 'no-drag' } as any} ><MinusSquareIcon /></Button>
                    <Button isIcon className='rounded-none' variant='text' onClick={() => (window as typeof window & { menuAPI: menuAPI }).menuAPI.maxUnmax()} style={{ WebkitAppRegion: 'no-drag' } as any} ><CopyIcon /></Button>
                    <Button isIcon className='rounded-none' variant='text' onClick={() => (window as typeof window & { menuAPI: menuAPI }).menuAPI.close()} style={{ WebkitAppRegion: 'no-drag' } as any} ><XIcon className='text-error' /></Button>
                </div>
            </div>
        </>
    )
})
