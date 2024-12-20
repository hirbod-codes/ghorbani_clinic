import { ReactNode, useContext } from 'react';
import { ConfigurationContext } from '../../Contexts/Configuration/ConfigurationContext';

export function CircularProgressBar({ percentComplete, size = 50, strokeWidth = 5, colors, children }: {
    percentComplete: number;
    size?: number;
    strokeWidth?: number;
    colors?: { progress: string; base: string; };
    children?: ReactNode;
}) {
    const themeOptions = useContext(ConfigurationContext)!.themeOptions;

    if (!colors)
        colors = {
            progress: themeOptions.colors.primary,
            base: themeOptions.colors.background,
        };
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (circumference * percentComplete / 100);

    return (
        <>
            <div className={`w-[${size}px] h-[${size}px] overflow-visible`}>
                <svg
                    viewBox={`0 0 ${size} ${size}`}
                    className='absolute rotate-[145]'
                    width={size + 'px'}
                    height={size + 'px'}
                >
                    <circle
                        strokeWidth={strokeWidth}
                        r={radius}
                        cx={'50%'}
                        cy={'50%'}
                        strokeDasharray={circumference}
                        strokeDashoffset={0}
                        fill="transparent"
                        stroke={colors.base}
                    />
                    <circle
                        strokeWidth={strokeWidth}
                        r={radius}
                        cx={'50%'}
                        cy={'50%'}
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        fill="transparent"
                        stroke={colors.progress}
                    />
                </svg>
                <div className='w-full relative top-1/2 translate-x-0 translate-y-[-50%]'>
                    {children}
                </div>
            </div>
        </>
    );
}
