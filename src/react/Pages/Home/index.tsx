import { SearchPatientField } from "../../Components/Search/SearchPatientField";
import { Analytics } from "./Analytics";
import { Clock } from "../../Components/Clock";
import { memo, useState } from "react";
import { Calendar } from "./Calendar";

export const Home = memo(function Home() {
    const [color, setColor] = useState('colors');
    const [mode, setMode] = useState('dark');


    return (
        <div className="size-full overflow-auto">
            <div className="grid grid-cols-12 justify-center w-full space-x-2 space-y-2 p-1">
                <div className="sm:col-span-0 md:col-span-3" />
                <div className="sm:col-span-12 md:col-span-6">
                    <SearchPatientField />
                </div>
                <div className="sm:col-span-0 md:col-span-3" />

                <div className="sm:col-span-12 md:col-span-3">
                    <Clock />
                </div>

                <div className="sm:col-span-12 md:col-span-4">
                    <Calendar />
                </div>
                <div className="sm:col-span-0" />

                <div className="sm:col-span-12 md:col-span-4">
                    <Analytics />
                </div>
            </div>
        </div>
    )
})
