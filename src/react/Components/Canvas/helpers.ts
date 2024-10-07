import { MutableRefObject } from "react";

export function isCanvasEmpty(ref: MutableRefObject<HTMLCanvasElement>) {
    if (!ref.current)
        return true

    const context = ref.current.getContext('2d');

    const pixelBuffer = new Uint32Array(context.getImageData(0, 0, ref.current.width, ref.current.height).data.buffer)

    return !pixelBuffer.some(color => color !== 0);
}
