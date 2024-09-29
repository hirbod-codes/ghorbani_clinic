import { Transition } from "framer-motion";

export const mainTransition: Transition = {
    type: 'spring',
    bounce: 0.4,
    damping: 30
}

export const gradientBackgroundTransitions: Transition = {
    ...mainTransition
}

export const countersTransitions: Transition = {
    ...mainTransition,
    damping: 50
}
