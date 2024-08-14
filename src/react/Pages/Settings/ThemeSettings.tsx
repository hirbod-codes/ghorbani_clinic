import { createTheme, styled } from '@mui/material/styles';
import { AddOutlined } from "@mui/icons-material"
import { Box, Button, Divider, Stack } from "@mui/material"
import { useContext, useState } from "react";
import { ConfigurationContext } from '../../Contexts/ConfigurationContext';

const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
});

export function ThemeSettings() {
    const c = useContext(ConfigurationContext)

    const [file, setFile] = useState<File | undefined>(undefined)

    console.log('ThemeSettings', { file })

    if (file !== undefined) {
        const fr = new FileReader()
        fr.onloadend = (e) => {
            console.log(JSON.parse(fr.result as string))
        }
        fr.readAsText(new Blob([file]))
    }

    return (
        <>
            <div ></div>
            <Box
                sx={{ width: '50%', height: '50%', border: '1px solid red' }}
                onDragEnter={(dragEnterEvent) => {
                    let event = dragEnterEvent;
                    event.stopPropagation();
                    event.preventDefault();
                }}
                onDragLeave={(dragLeaveEvent) => {
                    let event = dragLeaveEvent;
                    event.stopPropagation();
                    event.preventDefault();
                }}
                onDragOver={(dragOverEvent) => {
                    let event = dragOverEvent;
                    event.stopPropagation();
                    event.preventDefault();
                }}
                onDrop={(dragEvent) => {
                    dragEvent.preventDefault();
                    dragEvent.stopPropagation();
                    let fs = dragEvent.dataTransfer.files
                    console.log({ dragEvent, files: fs, data: dragEvent.dataTransfer.getData('text') })
                    setFile(fs[0])
                }}
            >
                aaaa
            </Box>
            {/* Files */}
            <Stack direction='row' spacing={1} divider={<Divider orientation='vertical' variant='middle' flexItem />} alignItems='center'>
                <Button
                    component="label"
                    sx={{ width: 'fit-content' }}
                    variant='outlined'
                    role={undefined}
                    tabIndex={-1}
                    startIcon={<AddOutlined />}
                >
                    Add documents
                    <VisuallyHiddenInput type="file" multiple={false} onChange={async (e) => {
                        setFile(e.target.files[0])

                        const fr = new FileReader()
                        fr.onloadend = (e) => {
                            console.log(JSON.parse(fr.result as string))

                            const themeOptions = JSON.parse(fr.result as string)
                            console.log({ themeOptions })

                            c.set.updateThemeCore(createTheme({
                                ...c.get.theme,
                                palette: {
                                    ...c.get.theme.palette,
                                    primary: {
                                        main: themeOptions.schemes.light.primary,
                                        light: themeOptions.schemes.light.primary,
                                        dark: themeOptions.schemes.dark.primary,
                                    }
                                }
                            }))
                        }
                        fr.readAsText(new Blob([file]))

                    }} />
                </Button>
            </Stack>
        </>
    )
}

