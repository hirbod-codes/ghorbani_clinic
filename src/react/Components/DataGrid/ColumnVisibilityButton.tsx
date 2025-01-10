import { ReactNode, useContext, useState } from 'react'
import { t } from 'i18next'
import { ViewWeekOutlined } from '@mui/icons-material'
import { DataGridContext } from './Context'
import { DropdownMenu } from '../Base/DropdownMenu'
import { Button } from '../../shadcn/components/ui/button'
import { Switch } from '../Base/Switch'

export function ColumnVisibilityButton() {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
    const open = Boolean(anchorEl)

    const table = useContext(DataGridContext)!.table!

    return (
        <DropdownMenu
            trigger={
                <Button isIcon>
                    <ViewWeekOutlined />{t('Columns.columns')}
                </Button>
            }
            contents={table.getAllColumns().map((column, i): { type: 'item', content: ReactNode } => ({
                type: 'item',
                content: <Switch
                    label={t(`Columns.${column.id}`)}
                    labelId={t(`Columns.${column.id}`)}
                    checked={table.getVisibleFlatColumns().find((c) => c.id === column.id) !== undefined}
                    onChange={(e) => {
                        const entries = table.getAllColumns().map(c => [c.id, column.id !== c.id ? (table.getVisibleFlatColumns().find(f => f.id === c.id) !== undefined) : e.currentTarget.value])
                        table.setColumnVisibility(Object.fromEntries(entries))
                    }}
                />
            }))}
        />
    )
}
