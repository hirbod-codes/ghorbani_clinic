import { Chip, Grid, Typography } from "@mui/material";

export type SlideProps = {
    columns: number;
    collection: (string | number)[];
    headers?: string[]
    onElmClick?: (value: string | number, i: number) => void | Promise<void>;
}

export function Slide({ columns, collection, headers, onElmClick }: SlideProps) {
    return (
        <>
            <Grid container columns={columns} textAlign='center' spacing={0}>
                {headers && headers.map((e, i) => <Grid key={i} item xs={1}><Typography textAlign='center'>{e}</Typography></Grid>)}
                {collection.map((e, i) =>
                    e === null
                        ? <Grid key={i} item xs={1}></Grid>
                        : <Grid key={i} item xs={1}>
                            <Chip sx={{ m: 1 }} label={e} variant="outlined" onClick={async () => { if (onElmClick) await onElmClick(e, i) }} />
                        </Grid>
                )}
            </Grid>
        </>
    )
}
