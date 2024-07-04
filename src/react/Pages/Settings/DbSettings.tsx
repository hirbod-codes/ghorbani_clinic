import { Box } from '@mui/material'
import DbSettingsForm from '../../../react/Components/Settings/DbSettingsForm'

export function DbSettings() {
    return (
        <>
            <Box m={1} p={2}>
                <DbSettingsForm noTitle />
            </Box>
        </>
    )
}

