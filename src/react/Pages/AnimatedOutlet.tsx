import { useLocation, useOutlet } from "react-router-dom";
import { cloneElement } from 'react';
import { AnimatePresence } from 'framer-motion';

export function AnimatedOutlet(): JSX.Element {
    console.log('AnimatedOutlet');

    const location = useLocation();
    const outlet = useOutlet();

    return (
        <AnimatePresence mode='sync'>
            {outlet && cloneElement(outlet, { key: location.pathname })}
        </AnimatePresence>
    );
}
