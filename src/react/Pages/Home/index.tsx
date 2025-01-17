import { SearchPatientField } from "../../Components/Search/SearchPatientField";
import { Analytics } from "./Analytics";
import { memo, useEffect, useState } from "react";
import { Calendar } from "./Calendar";

import { AnimatePresence, motion, useAnimate } from 'framer-motion'
import { Button } from "../../Components/Base/Button";
import { HomeIcon } from "lucide-react";
import { Stack } from "../../Components/Base/Stack";

export const Home = memo(function Home() {
    console.log('Home')
    const [scope, animate] = useAnimate()

    const [open, setOpen] = useState(false)
    const [position, setPosition] = useState<string>('absolute')

    useEffect(() => {
        // animate(scope.current, { width: open === 'max-content' ? '9rem' : '5rem' }, { ease: 'anticipate' })
    }, [open])

    return (
        <div className="size-full overflow-y-auto overflow-x-hidden">
            <div className="grid grid-cols-12 justify-center w-full *:p-1">
                <div className="col-span-full">
                    <div className="w-fit">
                        <p>w-fit</p>
                        <Button
                            onHoverStart={() => { setOpen(true); }}
                            onHoverEnd={() => { setOpen(false); }}
                        >
                            open
                        </Button>

                        <Button>
                            <motion.div layout>
                                <HomeIcon />
                            </motion.div>
                            {open &&
                                <motion.div layout>
                                    <p>HomeHome</p>
                                </motion.div>
                            }
                        </Button>
                    </div>
                </div>

                <div className="sm:col-span-0 md:col-span-3" />
                <div className="sm:col-span-12 md:col-span-6 col-span-12">
                    <SearchPatientField />
                </div>
                <div className="sm:col-span-0 md:col-span-3" />

                {/* <div className="sm:col-span-12 md:col-span-3 col-span-12">
                    <Clock />
                </div> */}

                <div className="sm:col-span-12 md:col-span-4 col-span-12">
                    <Calendar />
                </div>
                <div className="sm:col-span-0" />

                <div className="sm:col-span-12 md:col-span-4 col-span-12">
                    <Analytics />
                </div>
            </div>
        </div>
    )
})
