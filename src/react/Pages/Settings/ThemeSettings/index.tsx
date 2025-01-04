import { memo, useContext, useState } from "react";
import { ConfigurationContext } from '../../../Contexts/Configuration/ConfigurationContext';
import { Color as ColorType, configAPI, PaletteVariants, ThemeOptions } from '@/src/Electron/Configuration/renderer.d';
import { Checkbox } from "@mui/material";
import { Separator } from "@/src/react/shadcn/components/ui/separator";
import { SaveIcon } from "lucide-react";
import { ColorVariant } from "./ColorVariant";
import { Button } from "@/src/react/Components/Base/Button";
import { PaletteColorCards } from "./PaletteColorCards";
import { ColorCard } from "./ColorCard";
import { ColorShade } from "./ColorShade";

export const ThemeSettings = memo(function ThemeSettings() {
    const c = useContext(ConfigurationContext)!

    const [themeOptions, setThemeOptions] = useState<ThemeOptions>(() => structuredClone(c.themeOptions))

    const [showGradientBackground, setShowGradientBackground] = useState<boolean>(c.showGradientBackground ?? false)
    const [loadingGradientBackground, setLoadingGradientBackground] = useState<boolean>(false)

    const [colorCoefficient, setColorCoefficient] = useState<string>(c.themeOptions.colorCoefficient.toString())
    const [foregroundCoefficient, setForegroundCoefficient] = useState<string>(c.themeOptions.foregroundCoefficient.toString())

    const updateShowGradientBackground = async (v: boolean) => {
        setLoadingGradientBackground(true)

        const conf = (await (window as typeof window & { configAPI: configAPI }).configAPI.readConfig())!

        conf.showGradientBackground = v;

        await (window as typeof window & { configAPI: configAPI }).configAPI.writeConfig(conf)
        setLoadingGradientBackground(false)

        c.setShowGradientBackground(v)
        setShowGradientBackground(v)
    }

    console.log('ThemeSettings', { c, themeOptions, colorCoefficient, foregroundCoefficient, showGradientBackground, loadingGradientBackground })

    const paletteColorCards = (k, i) =>
        <PaletteColorCards
            key={i}
            options={themeOptions.colors.palette[k]}
            name={k as keyof (typeof themeOptions.colors.palette)}
            mode={themeOptions.mode}
            onOptionChangeCancel={async () => {
                const conf = (await (window as typeof window & { configAPI: configAPI }).configAPI.readConfig())!
                themeOptions.colors.palette[k] = conf.themeOptions.colors.palette[k]
                setThemeOptions({ ...themeOptions })
            }}
            onOptionChange={(option: ColorType<PaletteVariants>) => {
                themeOptions.colors.palette[k] = option
                setThemeOptions({ ...themeOptions })
            }}
        />

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

                        {Object.keys(themeOptions.colors.palette).map((k, i) =>
                            <ColorVariant
                                key={i}
                                mode={themeOptions.mode}
                                options={themeOptions.colors.palette[k]}
                                variant='main'
                                anchorProps={{
                                    className: "rounded-full size-[1.2cm]"
                                }}
                                containerProps={{
                                    className: "flex flex-row items-center rounded-3xl bg-gray-500 p-2 space-x-3",
                                    style: {
                                        color: themeOptions.colors.surface[themeOptions.mode].inverse,
                                        backgroundColor: themeOptions.colors.surface[themeOptions.mode]['inverse-foreground']
                                    }
                                }}
                                onColorChanged={(o) => {
                                    themeOptions.colors.palette[k] = o
                                    setThemeOptions({ ...themeOptions })
                                }}
                                onColorChangeCancel={async () => {
                                    const conf = (await (window as typeof window & { configAPI: configAPI }).configAPI.readConfig())!
                                    themeOptions.colors.palette[k] = conf.themeOptions.colors.palette[k]
                                    setThemeOptions({ ...themeOptions })
                                }}
                            >
                                <div>
                                    <p className="text-xl text-nowrap">{k}</p>
                                    {k === 'primary' &&
                                        <p className="text-sm text-nowrap">Acts as custom source color</p>
                                    }
                                </div>
                            </ColorVariant>
                        )}
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
                                {
                                    Object
                                        .keys(themeOptions.colors.palette)
                                        .filter(f => ['primary', 'secondary', 'tertiary'].includes(f))
                                        .map((k, i) =>
                                            <div key={i} className="flex flex-col space-y-1" style={{ width: 'calc((100% - 1rem)/3)' }}>
                                                {paletteColorCards(k, i)}
                                            </div>
                                        )
                                }
                            </div>
                            <div id='surface' className="col-span-4 row-span-1 flex flex-row *:w-1/3">
                                {Object
                                    .keys(themeOptions.colors.surface[themeOptions.mode])
                                    .filter(f => ['main', 'dim', 'bright'].includes(f))
                                    .map((k, i) =>
                                        <ColorVariant
                                            key={i}
                                            mode={themeOptions.mode}
                                            options={themeOptions.colors.surface}
                                            variant={k}
                                            onColorChanged={async (o) => {
                                                themeOptions.colors.surface[k] = o[k]
                                                setThemeOptions({ ...themeOptions })
                                            }}
                                            onColorChangeCancel={async () => {
                                                const conf = (await (window as typeof window & { configAPI: configAPI }).configAPI.readConfig())!
                                                themeOptions.colors.surface[k] = conf.themeOptions.colors.surface[k]
                                                setThemeOptions({ ...themeOptions })
                                            }}
                                            anchorChildren={
                                                <ColorCard
                                                    subText={
                                                        <ColorShade
                                                            mode={themeOptions.mode}
                                                            options={themeOptions.colors.surface}
                                                            variant={k}
                                                            fg={themeOptions.colors.surface[themeOptions.mode].foreground}
                                                            onChangeCancel={async () => {
                                                                const conf = (await (window as typeof window & { configAPI: configAPI }).configAPI.readConfig())!
                                                                themeOptions.colors.surface[themeOptions.mode + '-shades'][k] = conf.themeOptions.colors.surface[themeOptions.mode + '-shades'][k]
                                                                setThemeOptions({ ...themeOptions })
                                                            }}
                                                            onChange={(shade) => {
                                                                themeOptions.colors.surface[themeOptions.mode + '-shades'][k] = shade
                                                                setThemeOptions({ ...themeOptions })
                                                            }}
                                                        />
                                                    }
                                                    text={`surface ${k === 'main' ? '' : k.replace('-', ' ')}`}
                                                    fg={themeOptions.colors.surface[themeOptions.mode].foreground}
                                                    bg={themeOptions.colors.surface[themeOptions.mode][k]}
                                                    containerProps={{ className: "h-24 p-1" }}
                                                />
                                            }
                                        />
                                    )
                                }
                            </div>
                            <div id='surface-inverse' className="col-span-4 row-span-1 flex flex-row *:w-1/3">
                                {Object
                                    .keys(themeOptions.colors.surface[themeOptions.mode])
                                    .filter(f => f.includes('inverse'))
                                    .map((k, i) =>
                                        <ColorVariant
                                            key={i}
                                            mode={themeOptions.mode}
                                            options={themeOptions.colors.surface}
                                            variant={k}
                                            onColorChanged={async (o) => {
                                                themeOptions.colors.surface[k] = o[k]
                                                setThemeOptions({ ...themeOptions })
                                            }}
                                            onColorChangeCancel={async () => {
                                                const conf = (await (window as typeof window & { configAPI: configAPI }).configAPI.readConfig())!
                                                themeOptions.colors.palette[k] = conf.themeOptions.colors.palette[k]
                                                setThemeOptions({ ...themeOptions })
                                            }}
                                            anchorChildren={
                                                <ColorCard
                                                    subText={
                                                        <ColorShade
                                                            mode={themeOptions.mode}
                                                            options={themeOptions.colors.surface}
                                                            variant={k}
                                                            fg={themeOptions.colors.surface[themeOptions.mode][k.includes('foreground') ? 'inverse' : 'inverse-foreground']}
                                                            onChangeCancel={async () => {
                                                                const conf = (await (window as typeof window & { configAPI: configAPI }).configAPI.readConfig())!
                                                                themeOptions.colors.surface[themeOptions.mode + '-shades'][k] = conf.themeOptions.colors.surface[themeOptions.mode + '-shades'][k]
                                                                setThemeOptions({ ...themeOptions })
                                                            }}
                                                            onChange={(shade) => {
                                                                themeOptions.colors.surface[themeOptions.mode + '-shades'][k] = shade
                                                                setThemeOptions({ ...themeOptions })
                                                            }}
                                                        />
                                                    }
                                                    text={`surface ${k.replace('-', ' ')}`}
                                                    fg={themeOptions.colors.surface[themeOptions.mode][k.includes('foreground') ? 'inverse' : 'inverse-foreground']}
                                                    bg={themeOptions.colors.surface[themeOptions.mode][k]}
                                                    containerProps={{ className: "h-24 p-1" }}
                                                />
                                            }
                                        />
                                    )
                                }
                            </div>
                            <div id='surface-container' className="col-span-4 row-span-1 flex flex-row *:w-1/5">
                                {Object
                                    .keys(themeOptions.colors.surface[themeOptions.mode])
                                    .filter(f => f.includes('container'))
                                    .reverse()
                                    .map((k, i) =>
                                        <ColorVariant
                                            key={i}
                                            mode={themeOptions.mode}
                                            options={themeOptions.colors.surface}
                                            variant={k}
                                            onColorChanged={async (o) => {
                                                themeOptions.colors.surface[k] = o[k]
                                                setThemeOptions({ ...themeOptions })
                                            }}
                                            onColorChangeCancel={async () => {
                                                const conf = (await (window as typeof window & { configAPI: configAPI }).configAPI.readConfig())!
                                                themeOptions.colors.palette[k] = conf.themeOptions.colors.palette[k]
                                                setThemeOptions({ ...themeOptions })
                                            }}
                                            anchorChildren={
                                                <ColorCard
                                                    subText={
                                                        <ColorShade
                                                            mode={themeOptions.mode}
                                                            options={themeOptions.colors.surface}
                                                            variant={k}
                                                            fg={themeOptions.colors.surface[themeOptions.mode].foreground}
                                                            onChangeCancel={async () => {
                                                                const conf = (await (window as typeof window & { configAPI: configAPI }).configAPI.readConfig())!
                                                                themeOptions.colors.surface[themeOptions.mode + '-shades'][k] = conf.themeOptions.colors.surface[themeOptions.mode + '-shades'][k]
                                                                setThemeOptions({ ...themeOptions })
                                                            }}
                                                            onChange={(shade) => {
                                                                themeOptions.colors.surface[themeOptions.mode + '-shades'][k] = shade
                                                                setThemeOptions({ ...themeOptions })
                                                            }}
                                                        />
                                                    }
                                                    text={`surface ${k.replace('-', ' ')}`}
                                                    fg={themeOptions.colors.surface[themeOptions.mode].foreground}
                                                    bg={themeOptions.colors.surface[themeOptions.mode][k]}
                                                    containerProps={{ className: "h-24 p-1" }}
                                                />
                                            }
                                        />
                                    )
                                }
                            </div>
                            <div id='surface-foreground-outline' className="col-span-4 row-span-1 flex flex-row *:w-1/4">
                                {Object
                                    .keys(themeOptions.colors.surface[themeOptions.mode])
                                    .filter(f => ['foreground', 'foreground-variant'].includes(f))
                                    .map((k, i) =>
                                        <ColorVariant
                                            key={i}
                                            mode={themeOptions.mode}
                                            options={themeOptions.colors.surface}
                                            variant={k}
                                            onColorChanged={async (o) => {
                                                themeOptions.colors.surface[k] = o[k]
                                                setThemeOptions({ ...themeOptions })
                                            }}
                                            onColorChangeCancel={async () => {
                                                const conf = (await (window as typeof window & { configAPI: configAPI }).configAPI.readConfig())!
                                                themeOptions.colors.palette[k] = conf.themeOptions.colors.palette[k]
                                                setThemeOptions({ ...themeOptions })
                                            }}
                                            anchorChildren={
                                                <ColorCard
                                                    subText={
                                                        <ColorShade
                                                            mode={themeOptions.mode}
                                                            options={themeOptions.colors.surface}
                                                            variant={k}
                                                            fg={themeOptions.colors.surface[themeOptions.mode].main}
                                                            onChangeCancel={async () => {
                                                                const conf = (await (window as typeof window & { configAPI: configAPI }).configAPI.readConfig())!
                                                                themeOptions.colors.surface[themeOptions.mode + '-shades'][k] = conf.themeOptions.colors.surface[themeOptions.mode + '-shades'][k]
                                                                setThemeOptions({ ...themeOptions })
                                                            }}
                                                            onChange={(shade) => {
                                                                themeOptions.colors.surface[themeOptions.mode + '-shades'][k] = shade
                                                                setThemeOptions({ ...themeOptions })
                                                            }}
                                                        />
                                                    }
                                                    text={`surface ${k.replace('-', ' ')}`}
                                                    fg={themeOptions.colors.surface[themeOptions.mode].main}
                                                    bg={themeOptions.colors.surface[themeOptions.mode][k]}
                                                    containerProps={{ className: "h-24 p-1" }}
                                                />
                                            }
                                        />
                                    )
                                }
                                {Object
                                    .keys(themeOptions.colors.outline[themeOptions.mode])
                                    .map((k, i) =>
                                        <ColorVariant
                                            key={i}
                                            mode={themeOptions.mode}
                                            options={themeOptions.colors.outline}
                                            variant={k}
                                            anchorChildren={
                                                <ColorCard
                                                    subText={
                                                        <ColorShade
                                                            mode={themeOptions.mode}
                                                            options={themeOptions.colors.outline}
                                                            variant={k}
                                                            fg={themeOptions.colors.surface[themeOptions.mode][k === 'main' ? 'main' : 'foreground']}
                                                            onChangeCancel={async () => {
                                                                const conf = (await (window as typeof window & { configAPI: configAPI }).configAPI.readConfig())!
                                                                themeOptions.colors.outline[themeOptions.mode + '-shades'][k] = conf.themeOptions.colors.outline[themeOptions.mode + '-shades'][k]
                                                                setThemeOptions({ ...themeOptions })
                                                            }}
                                                            onChange={(shade) => {
                                                                themeOptions.colors.outline[themeOptions.mode + '-shades'][k] = shade
                                                                setThemeOptions({ ...themeOptions })
                                                            }}
                                                        />
                                                    }
                                                    text={`outline ${k === 'main' ? '' : k.replace('-', ' ')}`}
                                                    fg={themeOptions.colors.surface[themeOptions.mode][k === 'main' ? 'main' : 'foreground']}
                                                    bg={themeOptions.colors.outline[themeOptions.mode][k]}
                                                    containerProps={{ className: "h-24 p-1" }}
                                                />
                                            }
                                        />
                                    )
                                }
                            </div>
                            {/* secondary-palette */}
                            {
                                Object
                                    .keys(themeOptions.colors.palette)
                                    .filter(f => !['primary', 'secondary', 'tertiary'].includes(f))
                                    .map((k, i) =>
                                        <div key={i} className="col-span-4 row-span-1">
                                            <div className="flex flex-row space-x-1 size-full *:w-1/3">
                                                {paletteColorCards(k, i)}
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
