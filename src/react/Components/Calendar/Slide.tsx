import { memo, useState } from "react";
import { Button } from "../Base/Button";

export type SlideProps = {
    columns: number
    collection: (string | number)[]
    headers?: string[]
    onElmClick?: (value: string | number, i: number) => void | Promise<void>
    onPointerOver?: (value: string | number, i: number) => void | Promise<void>
    onPointerOut?: (value: string | number, i: number) => void | Promise<void>
    coloredIndex?: number
}

export const Slide = memo(function Slide({ columns, collection, headers, onElmClick, onPointerOver, onPointerOut, coloredIndex }: SlideProps) {
    const [selectedIndex, setSelectedIndex] = useState<number>()
    return (
        <>
            <div className='grid text-center size-full items-center justify-center' style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
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
                                onPointerOver={async () => { if (onPointerOver) await onPointerOver(e, i) }}
                                onPointerOut={async () => { if (onPointerOut) await onPointerOut(e, i) }}
                                className='text-sm'
                                variant="outline"
                                isIcon
                                size='sm'
                                fgColor={coloredIndex !== undefined && coloredIndex === i ? '' : (selectedIndex !== undefined && selectedIndex === i ? 'primary' : 'surface-foreground')}
                                onClick={async () => { setSelectedIndex(i); if (onElmClick) await onElmClick(e, i) }}
                            >
                                {e}
                            </Button>
                        </div>
                )}
            </div>
        </>
    )
})
