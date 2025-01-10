import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { memo } from "react";
import { Button } from "../Base/Button";

export const NextPrevButtons = memo(function NextPrevButtons({ onPrev, onNext }: { onPrev: () => void, onNext: () => void }) {
    return (
        <div className="flex flex-row space-x-1">
            <Button isIcon size='sm' variant='outline' onClick={onPrev}>
                <ChevronLeftIcon strokeWidth={1.5} />
            </Button>
            <Button isIcon size='sm' variant='outline' onClick={onNext}>
                <ChevronRightIcon strokeWidth={1.5} />
            </Button>
        </div>
    )
})
