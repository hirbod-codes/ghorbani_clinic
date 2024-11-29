import { darken, lighten, ThemeOptions } from '@mui/material/styles';
import { ColorLensOutlined, ExpandMoreOutlined } from "@mui/icons-material"
import { Accordion, AccordionDetails, AccordionSummary, Button, FormControlLabel, FormGroup, IconButton, Menu, Stack, Switch, TextField } from "@mui/material"
import { memo, useContext, useState } from "react";
import { ConfigurationContext } from '../../Contexts/ConfigurationContext';
import { HexAlphaColorPicker } from 'react-colorful';
import { t } from 'i18next';
import { configAPI } from '../../../Electron/Configuration/renderer';
import { RESULT_EVENT_NAME } from '../../Contexts/ResultWrapper';
import { publish } from '../../Lib/Events';
import { PaletteTonalOffset } from '@mui/material/styles/createPalette';

export const ThemeSettings = memo(function ThemeSettings() {
    const c = useContext(ConfigurationContext)

    const [showGradientBackground, setShowGradientBackground] = useState<boolean>(c.get.showGradientBackground ?? false)
    const [loadingGradientBackground, setLoadingGradientBackground] = useState(false)

    const [colorPickerValue, setColorPickerValue] = useState<string>('#000000')

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

    const [focusedColor, setFocusedColor] = useState<'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning' | 'success' | 'background'>('primary')

    // string is added so we can input float numbers in text fields
    const [contrastThreshold, setContrastThreshold] = useState<number | string>(c.get.theme.palette.contrastThreshold)
    const [tonalOffset, setTonalOffset] = useState<PaletteTonalOffset | string>(c.get.theme.palette.tonalOffset)

    const [primaryColor, setPrimaryColor] = useState<string>(c.get.theme.palette.primary.main)
    const [secondaryColor, setSecondaryColor] = useState<string>(c.get.theme.palette.secondary.main)
    const [errorColor, setErrorColor] = useState<string>(c.get.theme.palette.error.main)
    const [infoColor, setInfoColor] = useState<string>(c.get.theme.palette.info.main)
    const [warningColor, setWarningColor] = useState<string>(c.get.theme.palette.warning.main)
    const [successColor, setSuccessColor] = useState<string>(c.get.theme.palette.success.main)
    const [backgroundColor, setBackgroundColor] = useState<string>(c.get.theme.palette.background.default)

    const updateShowGradientBackground = async (v: boolean) => {
        setLoadingGradientBackground(true)

        const conf = await (window as typeof window & { configAPI: configAPI }).configAPI.readConfig()

        conf.configuration.showGradientBackground = v;

        await (window as typeof window & { configAPI: configAPI }).configAPI.writeConfig(conf)
        setLoadingGradientBackground(false)

        c.set.setShowGradientBackground(v)
        setShowGradientBackground(v)
    }

    console.log('ThemeSettings', { c, contrastThreshold, tonalOffset, primaryColor, secondaryColor, errorColor, infoColor, warningColor, successColor, anchorEl, themeJson: JSON.stringify(c.get.theme, undefined, 4) })

    return (
        <>
            <Stack sx={{ height: '100%', width: '100%', p: 3, overflow: 'auto' }} direction='column' spacing={2}>

                <FormGroup>
                    <FormControlLabel
                        control={<Switch checked={showGradientBackground} onChange={(e) => updateShowGradientBackground(e.target.checked)} />}
                        label={t('ThemeSettings.showGradientBackground')}
                    />
                </FormGroup>

                <TextField
                    variant='standard'
                    type='text'
                    label={t('ThemeSettings.contrastThreshold')}
                    value={contrastThreshold}
                    onChange={(e) => {
                        setContrastThreshold(e.target.value)
                        let value
                        try {
                            value = Number.parseFloat(e.target.value)
                            if (Number.isNaN(value))
                                throw new Error()
                        } catch (error) {
                            publish(RESULT_EVENT_NAME, {
                                severity: 'error',
                                message: t('ThemeSettings.invalidNumber')
                            })
                            return
                        }

                        const options: ThemeOptions = c.get.themeOptions

                        options.palette.contrastThreshold = value
                        c.set.replaceTheme(options)

                    }}
                />

                <TextField
                    variant='standard'
                    type='text'
                    label={t('ThemeSettings.tonalOffset')}
                    value={tonalOffset}
                    onChange={(e) => {
                        setTonalOffset(e.target.value)
                        let value
                        try {
                            value = Number.parseFloat(e.target.value)
                            if (Number.isNaN(value))
                                throw new Error()
                        } catch (error) {
                            publish(RESULT_EVENT_NAME, {
                                severity: 'error',
                                message: t('ThemeSettings.invalidNumber')
                            })
                            return
                        }

                        const options: ThemeOptions = c.get.themeOptions

                        options.palette.tonalOffset = value
                        c.set.replaceTheme(options)
                    }}
                />

                <Accordion defaultExpanded>
                    <AccordionSummary sx={{ color: primaryColor }} expandIcon={<ExpandMoreOutlined />}>
                        {t('ThemeSettings.primaryColor')}
                    </AccordionSummary>
                    <AccordionDetails>
                        <Stack sx={{ width: '100%', p: 3 }} direction='column' spacing={2} alignItems={'center'}>
                            <IconButton onClick={(e) => { setColorPickerValue(primaryColor); setFocusedColor('primary'); setAnchorEl(e.currentTarget) }}>
                                <ColorLensOutlined />
                            </IconButton>

                            <Button fullWidth sx={{ backgroundColor: primaryColor }} variant='contained'>{t('ThemeSettings.main')}</Button>
                            <Button fullWidth sx={{ backgroundColor: lighten(primaryColor, 0.25) }} variant='contained'>{t('ThemeSettings.lightMode')}</Button>
                            <Button fullWidth sx={{ backgroundColor: darken(primaryColor, 0.25) }} variant='contained'>{t('ThemeSettings.darkMode')}</Button>
                        </Stack>
                    </AccordionDetails>
                </Accordion>

                <Accordion>
                    <AccordionSummary sx={{ color: secondaryColor }} expandIcon={<ExpandMoreOutlined />}>
                        {t('ThemeSettings.secondaryColor')}
                    </AccordionSummary>
                    <AccordionDetails>
                        <Stack sx={{ width: '100%', p: 3 }} direction='column' spacing={2} alignItems={'center'}>
                            <IconButton onClick={(e) => { setColorPickerValue(secondaryColor); setFocusedColor('secondary'); setAnchorEl(e.currentTarget) }}>
                                <ColorLensOutlined />
                            </IconButton>

                            <Button fullWidth sx={{ backgroundColor: secondaryColor }} variant='contained'>{t('ThemeSettings.main')}</Button>
                            <Button fullWidth sx={{ backgroundColor: lighten(secondaryColor, 0.25) }} variant='contained'>{t('ThemeSettings.lightMode')}</Button>
                            <Button fullWidth sx={{ backgroundColor: darken(secondaryColor, 0.25) }} variant='contained'>{t('ThemeSettings.darkMode')}</Button>
                        </Stack>
                    </AccordionDetails>
                </Accordion>

                <Accordion>
                    <AccordionSummary sx={{ color: errorColor }} expandIcon={<ExpandMoreOutlined />}>
                        {t('ThemeSettings.errorColor')}
                    </AccordionSummary>
                    <AccordionDetails>
                        <Stack sx={{ width: '100%', p: 3 }} direction='column' spacing={2} alignItems={'center'}>

                            <IconButton onClick={(e) => { setColorPickerValue(errorColor); setFocusedColor('error'); setAnchorEl(e.currentTarget) }}>
                                <ColorLensOutlined />
                            </IconButton>

                            <Button fullWidth sx={{ backgroundColor: errorColor }} variant='contained'>{t('ThemeSettings.main')}</Button>
                            <Button fullWidth sx={{ backgroundColor: lighten(errorColor, 0.25) }} variant='contained'>{t('ThemeSettings.lightMode')}</Button>
                            <Button fullWidth sx={{ backgroundColor: darken(errorColor, 0.25) }} variant='contained'>{t('ThemeSettings.darkMode')}</Button>
                        </Stack>
                    </AccordionDetails>
                </Accordion>

                <Accordion>
                    <AccordionSummary sx={{ color: infoColor }} expandIcon={<ExpandMoreOutlined />}>
                        {t('ThemeSettings.infoColor')}
                    </AccordionSummary>
                    <AccordionDetails>
                        <Stack sx={{ width: '100%', p: 3 }} direction='column' spacing={2} alignItems={'center'}>
                            <IconButton onClick={(e) => { setColorPickerValue(infoColor); setFocusedColor('info'); setAnchorEl(e.currentTarget) }}>
                                <ColorLensOutlined />
                            </IconButton>

                            <Button fullWidth sx={{ backgroundColor: infoColor }} variant='contained'>{t('ThemeSettings.main')}</Button>
                            <Button fullWidth sx={{ backgroundColor: lighten(infoColor, 0.25) }} variant='contained'>{t('ThemeSettings.lightMode')}</Button>
                            <Button fullWidth sx={{ backgroundColor: darken(infoColor, 0.25) }} variant='contained'>{t('ThemeSettings.darkMode')}</Button>
                        </Stack>
                    </AccordionDetails>
                </Accordion>

                <Accordion>
                    <AccordionSummary sx={{ color: warningColor }} expandIcon={<ExpandMoreOutlined />}>
                        {t('ThemeSettings.warningColor')}
                    </AccordionSummary>
                    <AccordionDetails>
                        <Stack sx={{ width: '100%', p: 3 }} direction='column' spacing={2} alignItems={'center'}>
                            <IconButton onClick={(e) => { setColorPickerValue(warningColor); setFocusedColor('warning'); setAnchorEl(e.currentTarget) }}>
                                <ColorLensOutlined />
                            </IconButton>

                            <Button fullWidth sx={{ backgroundColor: warningColor }} variant='contained'>{t('ThemeSettings.main')}</Button>
                            <Button fullWidth sx={{ backgroundColor: lighten(warningColor, 0.25) }} variant='contained'>{t('ThemeSettings.lightMode')}</Button>
                            <Button fullWidth sx={{ backgroundColor: darken(warningColor, 0.25) }} variant='contained'>{t('ThemeSettings.darkMode')}</Button>
                        </Stack>
                    </AccordionDetails>
                </Accordion>

                <Accordion>
                    <AccordionSummary sx={{ color: successColor }} expandIcon={<ExpandMoreOutlined />}>
                        {t('ThemeSettings.successColor')}
                    </AccordionSummary>
                    <AccordionDetails>
                        <Stack sx={{ width: '100%', p: 3 }} direction='column' spacing={2} alignItems={'center'}>
                            <IconButton onClick={(e) => { setColorPickerValue(successColor); setFocusedColor('success'); setAnchorEl(e.currentTarget) }}>
                                <ColorLensOutlined />
                            </IconButton>

                            <Button fullWidth sx={{ backgroundColor: successColor }} variant='contained'>{t('ThemeSettings.main')}</Button>
                            <Button fullWidth sx={{ backgroundColor: lighten(successColor, 0.25) }} variant='contained'>{t('ThemeSettings.lightMode')}</Button>
                            <Button fullWidth sx={{ backgroundColor: darken(successColor, 0.25) }} variant='contained'>{t('ThemeSettings.darkMode')}</Button>
                        </Stack>
                    </AccordionDetails>
                </Accordion>

                {/* <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreOutlined />}>
                        {t('ThemeSettings.backgroundColor')}
                    </AccordionSummary>
                    <AccordionDetails>
                        <Stack sx={{ width: '100%', p: 3 }} direction='column' spacing={2} alignItems={'center'}>
                            <IconButton onClick={(e) => { setColorPickerValue(backgroundColor); setFocusedColor('background'); setAnchorEl(e.currentTarget) }}>
                                <ColorLensOutlined />
                            </IconButton>

                            <Button fullWidth sx={{ backgroundColor: backgroundColor }} variant='contained'></Button>
                        </Stack>
                    </AccordionDetails>
                </Accordion> */}
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
                    <HexAlphaColorPicker color={colorPickerValue} onChange={(color) => {
                        const options: ThemeOptions = c.get.themeOptions

                        switch (focusedColor) {
                            case 'primary':
                                setPrimaryColor(color)
                                options.palette.primary = { main: color }
                                break;

                            case 'secondary':
                                setSecondaryColor(color)
                                options.palette.secondary = { main: color }
                                break;

                            case 'success':
                                setSuccessColor(color)
                                options.palette.success = { main: color }
                                break;

                            case 'error':
                                setErrorColor(color)
                                options.palette.error = { main: color }
                                break;

                            case 'info':
                                setInfoColor(color)
                                options.palette.info = { main: color }
                                break;

                            case 'warning':
                                setWarningColor(color)
                                options.palette.warning = { main: color }
                                break;

                            case 'background':
                                // setBackgroundColor(color)
                                // options.palette.background = { default: color, paper: color }
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
})

