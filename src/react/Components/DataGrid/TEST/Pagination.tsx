import { NavigateBeforeOutlined, NavigateNextOutlined } from "@mui/icons-material";
import { Pagination as MuiPagination, FormControl, InputLabel, MenuItem, Select, Stack, IconButton, PaginationItem, useTheme } from "@mui/material";
import { t } from "i18next";
import { useContext, useState } from "react";
import { DataGridContext } from "./Context";

export function Pagination({ paginationLimitOptions, onPagination }: { paginationLimitOptions?: number[], onPagination?: (paginationLimit: number, pageOffset: number) => Promise<void> | void, }) {
    const theme = useTheme()

    const table = useContext(DataGridContext).table

    const [paginationLimit, setPaginationLimit] = useState<number>(paginationLimitOptions[0])

    const [page, setPage] = useState<number>(0)

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
                        onChange={(e) => setPaginationLimit(e.target.value as number)}
                    >
                        {paginationLimitOptions.map((pl, i) => <MenuItem key={i} value={pl}>{pl}</MenuItem>)}
                    </Select>
                </FormControl>
                {
                    !onPagination
                        ? <MuiPagination count={Math.ceil(table.getRowCount() / paginationLimit)} onChange={(e, page) => setPage(page)} />
                        :
                        <Stack direction='row' alignItems='center'>
                            <IconButton
                                onClick={async () => {
                                    if (onPagination)
                                        await onPagination(paginationLimit, page)

                                    table.setPagination({ pageIndex: page - 1, pageSize: paginationLimit })
                                    setPage(page - 1)
                                }}
                                size='small'
                                sx={{ color: theme.palette.text.primary }}
                            >
                                <NavigateBeforeOutlined fontSize="inherit" />
                            </IconButton>

                            <PaginationItem page={page} />

                            <IconButton
                                onClick={async () => {
                                    if (onPagination)
                                        await onPagination(paginationLimit, page)

                                    table.setPagination({ pageIndex: page + 1, pageSize: paginationLimit })
                                    setPage(page + 1)
                                }}
                                size='small'
                                sx={{ color: theme.palette.text.primary }}
                            >
                                <NavigateNextOutlined fontSize="inherit" />
                            </IconButton>
                        </Stack>
                }
            </Stack>
        </>
    )
}
