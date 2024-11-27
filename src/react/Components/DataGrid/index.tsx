import { Fragment, ReactNode, useContext, useEffect, useMemo, useState } from 'react'
import {
    ColumnDef,
    ColumnPinningState,
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
import { getLuxonLocale } from '../../Lib/helpers'
import { ConfigurationContext } from '../../Contexts/ConfigurationContext'

export type DataGridProps = {
    configName: string,
    data: any[],
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
    pagination?: PaginationState,
    onPagination?: (pagination: PaginationState) => Promise<boolean> | boolean,
    loading?: boolean,
    defaultColumnPinningModel?: ColumnPinningState,
    defaultColumnVisibilityModel?: VisibilityState,
    defaultColumnOrderModel?: string[],
    defaultTableDensity?: Density
}

export function DataGrid({
    configName,
    data,
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
    pagination,
    onPagination,
    loading = false,
    defaultColumnPinningModel = { left: ['counter'], right: [] },
    defaultColumnVisibilityModel = {},
    defaultColumnOrderModel = ['counter'],
    defaultTableDensity = 'compact'
}: DataGridProps) {
    const theme = useTheme()
    const configuration = useContext(ConfigurationContext)

    if (!pagination)
        pagination = { pageIndex: 0, pageSize: 10 }

    data = data.map((d, i) => ({ ...d, counter: (pagination.pageIndex * pagination.pageSize) + (i + 1) }))

    const columns = useMemo<ColumnDef<any>[]>(() => {
        return getColumns(data, overWriteColumns, additionalColumns, defaultColumnOrderModel)
    }, [overWriteColumns, additionalColumns, defaultColumnOrderModel])

    if (!columns.find(f => f.id === 'counter'))
        columns.unshift({
            id: 'counter',
            accessorKey: 'counter',
            cell: ({ getValue }) => new Intl.NumberFormat(getLuxonLocale(configuration.get.locale.code), { trailingZeroDisplay: 'auto', minimumIntegerDigits: 1, useGrouping: false }).format(getValue() as Intl.StringNumericLiteral)
        })

    const [density, setDensity] = useState<Density>('compact')
    const [columnOrder, setColumnOrder] = useState<string[]>((columns ?? []).map(c => c.id))
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
    const [columnPinning, setColumnPinning] = useState<ColumnPinningState>({ left: ['counter'], right: [] })

    const [hasInit, setHasInit] = useState(false)

    const sensors = useSensors(
        useSensor(MouseSensor, { activationConstraint: { delay: 40, tolerance: 150 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 40, tolerance: 150 } }),
        useSensor(KeyboardSensor, {})
    )

    const [table, setTable] = useState(useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        enableHiding: true,
        state: {
            columnOrder,
            columnVisibility,
            columnPinning,
            pagination: hasPagination && !onPagination ? pagination : undefined
        },
        enableColumnPinning: true,
        onColumnPinningChange: async (updaterOrValue) => {
            if (!hasInit)
                return

            let cp: ColumnPinningState
            if (typeof updaterOrValue !== 'function')
                cp = updaterOrValue
            else
                cp = updaterOrValue(undefined)

            if (!cp.left) cp.left = []
            if (!cp.right) cp.right = []

            const newCp: ColumnPinningState = { left: [...columnPinning.left], right: [...columnPinning.right] }

            cp.left.forEach(l => {
                if (columnPinning.left.find(f => f === l) === undefined)
                    newCp.left.push(l)
                else
                    newCp.left = newCp.left.filter(f => f !== l)
            })

            cp.right.forEach(l => {
                if (columnPinning.right.find(f => f === l) === undefined)
                    newCp.right.push(l)
                else
                    newCp.right = newCp.right.filter(f => f !== l)
            })

            const c = await (window as typeof window & { configAPI: configAPI; }).configAPI.readConfig()
            console.log({ ...c });

            if (!c.columnPinningModels)
                c.columnPinningModels = {}

            c.columnPinningModels[configName] = newCp;
            (window as typeof window & { configAPI: configAPI; }).configAPI.writeConfig(c)

            setColumnPinning(newCp);
        },
        onColumnOrderChange: async (updaterOrValue) => {
            if (!hasInit)
                return

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
            if (!hasInit)
                return

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
        onPaginationChange: hasPagination && !onPagination ? onPagination : undefined,
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
            <Pagination paginationLimitOptions={paginationLimitOptions} onPagination={async (l, o) => {
                console.log({ l, o })
                if (onPagination)
                    return await onPagination({ pageIndex: o, pageSize: l })
                return true
            }} setPaginationLimitChange={(size) => {
                if (onPagination)
                    onPagination({ pageIndex: 0, pageSize: size })
            }} />
        ]

    if (prependFooterNodes && prependFooterNodes.length !== 0)
        footerNodes = prependFooterNodes.concat(footerNodes)
    if (appendFooterNodes && appendFooterNodes.length !== 0)
        footerNodes = footerNodes.concat(appendFooterNodes)

    useEffect(() => {
        (window as typeof window & { configAPI: configAPI; }).configAPI.readConfig()
            .then((c) => {
                if (c?.columnVisibilityModels && c.columnVisibilityModels[configName]) {
                    setColumnVisibility(c.columnVisibilityModels[configName])
                    table.setColumnVisibility(c.columnVisibilityModels[configName])
                }
                else {
                    setColumnVisibility(defaultColumnVisibilityModel)
                    table.setColumnVisibility(defaultColumnVisibilityModel)
                    if (!c.columnVisibilityModels)
                        c.columnVisibilityModels = {}
                    c.columnVisibilityModels[configName] = defaultColumnVisibilityModel
                }

                if (c?.columnOrderModels && c.columnOrderModels[configName]) {
                    setColumnOrder(c.columnOrderModels[configName])
                    table.setColumnOrder(c.columnOrderModels[configName])
                } else {
                    setColumnOrder(defaultColumnOrderModel)
                    table.setColumnOrder(defaultColumnOrderModel)
                    if (!c.columnOrderModels)
                        c.columnOrderModels = {}
                    c.columnOrderModels[configName] = defaultColumnOrderModel
                }

                if (c?.columnPinningModels && c.columnPinningModels[configName]) {
                    setColumnPinning(c.columnPinningModels[configName])
                    table.setColumnPinning(c.columnPinningModels[configName])
                } else {
                    setColumnPinning(defaultColumnPinningModel)
                    table.setColumnPinning(defaultColumnPinningModel)
                    if (!c.columnPinningModels)
                        c.columnPinningModels = {}
                    c.columnPinningModels[configName] = defaultColumnPinningModel
                }

                if (c?.tableDensity && c?.tableDensity[configName])
                    setDensity(c?.tableDensity[configName])
                else {
                    setDensity(defaultTableDensity)
                    if (!c.tableDensity)
                        c.tableDensity = {}
                    c.tableDensity[configName] = defaultTableDensity
                }

                (window as typeof window & { configAPI: configAPI; }).configAPI.writeConfig(c);
                setHasInit(true)
            })
    }, [])

    console.log('DataGrid', { data, columns, pagination, columnPinning, columnVisibility, columnOrder, headerNodes, footerNodes })

    return (
        <>
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
                <div style={{ padding: '1rem', height: '100%' }}>
                    <DndContext
                        collisionDetection={closestCenter}
                        modifiers={[restrictToHorizontalAxis]}
                        onDragEnd={(e: DragEndEvent) => {
                            const { active, over } = e

                            if (!active || !over || active.id === over.id)
                                return

                            const oldIndex = columnOrder.indexOf(active.id as string)
                            const newIndex = columnOrder.indexOf(over.id as string)
                            const newColumnOrder = arrayMove(columnOrder, oldIndex, newIndex)
                            setColumnOrder(newColumnOrder)
                            table.setColumnOrder(newColumnOrder)
                        }}
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
                                                <table style={{ borderCollapse: 'separate', borderSpacing: 0, minWidth: '100%' }}>
                                                    <thead style={{ position: 'sticky', top: 0, userSelect: 'none', background: theme.palette.background.default, zIndex: 1 }}>
                                                        {table.getHeaderGroups().map(headerGroup => (
                                                            <tr key={headerGroup.id} style={{ borderBottom: `1px solid ${theme.palette.grey[500]}` }}>
                                                                <SortableContext
                                                                    items={columnOrder}
                                                                    strategy={horizontalListSortingStrategy}
                                                                >
                                                                    {headerGroup.headers.map(header => (<DraggableTableHeader key={header.id} header={header} />))}
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
        </>
    )
}
