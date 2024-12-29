import { Slider } from "../../Base/Slider"

export function HueSlider({ defaultProgress, onProgressChanged, onProgressChanging }: { defaultProgress?: number, onProgressChanged?: (n: number) => void | Promise<void>, onProgressChanging?: (n: number) => void | Promise<void> }) {
    return (
        <Slider
            containerProps={{ className: 'border h-7', style: { backgroundImage: 'linear-gradient( to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)' } }}
            sliderProps={{ className: 'w-[2mm] h-8 border-2 border-white-500 ' }}
            defaultProgress={defaultProgress}
            onProgressChanged={onProgressChanged}
            onProgressChanging={onProgressChanging}
        />
    )
}
