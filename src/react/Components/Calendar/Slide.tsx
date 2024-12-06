import { Box, Chip, Grid, Typography } from "@mui/material";
import { memo } from "react";

export type SlideProps = {
    columns: number;
    collection: (string | number)[];
    headers?: string[]
    onElmClick?: (value: string | number, i: number) => void | Promise<void>;
    onPointerOver?: (value: string | number, i: number) => void | Promise<void>;
    onPointerOut?: (value: string | number, i: number) => void | Promise<void>;
}

export const Slide = memo(function Slide({ columns, collection, headers, onElmClick, onPointerOver, onPointerOut }: SlideProps) {
    return (
        <>
            <Grid container columns={columns} textAlign='center' spacing={0}>
                {headers && headers.map((e, i) => <Grid key={i} item xs={1}><Typography textAlign='center'>{e}</Typography></Grid>)}
                {collection.map((e, i) =>
                    e === null
                        ? <Grid key={i} item xs={1}></Grid>
                        : <Grid key={i} item xs={1}>
                            <Chip
                                onPointerOver={async () => { if (onPointerOver) await onPointerOver(e, i) }}
                                onPointerOut={async () => { if (onPointerOut) await onPointerOut(e, i) }}
                                sx={{ m: 0.2 }}
                                label={e}
                                variant="outlined"
                                onClick={async () => { if (onElmClick) await onElmClick(e, i) }}
                            />
                        </Grid>
                )}
            </Grid>
        </>
    )
})
