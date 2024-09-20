import { useEffect, useState } from 'react';
import { animated, config, useSpring } from 'react-spring';


export function PageSlider({ page }: { page: JSX.Element; }) {
    const [page1, setPage1] = useState<JSX.Element>();
    const [page2, setPage2] = useState<JSX.Element>();

    // Animations
    const pageAnimationConfig1 = { ...config.default, precision: 0.0001 };
    const [pageAnimation1, pageAnimation1Api] = useSpring(() => ({ from: { left: '0' }, config: pageAnimationConfig1 }));

    const pageAnimationConfig2 = { ...config.default, precision: 0.0001 };
    const [pageAnimation2, pageAnimation2Api] = useSpring(() => ({ from: { left: '0' }, config: pageAnimationConfig2 }));

    console.log('Page', { page1, page2 });

    useEffect(() => {
        console.group('Page', 'useEffect');

        console.log({ page1, page2 });

        try {
            if (pageAnimation2.left.get() === '100%') {
                pageAnimation2Api.set({ left: '-100%' });
                setPage2(page);

                console.log({ page1, page2 });

                pageAnimation1Api.start({
                    from: { left: '0' },
                    to: { left: '100%' },
                    config: pageAnimationConfig1
                });

                setTimeout(async () => {
                    pageAnimation2Api.start({
                        from: { left: '-100%' },
                        to: { left: '0' },
                        config: pageAnimationConfig2
                    });
                }, 200);
            }
            else {
                pageAnimation1Api.set({ left: '-100%' });
                setPage1(page);

                console.log({ page1, page2 });

                pageAnimation2Api.start({
                    from: { left: '0' },
                    to: { left: '100%' },
                    config: pageAnimationConfig2
                });

                setTimeout(async () => {
                    pageAnimation1Api.start({
                        from: { left: '-100%' },
                        to: { left: '0' },
                        config: pageAnimationConfig1
                    });
                }, 200);
            }
        } finally {
            console.groupEnd();
        }
    }, [page]);

    return (
        <div style={{ overflow: 'hidden', position: 'relative', height: '100%' }}>
            <animated.div style={{ overflow: 'hidden', height: '100%', width: '100%', position: 'absolute', ...pageAnimation1 }}>
                {page1}
            </animated.div>

            <animated.div style={{ overflow: 'hidden', height: '100%', width: '100%', position: 'absolute', ...pageAnimation2 }}>
                {page2}
            </animated.div>
        </div>
    );
}
