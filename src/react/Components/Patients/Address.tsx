import { useState } from 'react'
import { EditOutlined } from "@mui/icons-material";
import { Divider, Grid, IconButton, Stack, Typography } from "@mui/material";
import { t } from "i18next";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

export function Address({ defaultAddress, onChange }: { defaultAddress: string; onChange?: (address: string) => void | Promise<void> }) {
    const [editing, setEditing] = useState<boolean>(false)
    const [address, setAddress] = useState<string>(defaultAddress)

    return (
        <>
            <Grid container>
                <Grid item xs={12}>
                    <Stack direction='row' justifyContent='space-between' alignItems='center'>
                        <Typography variant='h5'>
                            {t('address')}
                        </Typography>

                        <Stack direction='row' alignItems='center'>
                            <Divider orientation='vertical' variant='middle' />
                            <IconButton onClick={() => setEditing(!editing)}>
                                <EditOutlined />
                            </IconButton>
                        </Stack>
                    </Stack>
                </Grid>
                <Grid item xs={12}>
                    {
                        editing
                            ? <ReactQuill
                                value={address}
                                onChange={(a) => {
                                    setAddress(a)
                                    if (onChange)
                                        onChange(a)
                                }}
                                theme="snow" />
                            :
                            <div
                                className="ql-editor"
                                dangerouslySetInnerHTML={{ __html: address }}
                            />
                    }
                </Grid>
            </Grid>
        </>
    )
}

