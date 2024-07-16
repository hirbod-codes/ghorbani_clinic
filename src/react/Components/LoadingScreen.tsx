import { ReactNode } from "react";
import { CircularProgress, Stack } from "@mui/material";

export default function LoadingScreen({ children }: { children?: ReactNode }) {
    return (
        <>
            <Stack
                spacing={0}
                direction="column"
                alignItems="center"
                justifyContent="center"
                sx={{ minHeight: '100%' }}
            >
                <CircularProgress />
                {children}
            </Stack>
        </>
    )
}
