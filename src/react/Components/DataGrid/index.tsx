import { Fragment, ReactNode, useEffect, useMemo, useState } from 'react'

import {
    ColumnDef,
    PaginationState,
    VisibilityState,
    getCoreRowModel,
    getPaginationRowModel,
    useReactTable,
} from '@tanstack/react-table'

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
    horizontalListSortingStrategy
} from '@dnd-kit/sortable'

// needed for row & cell level scope DnD setup
import { Stack, useTheme } from '@mui/material'
import { t } from 'i18next'
import { configAPI } from 'src/Electron/Configuration/renderer'
import { DraggableTableHeader } from './DraggableTableHeader'
import { DragAlongCell } from './DragAlongCell'
import { ColumnVisibilityButton } from './ColumnVisibilityButton'
import { DataGridContext, Density } from './Context'
import { DensityButton } from './DensityButton'
import { ExportButton } from './ExportButton'
import { Pagination } from './Pagination'
import { getColumns } from './helpers'
import LoadingScreen from '../LoadingScreen'
import { AnimatePresence } from 'framer-motion'

export type DataGridProps = {
    configName: string,
    data: any[],
    orderedColumnsFields?: string[];
    overWriteColumns?: ColumnDef<any>[];
    additionalColumns?: ColumnDef<any>[];
    prependHeaderNodes?: ReactNode[],
    prependFooterNodes?: ReactNode[],
    headerNodes?: ReactNode[],
    footerNodes?: ReactNode[],
    appendHeaderNodes?: ReactNode[],
    appendFooterNodes?: ReactNode[],
    hasPagination?: boolean,
    paginationLimitOptions?: number[],
    onPagination?: (paginationLimit: number, pageOffset: number) => Promise<boolean> | boolean,
    loading?: boolean
}

