import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Header } from "@tanstack/react-table";
import { CSSProperties, useContext } from "react";
import { DataGridContext } from "./Context";
import { t } from "i18next";
import { getCommonPinningStyles } from "./helpers";
import { Button } from "../../Components/Base/Button";
import { PinIcon } from "lucide-react";
import { Stack } from "../Base/Stack";

export const DraggableTableHeader = ({ header }: { header: Header<any, unknown>; }) => {
    const ctx = useContext(DataGridContext)!
    const table = ctx.table!

    const { attributes, isDragging, listeners, setNodeRef, transform, transition } = useSortable({
        transition: {
            duration: 250,
            easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
        },
        animateLayoutChanges: ({ isDragging }) => !isDragging,
        id: header.column.id
    });

    const style: CSSProperties = {
        opacity: isDragging ? 0.5 : 1,
        position: 'relative',
        transform: CSS.Translate.toString(transform), // translate instead of transform to avoid squishing
        transition,
        whiteSpace: 'nowrap',
        width: header.column.getSize(),
        zIndex: isDragging ? 1 : 0,
        ...getCommonPinningStyles(header.column),
    };

    switch (ctx.density.value) {
        case 'compact':
            style.padding = '0.5rem 1rem';
            break;
        case 'standard':
            style.padding = '0.75rem 1.25.rem';
            break;
        case 'comfortable':
            style.padding = '1rem 1.75rem';
            break;
        default:
            break;
    }

    const visibleFlatColumns = table.getVisibleFlatColumns()

    return (
        <>
            <th
                colSpan={header.colSpan}
                ref={(th) => {
                    if (!th)
                        return;
                    // If you don't do that, there will be an infinite loop. We update the value in state only if the value has actually changed.
                    if (table.getState().columnSizing[header.column.id] === th.getBoundingClientRect().width)
                        return;

                    table.setColumnSizing((prevSizes) => ({
                        ...prevSizes,
                        [header.column.id]: th.getBoundingClientRect().width,
                    }));

                    setNodeRef(th)
                }}
                style={style}
                className="relative"
                {...attributes}
            >
                <Stack stackProps={{ className: 'items-center justify-center' }}>
                    <p {...listeners} className={`flex-grow text-center cursor-${isDragging ? 'grabbing' : 'grab'}`}>
                        {t('Columns.' + header.column.columnDef.id)}
                    </p>

                    <Button
                        className="ml-1"
                        isIcon
                        variant="text"
                        size="xs"
                        onClick={(e) => {
                            if (header.column.getCanPin())
                                header.column.pin('left')
                        }}
                    >
                        <PinIcon fontSize="inherit" />
                    </Button>
                </Stack>

                <div id='border' className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-4/6 w-full${visibleFlatColumns[visibleFlatColumns.length - 1].id === header.column.id ? '' : ' border-r'}`} />
            </th >
        </>
    );
};
