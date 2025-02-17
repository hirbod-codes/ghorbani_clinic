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
        <div className="grid gap-2 lg:grid-flow-col grid-cols-12 lg:grid-rows-4 justify-center h-full px-2 lg:px-0 overflow-y-auto overflow-x-hidden lg:overflow-hidden">
            <div className="sm:col-span-12 lg:col-span-4 col-span-12 lg:row-span-2">
                <Stack direction="vertical" stackProps={{ className: 'h-full min-h-[12cm]' }}>
                    <Clock containerProps={{ stackProps: { className: 'py-2 border rounded-xl bg-surface-container shadow-sm' } }} />
                    <Calendar containerProps={{ className: 'flex-grow' }} calendarContainerProps={{ className: 'border rounded-xl bg-surface-container shadow-sm' }} />
                </Stack>
            </div>

            <div className="sm:col-span-12 lg:col-span-4 col-span-12 lg:row-span-2 p-2 border rounded-xl bg-surface-container shadow-sm">
                <Analytics />
            </div>

            <div className="sm:col-span-12 lg:col-span-8 col-span-12 lg:row-span-2 border rounded-xl bg-surface-container shadow-sm">
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

            <div className="sm:col-span-12 lg:col-span-8 col-span-12 lg:row-span-2 border rounded-xl bg-surface-container shadow-sm">
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
    )
})
