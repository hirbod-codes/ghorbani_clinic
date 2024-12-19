import { mainTransition } from "@/src/react/Styles/animations";

export const variants = {
    enter: ({ inSource, outSource, disappear }) => ({
        name: 'enter',
        opacity: disappear ? 0 : undefined,
        x: inSource === 'left' || inSource === 'right' ? '-100%' : undefined,
        y: inSource === 'top' || inSource === 'bottom' ? '100%' : undefined,
    }),
    active: ({ disappear }) => ({
        name: 'active',
        opacity: disappear ? 1 : undefined,
        x: 0,
        y: 0,
    }),
    exit: ({ inSource, outSource, disappear }) => ({
        name: 'exit',
        opacity: disappear ? 0 : undefined,
        x: outSource === 'left' || outSource === 'right' ? '100%' : undefined,
        y: outSource === 'top' || outSource === 'bottom' ? '-100%' : undefined,
    })
};
