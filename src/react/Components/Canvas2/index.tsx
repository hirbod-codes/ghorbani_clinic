import { createUUID, Data, iDraw } from 'idraw';
import { useEffect, useRef, useState } from 'react';

export function Canvas2() {
    const data: Data = {
        elements: [
            {
                uuid: createUUID(),
                name: 'rect-001',
                x: 160,
                y: 120,
                w: 200,
                h: 100,
                angle: 30,
                type: 'rect',
                detail: {
                    background: '#d5f5f9',
                    borderRadius: 10,
                    borderWidth: 2,
                    borderColor: '#3f51b5'
                }
            }
        ]
    };

    const containerRef = useRef<HTMLDivElement>()

    const [idraw, setIdraw] = useState<iDraw>()

    useEffect(() => {
        if (containerRef.current && !idraw) {
            const instance = new iDraw(containerRef.current, {
                width: 600,
                height: 400,
                devicePixelRatio: 2
            });
            setIdraw(instance)
            instance.setData(data)
        }
    }, [])

    console.log('Canvas2', { data })

    return (
        <>
            <div ref={containerRef}>
            </div>
        </>
    )
}

