import { SearchPatientField } from "../../Components/Search/SearchPatientField";
import { Analytics } from "./Analytics";
import { memo } from "react";
import { Calendar } from "./Calendar";

export const Home = memo(function Home() {
    console.log('Home')

    return (
        <div className="size-full overflow-y-auto overflow-x-hidden">
            <div className="grid grid-cols-12 justify-center w-full *:p-1">
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
