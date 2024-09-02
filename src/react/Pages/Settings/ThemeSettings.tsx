import { darken, lighten, styled, ThemeOptions } from '@mui/material/styles';
import { ColorLensOutlined, ExpandMoreOutlined } from "@mui/icons-material"
import { Accordion, AccordionDetails, AccordionSummary, Button, IconButton, Menu, Stack } from "@mui/material"
import { useContext, useState } from "react";
import { ConfigurationContext } from '../../Contexts/ConfigurationContext';
import { HexAlphaColorPicker } from 'react-colorful';
import { t } from 'i18next';

export function ThemeSettings() {
    const c = useContext(ConfigurationContext)

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

    const [focusedColor, setFocusedColor] = useState<'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning' | 'success'>('primary')

    const [primaryColor, setPrimaryColor] = useState<string>(c.get.theme.palette.primary.main)
    const [secondaryColor, setSecondaryColor] = useState<string>(c.get.theme.palette.secondary.main)
    const [errorColor, setErrorColor] = useState<string>(c.get.theme.palette.error.main)
    const [infoColor, setInfoColor] = useState<string>(c.get.theme.palette.info.main)
    const [warningColor, setWarningColor] = useState<string>(c.get.theme.palette.warning.main)
    const [successColor, setSuccessColor] = useState<string>(c.get.theme.palette.success.main)

    console.log('ThemeSettings', { c, primaryColor, secondaryColor, errorColor, infoColor, warningColor, successColor, anchorEl, themeJson: JSON.stringify(c.get.theme, undefined, 4) })

    return (
        <>
            <Stack sx={{ width: '100%', p: 3 }} direction='column' spacing={2}>
                <Accordion defaultExpanded>
                    <AccordionSummary sx={{ color: primaryColor }} expandIcon={<ExpandMoreOutlined />}>
                        {t('primaryColor')}
                    </AccordionSummary>
                    <AccordionDetails>
                        <Stack sx={{ width: '100%', p: 3 }} direction='column' spacing={2} alignItems={'center'}>
                            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
                                <ColorLensOutlined />
                            </IconButton>

                            <Button fullWidth sx={{ backgroundColor: primaryColor }} variant='contained'>{t('main')}</Button>
                            <Button fullWidth sx={{ backgroundColor: lighten(primaryColor, 0.25) }} variant='contained'>{t('lightMode')}</Button>
                            <Button fullWidth sx={{ backgroundColor: darken(primaryColor, 0.25) }} variant='contained'>{t('darkMode')}</Button>
                        </Stack>
                    </AccordionDetails>
                </Accordion>

                <Accordion>
                    <AccordionSummary sx={{ color: secondaryColor }} expandIcon={<ExpandMoreOutlined />}>
                        {t('secondaryColor')}
                    </AccordionSummary>
                    <AccordionDetails>
                        <Stack sx={{ width: '100%', p: 3 }} direction='column' spacing={2} alignItems={'center'}>
                            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
                                <ColorLensOutlined />
                            </IconButton>

                            <Button fullWidth sx={{ backgroundColor: secondaryColor }} variant='contained'>{t('main')}</Button>
                            <Button fullWidth sx={{ backgroundColor: lighten(secondaryColor, 0.25) }} variant='contained'>{t('lightMode')}</Button>
                            <Button fullWidth sx={{ backgroundColor: darken(secondaryColor, 0.25) }} variant='contained'>{t('darkMode')}</Button>
                        </Stack>
                    </AccordionDetails>
                </Accordion>

                <Accordion>
                    <AccordionSummary sx={{ color: errorColor }} expandIcon={<ExpandMoreOutlined />}>
                        {t('errorColor')}
                    </AccordionSummary>
                    <AccordionDetails>
                        <Stack sx={{ width: '100%', p: 3 }} direction='column' spacing={2} alignItems={'center'}>

                            <IconButton onClick={(e) => { setFocusedColor('error'); setAnchorEl(e.currentTarget) }}>
                                <ColorLensOutlined />
                            </IconButton>

                            <Button fullWidth sx={{ backgroundColor: errorColor }} variant='contained'>{t('main')}</Button>
                            <Button fullWidth sx={{ backgroundColor: lighten(errorColor, 0.25) }} variant='contained'>{t('lightMode')}</Button>
                            <Button fullWidth sx={{ backgroundColor: darken(errorColor, 0.25) }} variant='contained'>{t('darkMode')}</Button>
                        </Stack>
                    </AccordionDetails>
                </Accordion>

                <Accordion>
                    <AccordionSummary sx={{ color: infoColor }} expandIcon={<ExpandMoreOutlined />}>
                        {t('infoColor')}
                    </AccordionSummary>
                    <AccordionDetails>
                        <Stack sx={{ width: '100%', p: 3 }} direction='column' spacing={2} alignItems={'center'}>
                            <IconButton onClick={(e) => { setFocusedColor('info'); setAnchorEl(e.currentTarget) }}>
                                <ColorLensOutlined />
                            </IconButton>

                            <Button fullWidth sx={{ backgroundColor: infoColor }} variant='contained'>{t('main')}</Button>
                            <Button fullWidth sx={{ backgroundColor: lighten(infoColor, 0.25) }} variant='contained'>{t('lightMode')}</Button>
                            <Button fullWidth sx={{ backgroundColor: darken(infoColor, 0.25) }} variant='contained'>{t('darkMode')}</Button>
                        </Stack>
                    </AccordionDetails>
                </Accordion>

                <Accordion>
                    <AccordionSummary sx={{ color: warningColor }} expandIcon={<ExpandMoreOutlined />}>
                        {t('warningColor')}
                    </AccordionSummary>
                    <AccordionDetails>
                        <Stack sx={{ width: '100%', p: 3 }} direction='column' spacing={2} alignItems={'center'}>
                            <IconButton onClick={(e) => { setFocusedColor('warning'); setAnchorEl(e.currentTarget) }}>
                                <ColorLensOutlined />
                            </IconButton>

                            <Button fullWidth sx={{ backgroundColor: warningColor }} variant='contained'>{t('main')}</Button>
                            <Button fullWidth sx={{ backgroundColor: lighten(warningColor, 0.25) }} variant='contained'>{t('lightMode')}</Button>
                            <Button fullWidth sx={{ backgroundColor: darken(warningColor, 0.25) }} variant='contained'>{t('darkMode')}</Button>
                        </Stack>
                    </AccordionDetails>
                </Accordion>

                <Accordion>
                    <AccordionSummary sx={{ color: successColor }} expandIcon={<ExpandMoreOutlined />}>
                        {t('successColor')}
                    </AccordionSummary>
                    <AccordionDetails>
                        <Stack sx={{ width: '100%', p: 3 }} direction='column' spacing={2} alignItems={'center'}>
                            <IconButton onClick={(e) => { setFocusedColor('success'); setAnchorEl(e.currentTarget) }}>
                                <ColorLensOutlined />
                            </IconButton>

                            <Button fullWidth sx={{ backgroundColor: successColor }} variant='contained'>{t('main')}</Button>
                            <Button fullWidth sx={{ backgroundColor: lighten(successColor, 0.25) }} variant='contained'>{t('lightMode')}</Button>
                            <Button fullWidth sx={{ backgroundColor: darken(successColor, 0.25) }} variant='contained'>{t('darkMode')}</Button>
                        </Stack>
                    </AccordionDetails>
                </Accordion>
            </Stack>

            <Menu
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
                anchorEl={anchorEl}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}

                sx={{ mt: '40px' }}
            >
                <Stack direction='column' alignItems='start' spacing={1} sx={{ m: 0, p: 2 }}>
                    <HexAlphaColorPicker color={primaryColor} onChange={(color) => {
                        const options: ThemeOptions = c.get.themeOptions

                        switch (focusedColor) {
                            case 'primary':
                                setPrimaryColor(color)
                                options.palette = {
                                    ...c.get.themeOptions.palette,
                                    primary: {
                                        main: color
                                    }
                                }
                                break;

                            case 'secondary':
                                setSecondaryColor(color)
                                options.palette = {
                                    ...c.get.themeOptions.palette,
                                    secondary: {
                                        main: color
                                    }
                                }
                                break;

                            case 'success':
                                setSuccessColor(color)
                                options.palette = {
                                    ...c.get.themeOptions.palette,
                                    success: {
                                        main: color
                                    }
                                }
                                break;

                            case 'error':
                                setErrorColor(color)
                                options.palette = {
                                    ...c.get.themeOptions.palette,
                                    error: {
                                        main: color
                                    }
                                }
                                break;

                            case 'info':
                                setInfoColor(color)
                                options.palette = {
                                    ...c.get.themeOptions.palette,
                                    info: {
                                        main: color
                                    }
                                }
                                break;

                            case 'warning':
                                setWarningColor(color)
                                options.palette = {
                                    ...c.get.themeOptions.palette,
                                    warning: {
                                        main: color
                                    }
                                }
                                break;

                            default:
                                break;
                        }

                        c.set.replaceTheme(options)
                    }} />
                </Stack>
            </Menu>
        </>
    )
}

