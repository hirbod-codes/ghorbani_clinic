import { Slider } from "../../Base/Slider"

export function HueSlider({ defaultProgress, onProgressChange }: { defaultProgress, onProgressChange }) {
    return (
        <Slider
            containerProps={{ className: 'bg-background border h-7 bg-transparent', style: { backgroundImage: 'linear-gradient( to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)' } }}
            sliderProps={{ className: 'w-[2mm] h-8 border-2 border-white-500 ' }}
            defaultProgress={defaultProgress}
            onProgressChange={onProgressChange}
        />
    )
}
