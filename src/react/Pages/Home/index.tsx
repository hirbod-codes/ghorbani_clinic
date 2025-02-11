import { memo } from "react";
import { Calendar } from "./Calendar";
import { Clock } from "../../Components/Clock";
import { VisitsChart } from "../../Components/Charts/VisitsChart";
import { Stack } from "../../Components/Base/Stack";
import { t } from "i18next";
import { PatientsChart } from "../../Components/Charts/PatientsChart";
import { Analytics } from "../../Components/Analytics";

export const Home = memo(function Home() {
    console.log('Home')

    return (
        <div className="size-full lg:overflow-hidden overflow-auto">
            <div className="grid lg:grid-flow-col grid-cols-12 lg:grid-rows-4 justify-center size-full">
                <div className="sm:col-span-12 lg:col-span-4 col-span-12 lg:row-span-2">
                    <Stack direction="vertical" stackProps={{ className: 'h-full' }}>
                        <Clock containerProps={{ stackProps: { className: 'py-2 border m-1 rounded-xl bg-surface-container shadow-sm' } }} />
                        <Calendar containerProps={{ className: 'flex-grow m-1' }} calendarContainerProps={{ className: 'border rounded-xl bg-surface-container shadow-sm' }} />
                    </Stack>
                </div>

                <div className="sm:col-span-12 lg:col-span-4 col-span-12 lg:row-span-2 p-2 border m-1 rounded-xl bg-surface-container shadow-sm">
                    <Analytics />
                </div>

                <div className="sm:col-span-12 lg:col-span-8 col-span-12 lg:row-span-2 border m-1 rounded-xl bg-surface-container shadow-sm">
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

                <div className="sm:col-span-12 lg:col-span-8 col-span-12 lg:row-span-2 border m-1 rounded-xl bg-surface-container shadow-sm">
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
