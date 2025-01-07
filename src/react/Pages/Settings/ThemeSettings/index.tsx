import { memo, useCallback, useContext, useMemo, useState } from "react";
import { ConfigurationContext } from '../../../Contexts/Configuration/ConfigurationContext';
import { ThemeOptions } from '@/src/Electron/Configuration/renderer.d';
import { Checkbox } from "@mui/material";
import { Separator } from "@/src/react/shadcn/components/ui/separator";
import { SaveIcon } from "lucide-react";
import { Button } from "@/src/react/Components/Base/Button";
import { ColorVariant } from "./ColorVariant";
import { ColorMain } from "./ColorMain";
import { ColorStatic } from "@/src/react/Lib/Colors/ColorStatic";

export const ThemeSettings = memo(function ThemeSettings() {
    const c = useContext(ConfigurationContext)!

    const [themeOptions, setThemeOptions] = useState<ThemeOptions>(() => structuredClone(c.themeOptions))
    const [shouldControlColors, setShouldControlColors] = useState<boolean>(true)

    console.log('ThemeSettings', { c, themeOptions, })

    const bigColorCardStyle = useMemo(() => ({ className: "h-24 p-1" }), [])
    const smallColorCardStyle = useMemo(() => ({ className: "py-2 w-full p-1" }), [])
    const circleStyle = useMemo(() => ({ className: "rounded-full size-[1.2cm]" }), [])

    const onColorChange = useCallback((c: string | number, colorKey?: string) => {
        console.log({ c, colorKey })
        if (!colorKey)
            return

        let v: any = themeOptions.colors
        let props = colorKey.split('.')
        if (props.length !== 3 && props.length !== 2)
            throw new Error('Invalid color key provided')

        if (props.length === 3)
            v[props[0]][props[1]][props[2]] = c
        else if (shouldControlColors)
            Object
                .keys(v[props[0]][props[1]])
                .forEach(k => {
                    let rgb = ColorStatic.parse(c as string).toRgb()
                    rgb.shadeColor(v[props[0]][props[1] + '-shades'][k])
                    v[props[0]][props[1]][k] = rgb.toHex()
                })

        setThemeOptions({ ...themeOptions })
    }, [])

    const onShadeChange = useCallback(onColorChange, [])

    const paletteColorCards = useCallback((k) => (
        <>
            <div id='main' className="flex flex-col">
                <ColorVariant
                    colorKey={`${k}.${themeOptions.mode}.main`}
                    shadeKey={`${k}.${themeOptions.mode}-shades.main`}
                    color={themeOptions.colors[k][themeOptions.mode].main}
                    shade={themeOptions.colors[k][themeOptions.mode + '-shades'].main}
                    fg={themeOptions.colors[k][themeOptions.mode].foreground}
                    label={k}
                    colorCardContainerProps={bigColorCardStyle}
                    onColorChange={onColorChange}
                    onShadeChange={onShadeChange}
                />
                <ColorVariant
                    colorKey={`${k}.${themeOptions.mode}.foreground`}
                    shadeKey={`${k}.${themeOptions.mode}-shades.foreground`}
                    color={themeOptions.colors[k][themeOptions.mode].foreground}
                    shade={themeOptions.colors[k][themeOptions.mode + '-shades'].foreground}
                    fg={themeOptions.colors[k][themeOptions.mode].main}
                    label={k + ' foreground'}
                    colorCardContainerProps={smallColorCardStyle}
                    onColorChange={onColorChange}
                    onShadeChange={onShadeChange}
                />
            </div>
            <div id='container' className="flex flex-col">
                <ColorVariant
                    colorKey={`${k}.${themeOptions.mode}.container`}
                    shadeKey={`${k}.${themeOptions.mode}-shades.container`}
                    color={themeOptions.colors[k][themeOptions.mode].container}
                    shade={themeOptions.colors[k][themeOptions.mode + '-shades'].container}
                    fg={themeOptions.colors[k][themeOptions.mode]['container-foreground']}
                    label={k + ' container'}
                    colorCardContainerProps={bigColorCardStyle}
                    onColorChange={onColorChange}
                    onShadeChange={onShadeChange}
                />
                <ColorVariant
                    colorKey={`${k}.${themeOptions.mode}.container-foreground`}
                    shadeKey={`${k}.${themeOptions.mode}-shades.container-foreground`}
                    color={themeOptions.colors[k][themeOptions.mode]['container-foreground']}
                    shade={themeOptions.colors[k][themeOptions.mode + '-shades']['container-foreground']}
                    fg={themeOptions.colors[k][themeOptions.mode].container}
                    label={k + ' container foreground'}
                    colorCardContainerProps={smallColorCardStyle}
                    onColorChange={onColorChange}
                    onShadeChange={onShadeChange}
                />
            </div>
            <div id='fixed' className="flex flex-col">
                <ColorVariant
                    colorKey={`${k}.${themeOptions.mode}.fixed`}
                    shadeKey={`${k}.${themeOptions.mode}-shades.fixed`}
                    color={themeOptions.colors[k][themeOptions.mode].fixed}
                    shade={themeOptions.colors[k][themeOptions.mode + '-shades'].fixed}
                    fg={themeOptions.colors[k][themeOptions.mode]['fixed-foreground']}
                    label={k + ' fixed dim'}
                    colorCardContainerProps={bigColorCardStyle}
                    onColorChange={onColorChange}
                    onShadeChange={onShadeChange}
                />
                <ColorVariant
                    colorKey={`${k}.${themeOptions.mode}.fixed-dim`}
                    shadeKey={`${k}.${themeOptions.mode}-shades.fixed-dim`}
                    color={themeOptions.colors[k][themeOptions.mode]['fixed-dim']}
                    shade={themeOptions.colors[k][themeOptions.mode + '-shades']['fixed-dim']}
                    fg={themeOptions.colors[k][themeOptions.mode]['fixed-foreground']}
                    label={k + ' fixed'}
                    colorCardContainerProps={bigColorCardStyle}
                    onColorChange={onColorChange}
                    onShadeChange={onShadeChange}
                />
                <ColorVariant
                    colorKey={`${k}.${themeOptions.mode}.fixed-foreground`}
                    shadeKey={`${k}.${themeOptions.mode}-shades.fixed-foreground`}
                    color={themeOptions.colors[k][themeOptions.mode]['fixed-foreground']}
                    shade={themeOptions.colors[k][themeOptions.mode + '-shades']['fixed-foreground']}
                    fg={themeOptions.colors[k][themeOptions.mode]['fixed']}
                    label={k + ' fixed foreground'}
                    colorCardContainerProps={smallColorCardStyle}
                    onColorChange={onColorChange}
                    onShadeChange={onShadeChange}
                />
                <ColorVariant
                    colorKey={`${k}.${themeOptions.mode}.fixed-foreground-variant`}
                    shadeKey={`${k}.${themeOptions.mode}-shades.fixed-foreground-variant`}
                    color={themeOptions.colors[k][themeOptions.mode]['fixed-foreground-variant']}
                    shade={themeOptions.colors[k][themeOptions.mode + '-shades']['fixed-foreground-variant']}
                    fg={themeOptions.colors[k][themeOptions.mode]['fixed']}
                    label={k + ' fixed foreground variant'}
                    colorCardContainerProps={smallColorCardStyle}
                    onColorChange={onColorChange}
                    onShadeChange={onShadeChange}
                />
            </div>
        </>
    ), [])

    return (
        <div className="flex flex-col h-full">
            <div className="flex-grow grid grid-cols-12 grid-rows-1 items-stretch size-full p-2 overflow-hidden *:m-2">
                <div id='grid-item-1' className="col-span-5 row-span-1 flex flex-row">
                    <div className="w-full flex flex-col items-stretch space-y-4 px-2 overflow-y-auto">
                        <div>
                            <p className="text-xl">Core Colors</p>
                            <p className="text-sm ">Override or set key colors that will be used to generate tonal palettes and schemes.</p>
                        </div>
                        <div>
                            <p className="text-xl">Color match</p>
                            <div className="flex flex-row items-center justify-between w-full">
                                <p className="text-sm ">Stay true to my color inputs.</p>
                                <Checkbox defaultChecked={true} size='small' />
                            </div>
                        </div>

                        {['primary', 'secondary', 'tertiary', 'info', 'success', 'warning', 'error']
                            .map((k, i) =>
                                <div key={i} className="flex flex-row items-center rounded-3xl bg-gray-500 p-2 space-x-3" style={{ color: themeOptions.colors.surface[themeOptions.mode].inverse, backgroundColor: themeOptions.colors.surface[themeOptions.mode]['inverse-foreground'] }}>
                                    <ColorMain
                                        colorKey={`${k}.${themeOptions.mode}`}
                                        color={themeOptions.colors[k].main}
                                        containerProps={circleStyle}
                                        onColorChange={onColorChange}
                                    />
                                </div>
                            )
                        }

                        <div className="flex flex-row items-center rounded-3xl bg-gray-500 p-2 space-x-3" style={{ color: themeOptions.colors.surface[themeOptions.mode].inverse, backgroundColor: themeOptions.colors.surface[themeOptions.mode]['inverse-foreground'] }}>
                            <div className="rounded-full size-[1.2cm]" style={{ backgroundColor: themeOptions.colors.natural }} />
                            <div>
                                <p className="text-xl text-nowrap">Natural</p>
                                <p className="text-sm text-nowrap">Used for background and surfaces</p>
                            </div>
                        </div>
                        <div className="flex flex-row items-center rounded-3xl bg-gray-500 p-2 space-x-3" style={{ color: themeOptions.colors.surface[themeOptions.mode].inverse, backgroundColor: themeOptions.colors.surface[themeOptions.mode]['inverse-foreground'] }}>
                            <div className="rounded-full size-[1.2cm]" style={{ backgroundColor: themeOptions.colors.naturalVariant }} />
                            <div>
                                <p className="text-xl text-nowrap">Natural Variants</p>
                                <p className="text-sm text-nowrap">Used for medium emphasis and variants</p>
                            </div>
                        </div>
                    </div>
                    <Separator orientation="vertical" className="mx-4 my-8 h-auto" />
                </div>

                <div id='grid-item-2' className="col-span-7 row-span-1">
                    <div className="size-full bg-surface-container rounded-xl p-2">
                        <div className='grid grid-cols-4 items-start size-full content-start overflow-y-auto pr-2 *:m-2 *:text-xs'>
                            <div id='primary-palette' className="col-span-4 flex flex-row justify-between">
                                {['primary', 'secondary', 'tertiary']
                                    .map((k, i) =>
                                        <div key={i} className="flex flex-col space-y-1" style={{ width: 'calc((100% - 1rem)/3)' }}>
                                            {paletteColorCards(k)}
                                        </div>
                                    )
                                }
                            </div>
                            <div id='surface' className="col-span-4 row-span-1 flex flex-row *:w-1/3">
                                {['main', 'dim', 'bright']
                                    .map(((k, i) =>
                                        <ColorVariant
                                            key={i}
                                            colorKey={`surface.${themeOptions.mode}.${k}`}
                                            shadeKey={`surface.${themeOptions.mode}-shades.${k}`}
                                            color={themeOptions.colors.surface[themeOptions.mode][k]}
                                            shade={themeOptions.colors.surface[themeOptions.mode + '-shades'][k]}
                                            fg={themeOptions.colors.surface[themeOptions.mode].foreground}
                                            label={`surface${k === 'main' ? '' : ' ' + k}`}
                                            colorCardContainerProps={bigColorCardStyle}
                                            onColorChange={onColorChange}
                                            onShadeChange={onShadeChange}
                                        />
                                    ))
                                }
                            </div>
                            <div id='surface-inverse' className="col-span-4 row-span-1 flex flex-row *:w-1/3">
                                {['inverse', 'inverse-foreground', 'inverse-primary-foreground']
                                    .map(((k, i) =>
                                        <ColorVariant
                                            key={i}
                                            colorKey={`surface.${themeOptions.mode}.${k}`}
                                            shadeKey={`surface.${themeOptions.mode}-shades.${k}`}
                                            color={themeOptions.colors.surface[themeOptions.mode][k]}
                                            shade={themeOptions.colors.surface[themeOptions.mode + '-shades'][k]}
                                            fg={themeOptions.colors.surface[themeOptions.mode][k.includes('foreground') ? 'inverse' : 'inverse-foreground']}
                                            label={`surface ${k.replace('-', ' ')}`}
                                            colorCardContainerProps={bigColorCardStyle}
                                            onColorChange={onColorChange}
                                            onShadeChange={onShadeChange}
                                        />
                                    ))
                                }
                            </div>
                            <div id='surface-container' className="col-span-4 row-span-1 flex flex-row *:w-1/5">
                                {['container-highest', 'container-high', 'container', 'container-low', 'container-lowest']
                                    .map(((k, i) =>
                                        <ColorVariant
                                            key={i}
                                            colorKey={`surface.${themeOptions.mode}.${k}`}
                                            shadeKey={`surface.${themeOptions.mode}-shades.${k}`}
                                            color={themeOptions.colors.surface[themeOptions.mode][k]}
                                            shade={themeOptions.colors.surface[themeOptions.mode + '-shades'][k]}
                                            fg={themeOptions.colors.surface[themeOptions.mode].foreground}
                                            label={`surface ${k.replace('-', ' ')}`}
                                            colorCardContainerProps={bigColorCardStyle}
                                            onColorChange={onColorChange}
                                            onShadeChange={onShadeChange}
                                        />
                                    ))
                                }
                            </div>
                            <div id='surface-foreground-outline' className="col-span-4 row-span-1 flex flex-row *:w-1/4">
                                {['foreground', 'foreground-variant']
                                    .map(((k, i) =>
                                        <ColorVariant
                                            key={i}
                                            colorKey={`surface.${themeOptions.mode}.${k}`}
                                            shadeKey={`surface.${themeOptions.mode}-shades.${k}`}
                                            color={themeOptions.colors.surface[themeOptions.mode][k]}
                                            shade={themeOptions.colors.surface[themeOptions.mode + '-shades'][k]}
                                            fg={themeOptions.colors.surface[themeOptions.mode].main}
                                            label={`surface ${k.replace('-', ' ')}`}
                                            colorCardContainerProps={bigColorCardStyle}
                                            onColorChange={onColorChange}
                                            onShadeChange={onShadeChange}
                                        />
                                    ))
                                }
                                {['main', 'variant']
                                    .map(((k, i) =>
                                        <ColorVariant
                                            key={i}
                                            colorKey={`outline.${themeOptions.mode}.${k}`}
                                            shadeKey={`outline.${themeOptions.mode}-shades.${k}`}
                                            color={themeOptions.colors.outline[themeOptions.mode][k]}
                                            shade={themeOptions.colors.outline[themeOptions.mode + '-shades'][k]}
                                            fg={themeOptions.colors.surface[themeOptions.mode][k === 'main' ? 'main' : 'foreground']}
                                            label={`outline${k === 'main' ? '' : ' ' + k}`}
                                            colorCardContainerProps={bigColorCardStyle}
                                            onColorChange={onColorChange}
                                            onShadeChange={onShadeChange}
                                        />
                                    ))
                                }
                            </div>
                            {/* secondary-palette */}
                            {['info', 'success', 'warning', 'error']
                                .map((k, i) =>
                                    <div key={i} className="col-span-4 row-span-1">
                                        <div className="flex flex-row space-x-1 size-full *:w-1/3">
                                            {paletteColorCards(k)}
                                        </div>
                                    </div>
                                )
                            }
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex flex-row-reverse px-4 py-2">
                <Button onClick={() => c.updateTheme(themeOptions.mode, themeOptions)}>
                    <SaveIcon /> Save
                </Button>
            </div>
        </div>
    )
})
