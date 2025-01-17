import { memo, useContext } from 'react';
import { AuthContext } from '../Contexts/AuthContext';
import { ConfigurationContext } from '../Contexts/Configuration/ConfigurationContext';
import { LogInIcon, LogOutIcon, MoonIcon, SunIcon } from 'lucide-react';
import { CircularLoadingIcon } from './Base/CircularLoadingIcon';
import { Button } from './Base/Button';

export const AppBar = memo(function AppBar() {
    const auth = useContext(AuthContext)
    const configuration = useContext(ConfigurationContext)!

    console.log('AppBar', { auth, configuration })

    const appBarBorderColor = configuration.themeOptions.colors[`${configuration.themeOptions.mode}Foreground`]

    const appBarBorderGradient = `radial-gradient(ellipse farthest-side at center, ${appBarBorderColor}, 5%, transparent)`

    return (
        <>
            <div className='relative border-b-0 shadow-none bg-surface-container'>
                <div className='flex flex-row w-full items-center'>
                    <h4 className='flex-grow px-4'>
                        {/* Title */}
                        {auth?.user?.username}
                    </h4>
                    {
                        auth?.user &&
                        <Button variant='text' isIcon className='rounded-none' onClick={async () => await auth?.logout()}>
                            {
                                auth?.isAuthLoading
                                    ? <CircularLoadingIcon />
                                    : <LogOutIcon fontSize='inherit' />
                            }
                        </Button>
                    }
                    {
                        !auth?.isAuthLoading && !auth?.user &&
                        <Button variant='text' isIcon className='rounded-none' onClick={() => auth?.showModal()}>
                            {
                                auth?.isAuthLoading
                                    ? <CircularLoadingIcon />
                                    : <LogInIcon fontSize='inherit' />
                            }
                        </Button>
                    }
                    <Button id='theme' variant='text' isIcon className='rounded-none' onClick={async () => await configuration.updateTheme(configuration.themeOptions.mode === 'dark' ? 'light' : 'dark')}>
                        {configuration.themeOptions.mode == 'dark' ? <SunIcon fontSize='inherit' /> : <MoonIcon fontSize='inherit' />}
                    </Button>
                </div>
            </div>

            <div style={{ height: '2px', background: appBarBorderGradient, margin: '0 1rem' }} />
        </>
    );
})
