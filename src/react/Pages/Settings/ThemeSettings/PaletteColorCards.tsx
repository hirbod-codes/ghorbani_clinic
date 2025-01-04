import { memo } from "react";
import { Color as ColorType, configAPI, PaletteVariants, ThemeMode, ThemeOptions } from '@/src/Electron/Configuration/renderer.d';
import { ColorCard } from "./ColorCard";
import { ColorVariant } from "./ColorVariant";
import { ColorShade } from ".";

export const PaletteColorCards = memo(function PaletteColorCards({ options, name, mode, onOptionChange, onOptionChangeCancel }: { options: ColorType<PaletteVariants>, mode: ThemeMode, name: keyof ThemeOptions['colors']['palette'], onOptionChange?: (option: ColorType<PaletteVariants>) => void | Promise<void>, onOptionChangeCancel?: () => void | Promise<void> }) {
    console.log('PaletteColorCards', { options, name, mode })

    return (
        <>
            <div id='main' className="flex flex-col">
                <ColorVariant
                    mode={mode}
                    options={options}
                    variant={'main'}
                    onColorChanged={async (o) => {
                        if (onOptionChange)
                            await onOptionChange(o as ColorType<PaletteVariants>)
                    }}
                    onColorChangeCancel={async () => {
                        if (onOptionChangeCancel)
                            await onOptionChangeCancel()
                    }}
                    anchorChildren={
                        <ColorCard
                            subText={
                                <ColorShade
                                    mode={mode}
                                    options={options}
                                    variant={'main'}
                                    fg={options[mode].foreground}
                                    onChangeCancel={async () => {
                                        const conf = (await (window as typeof window & { configAPI: configAPI }).configAPI.readConfig())!
                                        options[mode + '-shades'].main = conf.themeOptions.colors.palette[name][mode + '-shades'].main
                                        if (onOptionChange)
                                            onOptionChange(options)
                                    }}
                                    onChange={(shade) => {
                                        options[mode + '-shades'].main = shade
                                        if (onOptionChange)
                                            onOptionChange(options)
                                    }}
                                />
                            }
                            text={name}
                            fg={options[mode].foreground}
                            bg={options[mode].main}
                            containerProps={{ className: "h-24 p-1" }}
                        />
                    }
                />
                <ColorVariant
                    mode={mode}
                    options={options}
                    variant={'foreground'}
                    onColorChanged={async (o) => {
                        if (onOptionChange)
                            await onOptionChange(o as ColorType<PaletteVariants>)
                    }}
                    onColorChangeCancel={async () => {
                        if (onOptionChangeCancel)
                            await onOptionChangeCancel()
                    }}
                    anchorChildren={
                        <ColorCard
                            subText={
                                <ColorShade
                                    mode={mode}
                                    options={options}
                                    variant={'foreground'}
                                    fg={options[mode].foreground}
                                    onChangeCancel={async () => {
                                        const conf = (await (window as typeof window & { configAPI: configAPI }).configAPI.readConfig())!
                                        options[mode + '-shades'].foreground = conf.themeOptions.colors.palette[name][mode + '-shades'].foreground
                                        if (onOptionChange)
                                            onOptionChange(options)
                                    }}
                                    onChange={(shade) => {
                                        options[mode + '-shades'].foreground = shade
                                        if (onOptionChange)
                                            onOptionChange(options)
                                    }}
                                />
                            }
                            text={name + ' foreground'}
                            fg={options[mode].main}
                            bg={options[mode].foreground}
                            containerProps={{ className: "py-2 w-full p-1" }}
                        />
                    }
                />
            </div>
            <div id='container' className="flex flex-col">
                <ColorVariant
                    mode={mode}
                    options={options}
                    variant={'container'}
                    onColorChanged={async (o) => {
                        if (onOptionChange)
                            await onOptionChange(o as ColorType<PaletteVariants>)
                    }}
                    onColorChangeCancel={async () => {
                        if (onOptionChangeCancel)
                            await onOptionChangeCancel()
                    }}
                    anchorChildren={
                        <ColorCard
                            subText={
                                <ColorShade
                                    mode={mode}
                                    options={options}
                                    variant={'container'}
                                    fg={options[mode]["container-foreground"]}
                                    onChangeCancel={async () => {
                                        const conf = (await (window as typeof window & { configAPI: configAPI }).configAPI.readConfig())!
                                        options[mode + '-shades'].container = conf.themeOptions.colors.palette[name][mode + '-shades'].container
                                        if (onOptionChange)
                                            onOptionChange(options)
                                    }}
                                    onChange={(shade) => {
                                        options[mode + '-shades'].container = shade
                                        if (onOptionChange)
                                            onOptionChange(options)
                                    }}
                                />
                            }
                            text={name + ' container'}
                            fg={options[mode]["container-foreground"]}
                            bg={options[mode].container}
                            containerProps={{ className: "h-24 w-full p-1" }}
                        />
                    }
                />
                <ColorVariant
                    mode={mode}
                    options={options}
                    variant={'container-foreground'}
                    onColorChanged={async (o) => {
                        if (onOptionChange)
                            await onOptionChange(o as ColorType<PaletteVariants>)
                    }}
                    onColorChangeCancel={async () => {
                        if (onOptionChangeCancel)
                            await onOptionChangeCancel()
                    }}
                    anchorChildren={
                        <ColorCard
                            subText={
                                <ColorShade
                                    mode={mode}
                                    options={options}
                                    variant={'container-foreground'}
                                    fg={options[mode].container}
                                    onChangeCancel={async () => {
                                        const conf = (await (window as typeof window & { configAPI: configAPI }).configAPI.readConfig())!
                                        options[mode + '-shades']['container-foreground'] = conf.themeOptions.colors.palette[name][mode + '-shades']['container-foreground']
                                        if (onOptionChange)
                                            onOptionChange(options)
                                    }}
                                    onChange={(shade) => {
                                        options[mode + '-shades']['container-foreground'] = shade
                                        if (onOptionChange)
                                            onOptionChange(options)
                                    }}
                                />
                            }
                            text={name + ' container foreground'}
                            fg={options[mode].container}
                            bg={options[mode]['container-foreground']}
                            containerProps={{ className: "py-2 w-full p-1" }}
                        />
                    }
                />
            </div>
            <div id='fixed' className="flex flex-col">
                <ColorVariant
                    mode={mode}
                    options={options}
                    variant={'fixed'}
                    onColorChanged={async (o) => {
                        if (onOptionChange)
                            await onOptionChange(o as ColorType<PaletteVariants>)
                    }}
                    onColorChangeCancel={async () => {
                        if (onOptionChangeCancel)
                            await onOptionChangeCancel()
                    }}
                    anchorChildren={
                        <ColorCard
                            subText={
                                <ColorShade
                                    mode={mode}
                                    options={options}
                                    variant={'fixed'}
                                    fg={options[mode]["fixed-foreground"]}
                                    onChangeCancel={async () => {
                                        const conf = (await (window as typeof window & { configAPI: configAPI }).configAPI.readConfig())!
                                        options[mode + '-shades'].fixed = conf.themeOptions.colors.palette[name][mode + '-shades'].fixed
                                        if (onOptionChange)
                                            onOptionChange(options)
                                    }}
                                    onChange={(shade) => {
                                        options[mode + '-shades'].fixed = shade
                                        if (onOptionChange)
                                            onOptionChange(options)
                                    }}
                                />
                            }
                            text={name + ' fixed'}
                            fg={options[mode]["fixed-foreground"]}
                            bg={options[mode].fixed}
                            containerProps={{ className: "h-24 w-full p-1" }}
                        />
                    }
                />
                <ColorVariant
                    mode={mode}
                    options={options}
                    variant={'fixed-dim'}
                    anchorChildren={
                        <ColorCard
                            subText={
                                <ColorShade
                                    mode={mode}
                                    options={options}
                                    variant={'fixed-dim'}
                                    fg={options[mode]["fixed-foreground"]}
                                    onChangeCancel={async () => {
                                        const conf = (await (window as typeof window & { configAPI: configAPI }).configAPI.readConfig())!
                                        options[mode + '-shades']['fixed-dim'] = conf.themeOptions.colors.palette[name][mode + '-shades']['fixed-dim']
                                        if (onOptionChange)
                                            onOptionChange(options)
                                    }}
                                    onChange={(shade) => {
                                        options[mode + '-shades']['fixed-dim'] = shade
                                        if (onOptionChange)
                                            onOptionChange(options)
                                    }}
                                />
                            }
                            text={name + ' fixed dim'}
                            fg={options[mode]["fixed-foreground"]}
                            bg={options[mode]['fixed-dim']}
                            containerProps={{ className: "h-24 w-full p-1" }}
                        />
                    }
                />
                <ColorVariant
                    mode={mode}
                    options={options}
                    variant={'fixed-foreground'}
                    anchorChildren={
                        <ColorCard
                            subText={
                                <ColorShade
                                    mode={mode}
                                    options={options}
                                    variant={'fixed-foreground'}
                                    fg={options[mode].fixed}
                                    onChangeCancel={async () => {
                                        const conf = (await (window as typeof window & { configAPI: configAPI }).configAPI.readConfig())!
                                        options[mode + '-shades']['fixed-foreground'] = conf.themeOptions.colors.palette[name][mode + '-shades']['fixed-foreground']
                                        if (onOptionChange)
                                            onOptionChange(options)
                                    }}
                                    onChange={(shade) => {
                                        options[mode + '-shades']['fixed-foreground'] = shade
                                        if (onOptionChange)
                                            onOptionChange(options)
                                    }}
                                />
                            }
                            text={name + ' fixed foreground'}
                            fg={options[mode].fixed}
                            bg={options[mode]['fixed-foreground']}
                            containerProps={{ className: "py-2 w-full p-1" }}
                        />
                    }
                />
                <ColorVariant
                    mode={mode}
                    options={options}
                    variant={'fixed-foreground-variant'}
                    anchorChildren={
                        <ColorCard
                            subText={
                                <ColorShade
                                    mode={mode}
                                    options={options}
                                    variant={'fixed-foreground-variant'}
                                    fg={options[mode].fixed}
                                    onChangeCancel={async () => {
                                        const conf = (await (window as typeof window & { configAPI: configAPI }).configAPI.readConfig())!
                                        options[mode + '-shades']['fixed-foreground-variant'] = conf.themeOptions.colors.palette[name][mode + '-shades']['fixed-foreground-variant']
                                        if (onOptionChange)
                                            onOptionChange(options)
                                    }}
                                    onChange={(shade) => {
                                        options[mode + '-shades']['fixed-foreground-variant'] = shade
                                        if (onOptionChange)
                                            onOptionChange(options)
                                    }}
                                />
                            }
                            text={name + ' fixed foreground variant'}
                            fg={options[mode].fixed}
                            bg={options[mode]['fixed-foreground-variant']}
                            containerProps={{ className: "py-2 w-full p-1" }}
                        />
                    }
                />
            </div>
        </>
    )
})
