import { memo } from "react";
import { Color as ColorType, PaletteVariants, ThemeMode, ThemeOptions } from '@/src/Electron/Configuration/renderer.d';
import { ColorCard } from "./ColorCard";
import { ColorVariant } from "./ColorVariant";

export const PaletteColorCards = memo(function PaletteColorCards({ options, name, mode, onOptionChange, onOptionChangeCancel }: { options: ColorType<PaletteVariants>, mode: ThemeMode, name: keyof ThemeOptions['colors']['palette'], onOptionChange?: (option: ColorType<PaletteVariants>) => void | Promise<void>, onOptionChangeCancel?: () => void | Promise<void> }) {
    console.log('PaletteColorCards', { options, name, mode })

    return (
        <>
            <div id='main' className="flex flex-col">
                <ColorVariant
                    mode={mode}
                    options={options}
                    variant={'main'}
                    anchorChildren={
                        <ColorCard
                            text={name}
                            fg={options[mode].foreground}
                            bg={options[mode].main}
                            containerProps={{ className: "h-24 w-full p-1" }}
                        />
                    }
                />
                <ColorVariant
                    mode={mode}
                    options={options}
                    variant={'foreground'}
                    anchorChildren={
                        <ColorCard
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
                    anchorChildren={
                        <ColorCard
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
                    anchorChildren={
                        <ColorCard
                            text={name + ' container foreground'}
                            fg={options[mode].container}
                            bg={options[mode]["container-foreground"]}
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
                    anchorChildren={
                        <ColorCard
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
                            text={name + ' fixed dim'}
                            fg={options[mode]["fixed-foreground"]}
                            bg={options[mode]["fixed-dim"]}
                            containerProps={{ className: "py-2 w-full p-1" }}
                        />
                    }
                />
                <ColorVariant
                    mode={mode}
                    options={options}
                    variant={'fixed-foreground'}
                    anchorChildren={
                        <ColorCard
                            text={name + ' fixed foreground'}
                            fg={options[mode].fixed}
                            bg={options[mode]["fixed-foreground"]}
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
                            text={name + ' fixed foreground variant'}
                            fg={options[mode].fixed}
                            bg={options[mode]["fixed-foreground-variant"]}
                            containerProps={{ className: "py-2 w-full p-1" }}
                        />
                    }
                />
            </div>
        </>
    )
})
