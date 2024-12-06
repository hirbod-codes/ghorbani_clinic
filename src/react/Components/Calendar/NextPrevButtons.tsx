import { ArrowLeftOutlined, ArrowRightOutlined } from "@mui/icons-material";
import { IconButton, Stack } from "@mui/material";
import { memo } from "react";

export const NextPrevButtons = memo(function NextPrevButtons({ onPrev, onNext }: { onPrev: () => void, onNext: () => void }) {
    return (
        <Stack direction='row'>
            <IconButton onClick={onPrev}>
                <ArrowLeftOutlined />
            </IconButton>
            <IconButton onClick={onNext}>
                <ArrowRightOutlined />
            </IconButton>
        </Stack>
    )
})
