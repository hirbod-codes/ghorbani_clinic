import { memo } from "react";
import { Stack } from "../Base/Stack";
import { VisitsCounter } from "./VisitsCounter";
import { PatientsCounter } from "./PatientsCounter";
import { t } from "i18next";

export const Analytics = memo(function Analytics() {
    console.log('Analytics');

    return (
        <Stack direction="vertical" stackProps={{ className: 'h-full' }}>
            <div className="text-2xl p-4">
                {t('Analytics.Summary')}
            </div>
            <VisitsCounter />
            <PatientsCounter />
        </Stack>
    )
})
