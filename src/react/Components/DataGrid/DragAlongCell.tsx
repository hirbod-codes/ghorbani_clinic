import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Cell, flexRender } from "@tanstack/react-table";
import { CSSProperties, useContext } from "react";
import { DataGridContext } from "./Context";
import { Typography } from "@mui/material";

export const DragAlongCell = ({ cell }: { cell: Cell<any, unknown>; }) => {
    const { isDragging, setNodeRef, transform, transition } = useSortable({
        transition: {
            duration: 250,
            easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
        },
        animateLayoutChanges: ({ isDragging }) => !isDragging,
        id: cell.column.id
    });

    const style: CSSProperties = {
        opacity: isDragging ? 0.8 : 1,
        position: 'relative',
        transform: CSS.Translate.toString(transform), // translate instead of transform to avoid squishing
        transition,
        width: cell.column.getSize(),
        zIndex: isDragging ? 1 : 0,
        textAlign: 'center',
        paddingLeft: '0.5rem',
        paddingRight: '0.5rem',
    };

    switch (useContext(DataGridContext).density.value) {
        case 'compact':
            style.paddingTop = '0.25rem';
            style.paddingBottom = '0.25rem';
            break;
        case 'standard':
            style.paddingTop = '0.5rem';
            style.paddingBottom = '0.5rem';
            break;
        case 'comfortable':
            style.paddingTop = '0.75rem';
            style.paddingBottom = '0.75rem';
            break;
        default:
            break;
    }

    return (
        <td style={style} ref={setNodeRef}>
            <Typography variant="body1">
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </Typography>
        </td>
    );
};
