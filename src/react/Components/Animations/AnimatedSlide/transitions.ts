import { mainTransition } from "@/src/react/Styles/animations";
import { Transition } from "framer-motion";

export const getTransitions = (delay: number): { [k: string]: Transition } => ({
    opacity: { ease: [1, 0, 1, 0.5], delay },
    x: { ease: 'easeOut', duration: 0.3, delay },
    y: { ease: 'easeOut', duration: 0.3, delay },
    // x: { ...mainTransition, delay },
    // y: { ...mainTransition, delay },
})
