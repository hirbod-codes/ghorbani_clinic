import { Button, Menu, MenuItem } from "@mui/material";
import { t } from "i18next";
import { MouseEvent, useContext, useState } from "react";
import { DataGridContext } from "./Context";
import { MenuOutlined } from "@mui/icons-material";

export function DensityButton() {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
    const open = Boolean(anchorEl)

    const ctx = useContext(DataGridContext)

    return (
        <>
            <Button onClick={(event: MouseEvent<HTMLButtonElement>) => setAnchorEl(event.currentTarget)} startIcon={<MenuOutlined />}>
                {t('DataGrid.Density')}
            </Button>
            <Menu anchorEl={anchorEl} open={open} onClose={() => setAnchorEl(null)}>
                <MenuItem onClick={() => {
                    ctx.density.set('compact')
                    setAnchorEl(null);
                }}>
                    {t('DataGrid.compact')}
                </MenuItem>
                <MenuItem onClick={() => {
                    ctx.density.set('standard')
                    setAnchorEl(null);
                }}>
                    {t('DataGrid.standard')}
                </MenuItem>
                <MenuItem onClick={() => {
                    ctx.density.set('comfortable')
                    setAnchorEl(null);
                }}>
                    {t('DataGrid.comfortable')}
                </MenuItem>
            </Menu>
        </>
    )
}

