import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useTheme } from "@mui/material";
import { Header, flexRender } from "@tanstack/react-table";
import { CSSProperties, useContext } from "react";
import { Person } from "./makeData";
import { DataGridContext } from "./Context";

export const DraggableTableHeader = ({ header }: { header: Header<Person, unknown>; }) => {
    const theme = useTheme();

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
        cursor: 'move'
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
        <th colSpan={header.colSpan} ref={setNodeRef} style={style} {...attributes} {...listeners}>
            {header.isPlaceholder
                ? null
                : flexRender(header.column.columnDef.header, header.getContext())}
        </th>
    );
};
