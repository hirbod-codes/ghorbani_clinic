import { Analytics } from "./Analytics";
import { memo, ReactNode, useContext, useEffect, useRef, useState } from "react";
import { Calendar } from "./Calendar";
import { Clock } from "../../Components/Clock";
import { VisitsChart } from "../../Components/Charts/VisitsChart";

export const Home = memo(function Home() {
    console.log('Home')

    return (
        <div className="size-full overflow-y-auto overflow-x-hidden">
            <div className="grid grid-cols-12 justify-center w-full *:border *:m-1 *:rounded-xl *:bg-surface-container *:shadow-lg">
                <div className="sm:col-span-12 md:col-span-3 col-span-12 row-span-1 h-fit">
                    <Clock containerProps={{ stackProps: { className: 'py-2' } }} />
                </div>

                <div className="sm:col-span-12 md:col-span-6 col-span-12 row-span-1">
                    <Calendar />
                </div>

                <div className="sm:col-span-12 md:col-span-3 col-span-12 row-span-3 p-2">
                    <Analytics />
                </div>

                <div className="sm:col-span-12 md:col-span-9 col-span-12 row-span-2">
                    <div className="size-full relative">
                        <VisitsChart />
                    </div>
                </div>
            </div>
        </div>
    )
})
