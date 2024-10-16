import { ReactNode, useEffect, useMemo, useState } from 'react'

import {
    ColumnDef,
    Table,
    VisibilityState,
    getCoreRowModel,
    useReactTable,
} from '@tanstack/react-table'
import { makeData, Person } from './makeData'

// needed for table body level scope DnD setup
import {
    DndContext,
    KeyboardSensor,
    MouseSensor,
    TouchSensor,
    closestCenter,
    type DragEndEvent,
    useSensor,
    useSensors,
} from '@dnd-kit/core'
import { restrictToHorizontalAxis } from '@dnd-kit/modifiers'
import {
    arrayMove,
    SortableContext,
    horizontalListSortingStrategy,
} from '@dnd-kit/sortable'

// needed for row & cell level scope DnD setup
import { useTheme } from '@mui/material'
import LoadingScreen from '../../LoadingScreen'
import { t } from 'i18next'
import { configAPI } from 'src/Electron/Configuration/renderer'
import { DraggableTableHeader } from './DraggableTableHeader'
import { DragAlongCell } from './DragAlongCell'
import { ColumnVisibilityButton } from './ColumnVisibilityButton'
import { DataGridContext, Density } from './Context'
import { DensityButton } from './DensityButton'
import { ExportButton } from './ExportButton'

export type DataGridTanStackProps = {
    configName: string,
    data: any[],
    headerNodes?: ReactNode[],
    footerNodes?: ReactNode[],
    pagination?: boolean,
    paginationLimitOptions?: number[],
    onPagination?: (paginationLimit: number, pageOffset: number) => Promise<void> | void,
    loading?: boolean
}

export function DataGridTanStack({
    configName,
    data,
    headerNodes = [],
    footerNodes = [],
    pagination = false,
    paginationLimitOptions = [10, 25, 50, 100],
    onPagination,
    loading = false
}: DataGridTanStackProps) {
    if (!data)
        data = useState(() => makeData(10))[0]

    const theme = useTheme()

    const columns = useMemo<ColumnDef<Person>[]>(
        () => [
            {
                accessorKey: 'firstName',
                cell: info => info.getValue(),
                id: 'firstName',
                enableHiding: true
            },
            {
                accessorFn: row => row.lastName,
                cell: info => info.getValue(),
                header: () => <span>Last Name</span>,
                id: 'lastName',
            },
            {
                accessorKey: 'age',
                header: () => 'Age',
                id: 'age',
            },
            {
                accessorKey: 'visits',
                header: () => <span>Visits</span>,
                id: 'visits',
            },
            {
                accessorKey: 'status',
                header: 'Status',
                id: 'status',
            },
            {
                accessorKey: 'progress',
                header: 'Profile Progress',
                id: 'progress',
            },
        ],
        []
    )
    const [columnOrder, setColumnOrder] = useState<string[]>(() => columns.map(c => c.id!))
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>()
    const [density, setDensity] = useState<Density>()

    const [table, setTable] = useState(useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        enableHiding: true,
        state: {
            columnOrder,
            columnVisibility
        },
        onColumnOrderChange: setColumnOrder,
        onColumnVisibilityChange: (updaterOrValue) => {
            let cv
            if (typeof updaterOrValue !== 'function')
                cv = updaterOrValue
            else
                cv = updaterOrValue(columnVisibility)

            setColumnVisibility(cv)
        }
    }))

    if (!headerNodes || headerNodes.length === 0)
        headerNodes = [
            <ColumnVisibilityButton />,
            <DensityButton />,
            <ExportButton />,
        ]

    function handleDragEnd(e: DragEndEvent) {
        const { active, over } = e

        if (!active || !over || active.id === over.id)
            return

        setColumnOrder(columnOrder => {
            const oldIndex = columnOrder.indexOf(active.id as string)
            const newIndex = columnOrder.indexOf(over.id as string)
            return arrayMove(columnOrder, oldIndex, newIndex)
        });

        (window as typeof window & { configAPI: configAPI; }).configAPI.readConfig()
            .then((c) => {
                if (!c.columnOrderModels)
                    c.columnOrderModels = {}

                c.columnOrderModels[configName] = columnOrder;

                (window as typeof window & { configAPI: configAPI; }).configAPI.writeConfig({ ...c })
            })
    }

    useEffect(() => {
        (window as typeof window & { configAPI: configAPI; }).configAPI.readConfig()
            .then((c) => {
                if (c?.columnVisibilityModels) {
                    table.setColumnVisibility(c.columnVisibilityModels[configName])
                    setColumnVisibility(c.columnVisibilityModels[configName])
                }

                if (c?.columnOrderModels) {
                    table.setColumnOrder(c.columnOrderModels[configName])
                    setColumnOrder(c.columnOrderModels[configName])
                }
            })
    }, [])

    const sensors = useSensors(useSensor(MouseSensor, {}), useSensor(TouchSensor, {}), useSensor(KeyboardSensor, {}))

    console.log('DataGridTanStack', { columnOrder, columnVisibility });


    return (
        <DataGridContext.Provider value={{ table, density: { value: density, set: setDensity } }}>
            {/* NOTE: This provider creates div elements, so don't nest inside of <table> elements */}
            <div style={{ padding: '1rem', height: '100%', }}>
                <DndContext
                    collisionDetection={closestCenter}
                    modifiers={[restrictToHorizontalAxis]}
                    onDragEnd={handleDragEnd}
                    sensors={sensors}
                >
                    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '0.5rem 0', overflow: 'auto', border: `1px solid ${theme.palette.grey[800]}`, borderRadius: `${theme.shape.borderRadius}px`, textWrap: 'nowrap' }}>
                        <div style={{ display: 'flex', flexDirection: 'row', padding: '0 0.5rem' }}>
                            {...headerNodes}
                        </div>
                        {loading
                            ? <LoadingScreen />
                            : (
                                data.length === 0
                                    ? <p style={{ textAlign: 'center' }}>{t('noData')}</p>
                                    : <div style={{ flexGrow: 2 }}>
                                        <table style={{ borderCollapse: 'collapse', minWidth: '100%' }}>
                                            <thead style={{ position: 'sticky', top: 0, userSelect: 'none' }}>
                                                {table.getHeaderGroups().map(headerGroup => (
                                                    <tr key={headerGroup.id} style={{ borderBottom: `1px solid ${theme.palette.grey[800]}` }}>
                                                        <SortableContext
                                                            items={columnOrder}
                                                            strategy={horizontalListSortingStrategy}
                                                        >
                                                            {headerGroup.headers.map(header => (
                                                                <DraggableTableHeader key={header.id} header={header} />
                                                            ))}
                                                        </SortableContext>
                                                    </tr>
                                                ))}
                                            </thead>
                                            <tbody>
                                                {table.getRowModel().rows.map((row, i, arr) => (
                                                    <tr key={row.id} style={{ borderBottom: i === (arr.length - 1) ? 0 : `1px solid ${theme.palette.grey[800]}`, textWrap: 'nowrap' }}>
                                                        {row.getVisibleCells().map(cell => (
                                                            <SortableContext
                                                                key={cell.id}
                                                                items={columnOrder}
                                                                strategy={horizontalListSortingStrategy}
                                                            >
                                                                <DragAlongCell key={cell.id} cell={cell} />
                                                            </SortableContext>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                            )
                        }
                        <div style={{ display: 'flex', flexDirection: 'row', padding: '0 0.5rem' }}>
                            {...footerNodes}
                        </div>
                    </div>
                </DndContext>
            </div>
        </DataGridContext.Provider>
    )
}
