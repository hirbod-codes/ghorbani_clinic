import { Box, Grid } from "@mui/material";
import { SearchPatientField } from "../../Components/Search/SearchPatientField";
import { Analytics } from "./Analytics";
import { Clock } from "../../Components/Clock";
import { memo, useState } from "react";
import { Calendar } from "./Calendar";

export const Home = memo(function Home() {
    const [color, setColor] = useState('colors');
    const [mode, setMode] = useState('dark');


    return (
        <>
            <Box sx={{ width: '100%', height: '100%', overflow: 'auto' }}>
                {/* To fix negative margin */}
                <Grid container sx={{ width: '100%' }}>
                    <h1 className="text-3xl font-bold underline text-center">Hello world!</h1>

                    <div className="bg-primary text-primary-foreground border-primary mx-auto max-w-lg border-8 p-5">
                        <h1 className="text-center text-3xl font-bold">Tailwind Themes</h1>
                    </div>
                    <div className={'bg-primaryBg flex h-screen flex-col justify-center font-mono'}>
                    </div>

                    <Grid container spacing={2} sx={{ p: 1, width: '100%' }}>
                        <Grid item xs={0} sm={3} />
                        <Grid item xs={12} sm={6}>
                            <SearchPatientField />
                        </Grid>
                        <Grid item xs={0} sm={3} />

                        <Grid item xs={12} sm={3}>
                            <Clock />
                        </Grid>

                        <Grid item xs={12} sm={4}>
                            <Calendar />
                        </Grid>
                        <Grid item xs={0} sm={true} />

                        <Grid item xs={12} sm={4}>
                            <Analytics />
                        </Grid>
                    </Grid>
                </Grid>
            </Box>
        </>
    )
})
