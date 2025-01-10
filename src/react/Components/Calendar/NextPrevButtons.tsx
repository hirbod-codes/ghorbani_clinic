import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { memo } from "react";
import { Button } from "../../shadcn/components/ui/button";

export const NextPrevButtons = memo(function NextPrevButtons({ onPrev, onNext }: { onPrev: () => void, onNext: () => void }) {
    return (
        <div className="flex flex-row">
            <Button isIcon onClick={onPrev}>
                <ChevronLeftIcon strokeWidth={1.5} />
            </Button>
            <Button isIcon onClick={onNext}>
                <ChevronRightIcon strokeWidth={1.5} />
            </Button>
        </div>
    )
})
