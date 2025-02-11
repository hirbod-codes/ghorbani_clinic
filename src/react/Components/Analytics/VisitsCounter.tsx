import { memo, useContext, useEffect, useState } from "react";
import { t } from "i18next";
import { RendererDbAPI } from "../../../Electron/Database/renderer";
import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import { Button } from "../../Components/Base/Button";
import { ChevronLeftIcon, ChevronRightIcon, MoveDownLeftIcon, MoveDownRightIcon, MoveUpLeftIcon, MoveUpRightIcon } from "lucide-react";
import { DateTime } from "luxon";
import { useNavigate } from "react-router-dom";
import { ConfigurationContext } from "../../Contexts/Configuration/ConfigurationContext";


export const VisitsCounter = memo(function VisitsCounter() {
    const local = useContext(ConfigurationContext)!.local

    const navigate = useNavigate()
    const [initLoading, setInitLoading] = useState<boolean>(true);

    const [monthlyVisitsCount, setMonthlyVisitsCount] = useState<number>();
    const [previousMonthVisitsCount, setPreviousMonthVisitsCount] = useState<number>();

    const fetchVisitCount = async (startTS: number, endTS: number): Promise<number | undefined> => {
        try {
            const res = await (window as typeof window & { dbAPI: RendererDbAPI; }).dbAPI.getVisitsByDate(startTS, endTS)
            if (res.code === 200 && res.data)
                return res.data.length
            else
                return undefined
        } catch (error) {
            console.error('VisitsCounter', 'fetchMonthlyVisitCount', error);
            throw error;
        }
    };

    const initProgressBars = async () => {
        setInitLoading(true);

        try {
            const res = await Promise.all([
                fetchVisitCount(DateTime.utc().set({ day: 1, hour: 0, minute: 0, second: 0 }).minus({ months: 1 }).toUnixInteger(), DateTime.utc().set({ day: 1, hour: 0, minute: 0, second: 0 }).toUnixInteger()),
                fetchVisitCount(DateTime.utc().set({ day: 1, hour: 0, minute: 0, second: 0 }).minus({ months: 2 }).toUnixInteger(), DateTime.utc().set({ day: 1, hour: 0, minute: 0, second: 0 }).minus({ months: 1 }).toUnixInteger()),
            ]);

            if (res[0] === undefined || res[1] === undefined)
                return

            setPreviousMonthVisitsCount(res[1])
            setMonthlyVisitsCount(res[0])

            setInitLoading(false);
        } catch (error) {
            console.error('VisitsCounter', 'initProgressBars', error);
        }
    };

    useEffect(() => {
        initProgressBars()
    }, []);

    const visitsCountText = useMotionValue(0);
    const transformedVisitsCountText = useTransform(visitsCountText, (v) => Math.floor(v));
    const visitsChangeText = useMotionValue(0);
    const transformedVisitsChangeText = useTransform(visitsChangeText, (v) => Math.floor(v));

    useEffect(() => {
        if (!initLoading)
            if (monthlyVisitsCount)
                animate(visitsCountText, monthlyVisitsCount, { duration: Math.log10(monthlyVisitsCount), ease: [0.2, 0.4, 0.4, 1] })
    }, [monthlyVisitsCount, !initLoading])

    useEffect(() => {
        if (!initLoading)
            if (monthlyVisitsCount && previousMonthVisitsCount)
                animate(visitsChangeText, 100 * (monthlyVisitsCount - previousMonthVisitsCount) / previousMonthVisitsCount, { duration: Math.log10(100 * (monthlyVisitsCount - previousMonthVisitsCount) / previousMonthVisitsCount), ease: [0.2, 0.4, 0.4, 1] })
    }, [monthlyVisitsCount, previousMonthVisitsCount, !initLoading])

    return (
        previousMonthVisitsCount !== undefined && monthlyVisitsCount !== undefined && !initLoading &&
        <div className='flex flex-col p-4 border rounded-2xl shadow-sm'>
            <div className="text-sm mb-2">
                {t('Analytics.VisitsPerMonth')}
            </div>
            <div className="flex items-baseline justify-between w-full">
                <div className="flex items-baseline">
                    <motion.div className="text-4xl mr-1">
                        {transformedVisitsCountText}
                    </motion.div>
                    <div className={`text-xs ${((monthlyVisitsCount - previousMonthVisitsCount) / previousMonthVisitsCount) > 0 ? 'text-success' : 'text-error'}`}>
                        <motion.div className="text-xs inline">
                            {transformedVisitsChangeText}
                        </motion.div>%
                        {((monthlyVisitsCount - previousMonthVisitsCount) / previousMonthVisitsCount) > 0
                            ? (local.direction === 'ltr' ? <MoveUpRightIcon size={15} className={`inline text-xs text-success`} /> : <MoveUpLeftIcon size={15} className={`inline text-xs text-success`} />)
                            : (local.direction === 'ltr' ? <MoveDownRightIcon size={15} className={`inline text-xs text-error`} /> : <MoveDownLeftIcon size={15} className={`inline text-xs text-error`} />)
                        }
                    </div>
                </div>
                <div className="flex items-center">
                    <div className="text-xs text-outline mr-1">{t('Analytics.visits')}</div>
                    <Button size='xs' variant="text" className="w-6 h-6" fgColor="primary" onClick={() => navigate('/Visits')}>
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
