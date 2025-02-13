import { memo, useEffect, useState } from "react";
import { Button } from "../Base/Button";

export type SlideProps = {
    columns: number
    collection: (null | { value: number | string, displayValue: number | string })[]
    headers?: string[]
    onElmClick?: (value: string | number, i: number) => void | Promise<void>
    onPointerOver?: (value: string | number, i: number) => void | Promise<void>
    onPointerOut?: (value: string | number, i: number) => void | Promise<void>
    coloredIndex?: number
}

export const Slide = memo(function Slide({ columns, collection, headers, onElmClick, onPointerOver, onPointerOut, coloredIndex }: SlideProps) {
    const [selectedIndex, setSelectedIndex] = useState<number>()

    useEffect(() => {
        function handleClickOutside(e) {
            if (selectedIndex !== undefined) {
                setSelectedIndex(undefined)
            }
        }

        document.body.addEventListener("pointerdown", handleClickOutside);

        return () => {
            document.body.removeEventListener("pointerdown", handleClickOutside);
        };
    }, [selectedIndex]);

    return (
        <>
            <div className='grid gap-y-2 text-center size-full items-center justify-center' style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
                {headers && headers.map((e, i) =>
                    <div key={i} className='sm:col-span-1'>
                        <p className="text-center">{e}</p>
                    </div>
                )}
                {collection.map((e, i) =>
                    e === null
                        ? <div key={i} className='sm:col-span-1' />
                        : <div key={i} className='sm:col-span-1 sm:row-span-1' >
                            <Button
                                onPointerOver={async () => { if (onPointerOver) await onPointerOver(e.value, i) }}
                                onPointerOut={async () => { if (onPointerOut) await onPointerOut(e.value, i) }}
                                className='text-xs'
                                variant="outline"
                                isIcon
                                size='sm'
                                fgColor={coloredIndex !== undefined && coloredIndex === i ? 'warning' : (selectedIndex !== undefined && selectedIndex === i ? 'primary' : 'surface-foreground')}
                                onClick={async () => { setSelectedIndex(i); if (onElmClick) await onElmClick(e.value, i) }}
                            >
                                {e.displayValue}
                            </Button>
                        </div>
                )}
            </div>
        </>
    )
})
