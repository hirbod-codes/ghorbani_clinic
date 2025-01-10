import { useContext, useState } from "react";
import { DataGridContext } from "./Context";
import { ConfigurationContext } from "../../Contexts/Configuration/ConfigurationContext";
import { Button } from "../../Components/Base/Button";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { AnimatedSlide } from "../Animations/AnimatedSlide";
import { CircularLoading } from "../Base/CircularLoading";
import { FinitePagination } from "./FinitePagination";
import { Select } from "../Base/Select";
import { Stack } from "../Base/Stack";

export type PaginationProps = {
    paginationLimitOptions?: number[],
    onPagination?: (paginationLimit: number, pageOffset: number) => Promise<boolean> | boolean,
    setPaginationLimitChange?: (paginationLimit: number) => void | Promise<void>
}

export function Pagination({ paginationLimitOptions = [10, 25, 50, 100], onPagination, setPaginationLimitChange }: PaginationProps) {
    const configuration = useContext(ConfigurationContext)!;

    const table = useContext(DataGridContext)!.table!

    const [paginationLimit, setPaginationLimit] = useState<number>(paginationLimitOptions[0])

    const [page, setPage] = useState<number>(0)

    const [isLoading, setIsLoading] = useState<boolean>(false)

    console.log('Pagination', { page, paginationLimit })

    return (
        <Stack stackProps={{ className: 'flex-grow justify-end items-center' }}>
            <Select
                triggerProps={{ className: 'w-fit' }}
                value={paginationLimit.toString()}
                onValueChange={(value) => {
                    setPaginationLimit(Number(value));
                    if (setPaginationLimitChange)
                        setPaginationLimitChange(Number(value))
                    setPage(0)
                }}
                selectOptions={{ type: 'items', items: paginationLimitOptions.map((o, i) => ({ value: o.toString(), displayValue: o.toString() })) }}
            />

            {
                !onPagination
                    ?
                    <FinitePagination
                        count={Math.ceil(table.getRowCount() / paginationLimit)}
                        onChange={(page) => {
                            table.setPageIndex(page - 1)

                            setPage(page)
                        }} />
                    :
                    <Stack>
                        <Button
                            onClick={async () => {
                                setIsLoading(true)
                                const result = await onPagination(paginationLimit, page - 1)
                                setIsLoading(false)

                                if (result)
                                    setPage(page - 1)
                            }}
                            disabled={isLoading}
                            isIcon
                            variant="outline"
                            size='sm'
                        >
                            {
                                configuration.local.direction === 'ltr'
                                    ? <ChevronLeftIcon fontSize="inherit" />
                                    : <ChevronRightIcon fontSize="inherit" />
                            }
                        </Button>

                        <AnimatedSlide open={isLoading}>
                            <CircularLoading />
                        </AnimatedSlide>

                        {!isLoading && <Button size='sm' variant="outline" isIcon>{page}</Button>}

                        <Button
                            onClick={async () => {
                                setIsLoading(true)
                                const result = await onPagination(paginationLimit, page + 1)
                                setIsLoading(false)

                                if (result)
                                    setPage(page + 1)
                            }}
                            disabled={isLoading}
                            isIcon
                            variant="outline"
                            size='sm'
                        >
                            {
                                configuration.local.direction === 'ltr'
                                    ? <ChevronRightIcon fontSize="inherit" />
                                    : <ChevronLeftIcon fontSize="inherit" />
                            }
                        </Button>
                    </Stack>
            }
        </Stack >
    )
}