export function DataGrid({
    configName,
    data,
    orderedColumnsFields = [],
    overWriteColumns = [],
    additionalColumns = [],
    prependHeaderNodes = [],
    prependFooterNodes = [],
    headerNodes = [],
    footerNodes = [],
    appendHeaderNodes = [],
    appendFooterNodes = [],
    hasPagination = false,
    paginationLimitOptions = [10, 25, 50, 100],
    onPagination,
    loading = false
}: DataGridProps) {
    const theme = useTheme()

    const columns = useMemo<ColumnDef<any>[]>(() => getColumns(data, overWriteColumns, additionalColumns, orderedColumnsFields), [])

    const [density, setDensity] = useState<Density>('compact')
    const [columnOrder, setColumnOrder] = useState<string[]>((columns ?? []).map(c => c.id))
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})

    const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: paginationLimitOptions[0], })

    const [table, setTable] = useState(useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        enableHiding: true,
        state: {
            columnOrder,
            columnVisibility,
            pagination: hasPagination && !onPagination ? pagination : undefined
        },
        onColumnOrderChange: async (updaterOrValue) => {
            let co
            if (typeof updaterOrValue !== 'function')
                co = updaterOrValue
            else
                co = updaterOrValue(undefined)

            const c = await (window as typeof window & { configAPI: configAPI; }).configAPI.readConfig()

            if (!c.columnOrderModels)
                c.columnOrderModels = {}

            c.columnOrderModels[configName] = co;
            (window as typeof window & { configAPI: configAPI; }).configAPI.writeConfig(c)

            setColumnOrder(co);
        },
        onColumnVisibilityChange: async (updaterOrValue) => {
            let cv
            if (typeof updaterOrValue !== 'function')
                cv = updaterOrValue
            else
                cv = updaterOrValue(undefined)

            const c = await (window as typeof window & { configAPI: configAPI; }).configAPI.readConfig()

            if (!c.columnVisibilityModels)
                c.columnVisibilityModels = {}

            c.columnVisibilityModels[configName] = cv;
            (window as typeof window & { configAPI: configAPI; }).configAPI.writeConfig(c)

            setColumnVisibility(cv)
        },
        onPaginationChange: hasPagination && !onPagination ? setPagination : undefined,
        getPaginationRowModel: hasPagination && !onPagination ? getPaginationRowModel() : undefined,
    }))

    if (!headerNodes || headerNodes.length === 0)
        headerNodes = [
            <ColumnVisibilityButton />,
            <DensityButton />,
            <ExportButton />,
        ]

    if (prependHeaderNodes && prependHeaderNodes.length !== 0)
        headerNodes = prependHeaderNodes.concat(headerNodes)
    if (appendHeaderNodes && appendHeaderNodes.length !== 0)
        headerNodes = headerNodes.concat(appendHeaderNodes)

    if (hasPagination === true && (!footerNodes || footerNodes.length === 0))
        footerNodes = [
            <Pagination paginationLimitOptions={paginationLimitOptions} onPagination={onPagination} setPaginationLimitChange={(size) => {
                setPagination({ pageIndex: pagination.pageIndex, pageSize: size })
                if (onPagination)
                    onPagination(size, pagination.pageIndex)
            }} />
        ]

    if (prependFooterNodes && prependFooterNodes.length !== 0)
        footerNodes = prependFooterNodes.concat(footerNodes)
    if (appendFooterNodes && appendFooterNodes.length !== 0)
        footerNodes = footerNodes.concat(appendFooterNodes)

    function handleDragEnd(e: DragEndEvent) {
        const { active, over } = e

        if (!active || !over || active.id === over.id)
            return

        const oldIndex = columnOrder.indexOf(active.id as string)
        const newIndex = columnOrder.indexOf(over.id as string)
        const newColumnOrder = arrayMove(columnOrder, oldIndex, newIndex)
        setColumnOrder(newColumnOrder);
        table.setColumnOrder(newColumnOrder)
    }

    useEffect(() => {
        (window as typeof window & { configAPI: configAPI; }).configAPI.readConfig()
            .then((c) => {
                if (c?.columnVisibilityModels && c.columnVisibilityModels[configName]) {
                    table.setColumnVisibility(c.columnVisibilityModels[configName])
                    setColumnVisibility(c.columnVisibilityModels[configName])
                }

                if (c?.columnOrderModels && c.columnOrderModels[configName]) {
                    table.setColumnOrder(c.columnOrderModels[configName])
                    setColumnOrder(c.columnOrderModels[configName])
                }

                if (c?.tableDensity && c?.tableDensity[configName])
                    setDensity(c?.tableDensity[configName])
            })
    }, [])

    const sensors = useSensors(useSensor(MouseSensor, {}), useSensor(TouchSensor, {}), useSensor(KeyboardSensor, {}))

    console.log('DataGrid', { data, columns, columnOrder, headerNodes, footerNodes })

    return (
        <DataGridContext.Provider value={{
            table, density: {
                value: density,
                set: async (d) => {
                    const c = await (window as typeof window & { configAPI: configAPI; }).configAPI.readConfig()
                    if (!c?.tableDensity)
                        c.tableDensity = {}

                    c.tableDensity[configName] = d
                    await (window as typeof window & { configAPI: configAPI; }).configAPI.writeConfig(c)

                    setDensity(d)
                }
            }
        }
        } >
            {/* NOTE: This provider creates div elements, so don't nest inside of <table> elements */}
            < div style={{ padding: '1rem', height: '100%' }}>
                <DndContext
                    collisionDetection={closestCenter}
                    modifiers={[restrictToHorizontalAxis]}
                    onDragEnd={handleDragEnd}
                    sensors={sensors}
                >
                    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '0.5rem 0', overflow: 'hidden', border: `1px solid ${theme.palette.grey[500]}`, borderRadius: `${theme.shape.borderRadius}px`, textWrap: 'nowrap' }}>
                        <Stack direction='row' sx={{ p: 1 }}>
                            {...headerNodes.map((n, i) =>
                                <Fragment key={i}>
                                    {n}
                                </Fragment>
                            )}
                        </Stack>
                        {loading
                            ? <LoadingScreen />
                            : (
                                data.length === 0
                                    ? <p style={{ textAlign: 'center' }}>{t('DataGrid.noData')}</p>
                                    : <div style={{ overflow: 'auto', flexGrow: 2 }}>
                                        <AnimatePresence mode='sync'>
                                            <table style={{ borderCollapse: 'collapse', minWidth: '100%' }}>
                                                <thead style={{ position: 'sticky', top: 0, userSelect: 'none', background: theme.palette.background.default, zIndex: 1 }}>
                                                    {table.getHeaderGroups().map(headerGroup => (
                                                        <tr key={headerGroup.id} style={{ borderBottom: `1px solid ${theme.palette.grey[500]}` }}>
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
                                                        <tr key={row.id} style={{ borderBottom: i === (arr.length - 1) ? 0 : `1px solid ${theme.palette.grey[500]}`, textWrap: 'nowrap' }}>
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
                                        </AnimatePresence>
                                    </div>
                            )
                        }
                        <Stack direction='row' sx={{ p: 1 }}>
                            {...footerNodes.map((n, i) =>
                                <Fragment key={i}>
                                    {n}
                                </Fragment>
                            )}
                        </Stack>
                    </div>
                </DndContext>
            </div >
        </DataGridContext.Provider >
    )
}
