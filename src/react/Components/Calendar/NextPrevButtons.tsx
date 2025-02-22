import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { memo, useContext } from "react";
import { Button } from "../Base/Button";
import { ConfigurationContext } from "../../Contexts/Configuration/ConfigurationContext";
import { Stack } from "../Base/Stack";

export const NextPrevButtons = memo(function NextPrevButtons({ onPrev, onNext }: { onPrev: () => void, onNext: () => void }) {
    const local = useContext(ConfigurationContext)!.local

    return (
        <Stack>
            <Button isIcon size='sm' variant='outline' onClick={onPrev}>
                {local.direction === 'ltr' ? <ChevronLeftIcon strokeWidth={1.5} /> : <ChevronRightIcon strokeWidth={1.5} />}
            </Button>
            <Button isIcon size='sm' variant='outline' onClick={onNext}>
                {local.direction === 'ltr' ? <ChevronRightIcon strokeWidth={1.5} /> : <ChevronLeftIcon strokeWidth={1.5} />}
            </Button>
        </Stack>
    )
})
