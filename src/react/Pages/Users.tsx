import { useState } from "react";
import { Grid, List, ListItemButton, ListItemIcon, ListItemText, Paper } from "@mui/material";
import { t } from "i18next";
import { roles } from "../../Electron/Database/Repositories/Auth/dev-permissions";

export function Users() {
    const filteredRoles = Object.entries(roles).filter(arr => arr[1] !== roles.ADMIN).map(arr => arr[1])

    const [role, setRole] = useState<string>(filteredRoles[0])

    return (
        <>
            <Grid container spacing={1} sx={{ p: 2 }} height={'100%'}>
                <Grid item xs={2}>
                    <Paper sx={{ p: 1, height: '100%' }}>
                        <List>
                            {filteredRoles.map(r =>
                                <ListItemButton selected={role === r} onClick={() => { setRole(r) }}>
                                    <ListItemText primary={t(r)} />
                                </ListItemButton>
                            )}
                        </List>
                    </Paper>
                </Grid>
                <Grid item xs={10}>
                    <Paper sx={{ p: 1, height: '100%' }}>
                    </Paper>
                </Grid>
            </Grid>
        </>
    )
}
