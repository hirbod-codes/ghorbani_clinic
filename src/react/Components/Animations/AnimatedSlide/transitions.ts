import { mainTransition } from "@/src/react/Styles/animations";

export const getTransitions = (delay: number) => ({
    opacity: { ease: [1, 0, 1, 0.5], delay },
    x: { ...mainTransition, delay },
    y: { ...mainTransition, delay },
})
