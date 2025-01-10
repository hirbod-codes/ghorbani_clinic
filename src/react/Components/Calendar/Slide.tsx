import { memo } from "react";
import { Button } from "../Base/Button";

export type SlideProps = {
    columns: number;
    collection: (string | number)[];
    headers?: string[]
    onElmClick?: (value: string | number, i: number) => void | Promise<void>;
    onPointerOver?: (value: string | number, i: number) => void | Promise<void>;
    onPointerOut?: (value: string | number, i: number) => void | Promise<void>;
}

export const Slide = memo(function Slide({ columns, collection, headers, onElmClick, onPointerOver, onPointerOut }: SlideProps) {
    return (
        <>
            <div className={`grid text-center`} style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
                {headers && headers.map((e, i) =>
                    <div key={i} className='sm:col-span-1'>
                        <p className="text-center">{e}</p>
                    </div>
                )}
                {collection.map((e, i) =>
                    e === null
                        ? <div key={i} className='sm:col-span-1' />
                        : <div key={i} className='sm:col-span-1' >
                            <Button
                                onPointerOver={async () => { if (onPointerOver) await onPointerOver(e, i) }}
                                onPointerOut={async () => { if (onPointerOut) await onPointerOut(e, i) }}
                                className='m-1'
                                variant="outline"
                                isIcon
                                size='xs'
                                onClick={async () => { if (onElmClick) await onElmClick(e, i) }}
                            >
                                {e}
                            </Button>
                        </div>
                )}
            </div>
        </>
    )
})
