import { useState } from 'react'
import { EditOutlined } from "@mui/icons-material";
import { Divider, Grid, IconButton, Modal, Paper, Slide, Stack, Typography } from "@mui/material";
import { t } from "i18next";

export function Address({ open, onClose, defaultAddress, onChange }: { open: boolean, onClose?: (event: {}, reason: "backdropClick" | "escapeKeyDown") => void, defaultAddress: string; onChange?: (address: string) => void | Promise<void> }) {
    const [editing, setEditing] = useState<boolean>(false)
    const [address, setAddress] = useState<string>(defaultAddress)

    return (
        <>
            <Modal
                onClose={onClose}
                open={open}
                closeAfterTransition
                disableAutoFocus
                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', top: '2rem' }}
                slotProps={{ backdrop: { sx: { top: '2rem' } } }}
            >
                <Slide direction={open ? 'up' : 'down'} in={open} timeout={250}>
                    <Paper sx={{ padding: '0.5rem 2rem', overflow: 'auto' }}>
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
                                {/* {
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
                                } */}
                            </Grid>
                        </Grid>
                    </Paper>
                </Slide>
            </Modal>
        </>
    )
}

