import { Slider } from "../../Base/Slider"

export function AlphaSlider({ defaultProgress, onProgressChange }: { defaultProgress, onProgressChange }) {
    return (
        <Slider
            containerProps={{ className: 'bg-background border h-7 bg-transparent' }}
            sliderProps={{ className: 'w-[2mm] h-8 border-2 border-white-500 ' }}
            defaultProgress={defaultProgress}
            onProgressChange={onProgressChange}
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
                <defs>
                    <pattern id="p" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
                        <rect x="8" width="8" height="8" />
                        <rect y="8" width="8" height="8" />
                    </pattern>
                </defs>

                <rect width="100%" height="100%" x="0" y="0" fill="url(#p)" />
            </svg>

            <div className="absolute top-0 size-full" style={{ backgroundImage: `linear-gradient(to left, white, transparent)` }} />
        </Slider>
    )
}
