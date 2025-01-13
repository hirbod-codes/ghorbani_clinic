import { DependencyList, RefObject, useEffect } from "react";

export function usePointerOutside(ref?: RefObject<HTMLElement>, onClick?: (isOutside: boolean) => void, deps?: DependencyList) {
    useEffect(() => {
        function handleClickOutside(e) {
            e.preventDefault()
            e.stopPropagation()

            if (!ref || !ref?.current || !onClick)
                return

            const d = ref.current.getBoundingClientRect()

            console.log(ref.current, e.target, e.currentTarget, d, e.clientX, e.clientY, e.clientX < d.left || e.clientX > d.right || e.clientY < d.top || e.clientY > d.bottom)

            onClick(e.clientX < d.left || e.clientX > d.right || e.clientY < d.top || e.clientY > d.bottom)
        }

        document.body.addEventListener("pointerdown", handleClickOutside);

        return () => {
            document.body.removeEventListener("pointerdown", handleClickOutside);
        };
    }, [ref, ref?.current, onClick, ...(deps ?? [])]);
}
