import { useContext, useRef, useState } from 'react'
import { t } from 'i18next'
import { ViewWeekOutlined } from '@mui/icons-material'
import { DataGridContext } from './Context'
import { DropdownMenu } from '../Base/DropdownMenu'
import { Button } from '../../Components/Base/Button'
import { Switch } from '../Base/Switch'
import { Stack } from '../Base/Stack'

export function ColumnVisibilityButton() {
    const [open, setOpen] = useState<boolean>(false)

    const ref = useRef<HTMLButtonElement>(null)

    const table = useContext(DataGridContext)!.table!

    return (
        <>
            <Button buttonRef={ref} variant='outline' onClick={() => setOpen(true)}>
                <ViewWeekOutlined />{t('Columns.columns')}
            </Button>

            <DropdownMenu
                anchorRef={ref}
                onOpenChange={(b) => { if (!b) setOpen(false) }}
                open={open}
                containerProps={{ className: 'p-2 rounded-md' }}
            >
                <Stack direction='vertical'>
                    {
                        table.getAllColumns().map((column, i) =>
                            <Switch
                                key={i}
                                label={t(`Columns.${column.id}`)}
                                labelId={t(`Columns.${column.id}`)}
                                checked={table.getVisibleFlatColumns().find((c) => c.id === column.id) !== undefined}
                                onCheckedChange={(e) => {
                                    const entries = table.getAllColumns().map(c => [c.id, column.id !== c.id ? (table.getVisibleFlatColumns().find(f => f.id === c.id) !== undefined) : e])
                                    table.setColumnVisibility(Object.fromEntries(entries))
                                }}
                            />
                        )
                    }
                </Stack>
            </DropdownMenu>
        </>
    )
}
