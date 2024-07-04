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
                sx={{ border: '1px solid black', minHeight: '100vh' }}
            >
                <CircularProgress />
                {children}
            </Stack>
        </>
    )
}
