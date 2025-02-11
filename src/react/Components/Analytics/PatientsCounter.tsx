import { memo, useContext, useEffect, useState } from "react";
import { t } from "i18next";
import { RendererDbAPI } from "../../../Electron/Database/renderer";
import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import { Button } from "../../Components/Base/Button";
import { ChevronLeftIcon, ChevronRightIcon, MoveDownLeftIcon, MoveDownRightIcon, MoveUpLeftIcon, MoveUpRightIcon } from "lucide-react";
import { DateTime } from "luxon";
import { useNavigate } from "react-router-dom";
import { ConfigurationContext } from "../../Contexts/Configuration/ConfigurationContext";

export const PatientsCounter = memo(function PatientsCounter() {
    const local = useContext(ConfigurationContext)!.local

    const navigate = useNavigate()
    const [initLoading, setInitLoading] = useState<boolean>(true);

    const [monthlyPatientsCount, setMonthlyPatientsCount] = useState<number>();
    const [previousMonthPatientsCount, setPreviousMonthPatientsCount] = useState<number>();

    const fetchPatientCount = async (startTS: number, endTS: number): Promise<number | undefined> => {
        try {
            const res = await (window as typeof window & { dbAPI: RendererDbAPI; }).dbAPI.getPatientsByCreatedAtDate(startTS, endTS)
            if (res.code === 200 && res.data)
                return res.data.length
            else
                return undefined
        } catch (error) {
            console.error('PatientsCounter', 'fetchMonthlyPatientCount', error);
            throw error;
        }
    };

    const initProgressBars = async () => {
        setInitLoading(true);

        try {
            const res = await Promise.all([
                fetchPatientCount(DateTime.utc().set({ day: 1, hour: 0, minute: 0, second: 0 }).minus({ months: 1 }).toUnixInteger(), DateTime.utc().set({ day: 1, hour: 0, minute: 0, second: 0 }).toUnixInteger()),
                fetchPatientCount(DateTime.utc().set({ day: 1, hour: 0, minute: 0, second: 0 }).minus({ months: 2 }).toUnixInteger(), DateTime.utc().set({ day: 1, hour: 0, minute: 0, second: 0 }).minus({ months: 1 }).toUnixInteger()),
            ]);

            if (res[0] === undefined || res[1] === undefined)
                return

            setPreviousMonthPatientsCount(res[1])
            setMonthlyPatientsCount(res[0])

            setInitLoading(false);
        } catch (error) {
            console.error('PatientsCounter', 'initProgressBars', error);
        }
    };

    useEffect(() => {
        initProgressBars()
    }, []);

    const visitsCountText = useMotionValue(0);
    const transformedPatientsCountText = useTransform(visitsCountText, (v) => Math.floor(v));
    const visitsChangeText = useMotionValue(0);
    const transformedPatientsChangeText = useTransform(visitsChangeText, (v) => Math.floor(v));

    useEffect(() => {
        if (!initLoading)
            if (monthlyPatientsCount)
                animate(visitsCountText, monthlyPatientsCount, { duration: Math.log10(monthlyPatientsCount), ease: [0.2, 0.4, 0.4, 1] })
    }, [monthlyPatientsCount, !initLoading])

    useEffect(() => {
        if (!initLoading)
            if (monthlyPatientsCount && previousMonthPatientsCount)
                animate(visitsChangeText, 100 * (monthlyPatientsCount - previousMonthPatientsCount) / previousMonthPatientsCount, { duration: Math.log10(100 * (monthlyPatientsCount - previousMonthPatientsCount) / previousMonthPatientsCount), ease: [0.2, 0.4, 0.4, 1] })
    }, [monthlyPatientsCount, previousMonthPatientsCount, !initLoading])

    return (
        previousMonthPatientsCount !== undefined && monthlyPatientsCount !== undefined && !initLoading &&
        <div className='flex flex-col p-4 border rounded-2xl shadow-sm'>
            <div className="text-sm mb-2">
                {t('PatientsCounter.PatientsPerMonth')}
            </div>
            <div className="flex items-baseline justify-between w-full">
                <div className="flex items-baseline">
                    <motion.div className="text-4xl mr-1">
                        {transformedPatientsCountText}
                    </motion.div>
                    <div>
                        <div dir='ltr' className={`inline text-xs ${((monthlyPatientsCount - previousMonthPatientsCount) / previousMonthPatientsCount) > 0 ? 'text-success' : 'text-error'}`}>
                            <motion.div className="inline text-xs">
                                {transformedPatientsChangeText}
                            </motion.div>%
                        </div>
                        {((monthlyPatientsCount - previousMonthPatientsCount) / previousMonthPatientsCount) > 0
                            ? (local.direction === 'ltr' ? <MoveUpRightIcon size={15} className={`inline text-xs text-success`} /> : <MoveUpLeftIcon size={15} className={`inline text-xs text-success`} />)
                            : (local.direction === 'ltr' ? <MoveDownRightIcon size={15} className={`inline text-xs text-error`} /> : <MoveDownLeftIcon size={15} className={`inline text-xs text-error`} />)
                        }
                    </div>
                </div>
                <div className="flex items-center">
                    <div className="text-xs text-outline mr-1">{t('PatientsCounter.Patients')}</div>
                    <Button size='xs' variant="text" className="w-6 h-6" fgColor="primary" onClick={() => navigate('/Patients')}>
                        {local.direction === 'ltr'
                            ? <ChevronRightIcon />
                            : <ChevronLeftIcon />
                        }
                    </Button>
                </div>
            </div>
        </div>
    )
})
