import { MouseEvent, useContext, useState } from 'react'
import { Button, Checkbox, FormControlLabel, FormGroup, Menu } from '@mui/material'
import { t } from 'i18next'
import { DataGridContext } from './Context'
import { ViewWeekOutlined } from '@mui/icons-material'

export function ColumnVisibilityButton() {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
    const open = Boolean(anchorEl)

    const table = useContext(DataGridContext).table

    console.log('ColumnVisibilityButton', table, table.getVisibleFlatColumns())

    return (
        <>
            <Button onClick={(event: MouseEvent<HTMLButtonElement>) => setAnchorEl(event.currentTarget)} startIcon={<ViewWeekOutlined />}>
                {t('Columns.Columns')}
            </Button>
            <Menu anchorEl={anchorEl} open={open} onClose={() => setAnchorEl(null)}>
                {table.getAllColumns().map((column, i) =>
                    <FormGroup key={i}>
                        <FormControlLabel
                            label={t(`Columns.${column.id}`)}
                            control={
                                <Checkbox
                                    checked={table.getVisibleFlatColumns().find((c) => c.id === column.id) !== undefined}
                                    onChange={(e) => {
                                        const entries = table.getAllColumns().map(c => [c.id, column.id !== c.id ? (table.getVisibleFlatColumns().find(f => f.id === c.id) !== undefined) : e.target.checked])
                                        table.setColumnVisibility(Object.fromEntries(entries))
                                    }}
                                />
                            }
                        />
                    </FormGroup>
                )}
            </Menu>
        </>
    )
}
