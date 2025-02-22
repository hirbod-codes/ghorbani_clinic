import { modalTransition } from "@/src/react/Styles/animations";
import { Transition } from "framer-motion";

export const getTransitions = (delay: number): { [k: string]: Transition } => ({
    opacity: { ease: [1, 0, 1, 0.5], delay },
    x: { ...modalTransition, delay },
    y: { ...modalTransition, delay },
})
