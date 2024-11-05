import { NavigateBeforeOutlined, NavigateNextOutlined } from "@mui/icons-material";
import { Pagination as MuiPagination, FormControl, InputLabel, MenuItem, Select, Stack, IconButton, PaginationItem, useTheme, CircularProgress } from "@mui/material";
import { t } from "i18next";
import { useContext, useState } from "react";
import { DataGridContext } from "./Context";

export type PaginationProps = {
    paginationLimitOptions?: number[],
    onPagination?: (paginationLimit: number, pageOffset: number) => Promise<boolean> | boolean,
    setPaginationLimitChange?: (paginationLimit: number) => void | Promise<void>
}

export function Pagination({ paginationLimitOptions, onPagination, setPaginationLimitChange }: PaginationProps) {
    const theme = useTheme()

    const table = useContext(DataGridContext).table

    const [paginationLimit, setPaginationLimit] = useState<number>(paginationLimitOptions[0])

    const [page, setPage] = useState<number>(0)

    const [isLoading, setIsLoading] = useState<boolean>(false)

    console.log('Pagination', { page, paginationLimit })

    return (
        <>
            <Stack direction='row' flexGrow={2} justifyContent='end' alignItems='center'>
                <FormControl sx={{ width: '7rem' }}>
                    <InputLabel id="demo-simple-select-label">{t('DataGrid.limit')}</InputLabel>
                    <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={paginationLimit}
                        label={t('DataGrid.paginationLimit')}
                        onChange={(e) => {
                            setPaginationLimit(e.target.value as number);
                            setPaginationLimitChange(e.target.value as number)
                            setPage(0)
                        }}
                    >
                        {paginationLimitOptions.map((pl, i) => <MenuItem key={i} value={pl}>{pl}</MenuItem>)}
                    </Select>
                </FormControl>
                {
                    !onPagination
                        ? <MuiPagination
                            count={Math.ceil(table.getRowCount() / paginationLimit)}
                            onChange={(e, page) => {
                                table.setPageIndex(page - 1)

                                setPage(page)
                            }} />
                        :
                        <Stack direction='row' alignItems='center'>
                            <IconButton
                                onClick={async () => {
                                    setIsLoading(true)
                                    const result = await onPagination(paginationLimit, page - 1)
                                    setIsLoading(false)

                                    if (result)
                                        setPage(page - 1)
                                }}
                                disabled={isLoading}
                                size='small'
                                sx={{ color: theme.palette.text.primary }}
                            >
                                {
                                    theme.direction === 'ltr'
                                        ? <NavigateBeforeOutlined fontSize="inherit" />
                                        : <NavigateNextOutlined fontSize="inherit" />
                                }
                            </IconButton>

                            {isLoading ? <CircularProgress size={30} /> : <PaginationItem page={page} />}

                            <IconButton
                                onClick={async () => {
                                    setIsLoading(true)
                                    const result = await onPagination(paginationLimit, page + 1)
                                    setIsLoading(false)

                                    if (result)
                                        setPage(page + 1)
                                }}
                                disabled={isLoading}
                                size='small'
                                sx={{ color: theme.palette.text.primary }}
                            >
                                {
                                    theme.direction === 'ltr'
                                        ? <NavigateNextOutlined fontSize="inherit" />
                                        : <NavigateBeforeOutlined fontSize="inherit" />
                                }
                            </IconButton>
                        </Stack>
                }
            </Stack >
        </>
    )
}
