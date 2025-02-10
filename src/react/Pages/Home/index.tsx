import { Analytics } from "./Analytics";
import { memo, ReactNode, useContext, useEffect, useRef, useState } from "react";
import { Calendar } from "./Calendar";
import { Clock } from "../../Components/Clock";
import { VisitsChart } from "../../Components/Charts/VisitsChart";
import { Stack } from "../../Components/Base/Stack";
import { t } from "i18next";
import { PatientsChart } from "../../Components/Charts/PatientsChart";

export const Home = memo(function Home() {
    console.log('Home')

    return (
        <div className="size-full overflow-hidden">
            <div className="grid grid-cols-12 grid-rows-4 justify-center size-full">
                <div className="sm:col-span-12 md:col-span-4 col-span-12 row-span-2">
                    <Stack direction="vertical" stackProps={{ className: 'h-full' }}>
                        <Clock containerProps={{ stackProps: { className: 'py-2 border m-1 rounded-xl bg-surface-container shadow-lg' } }} />
                        <Calendar containerProps={{ className: 'flex-grow border m-1 rounded-xl bg-surface-container shadow-lg' }} />
                    </Stack>
                </div>

                <div className="sm:col-span-12 md:col-span-8 col-span-12 row-span-2 border m-1 rounded-xl bg-surface-container shadow-lg">
                    <Stack direction="vertical" stackProps={{ className: 'p-4 h-full' }}>
                        <Stack stackProps={{ className: 'justify-between items-center' }}>
                            <div className="text-2xl">{t('Home.Patients')}</div>
                            <div className="text-sm">{t('Home.Monthly')}</div>
                        </Stack>
                        <div className="size-full relative flex-grow">
                            <PatientsChart />
                        </div>
                    </Stack>
                </div>

                <div className="sm:col-span-12 md:col-span-4 col-span-12 row-span-2 p-2 border m-1 rounded-xl bg-surface-container shadow-lg">
                    <Analytics />
                </div>

                <div className="sm:col-span-12 md:col-span-8 col-span-12 row-span-2 border m-1 rounded-xl bg-surface-container shadow-lg">
                    <Stack direction="vertical" stackProps={{ className: 'p-4 h-full' }}>
                        <Stack stackProps={{ className: 'justify-between items-center' }}>
                            <div className="text-2xl">{t('Home.Visits')}</div>
                            <div className="text-sm">{t('Home.Daily')}</div>
                        </Stack>
                        <div className="size-full relative flex-grow">
                            <VisitsChart />
                        </div>
                    </Stack>
                </div>
            </div>
        </div>
    )
})
