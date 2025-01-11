import { MedicalHistoryDataGrid } from "../Components/MedicalHistory/MedicalHistoryDataGrid";
import { memo, useEffect, useState } from "react";
import { subscribe } from "../Lib/Events";
import { PAGE_SLIDER_ANIMATION_END_EVENT_NAME } from "./AnimatedLayout";
import { CircularLoadingIcon } from "../Components/Base/CircularLoadingIcon";

export const MedicalHistories = memo(function MedicalHistories() {
    const [showGrid, setShowGrid] = useState(false)

    useEffect(() => {
        subscribe(PAGE_SLIDER_ANIMATION_END_EVENT_NAME, (e: CustomEvent) => {
            if (e?.detail === '/MedicalHistories')
                setShowGrid(true)
        })
    }, [])

    return (
        <>
            <div className="grid-cols-12 h-full space-x-1 space-y-1 p-2">
                <div className="sm:col-span-12 h-full">
                    <div className="p-[1rem] h-full shadow-lg">
                        {showGrid
                            ? < MedicalHistoryDataGrid />
                            : <CircularLoadingIcon />
                        }
                    </div>
                </div>
            </div>
        </>
    )
})

