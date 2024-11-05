import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { IconButton, Typography } from "@mui/material";
import { Header } from "@tanstack/react-table";
import { CSSProperties, useContext } from "react";
import { DataGridContext } from "./Context";
import { t } from "i18next";
import { PushPinOutlined } from "@mui/icons-material";
import { getCommonPinningStyles } from "./getCommonPinningStyles";

export const DraggableTableHeader = ({ header }: { header: Header<any, unknown>; }) => {
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
        cursor: 'move',
        paddingLeft: '0.5rem',
        paddingRight: '0.5rem',
        ...getCommonPinningStyles(header.column),
    };

    switch (useContext(DataGridContext).density.value) {
        case 'compact':
            style.paddingTop = '1rem';
            style.paddingBottom = '1rem';
            break;
        case 'standard':
            style.paddingTop = '1.25rem';
            style.paddingBottom = '1.25rem';
            break;
        case 'comfortable':
            style.paddingTop = '1.75rem';
            style.paddingBottom = '1.75rem';
            break;
        default:
            break;
    }

    return (
        <th colSpan={header.colSpan} ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <Typography variant="body1">
                {t('Columns.' + header.column.columnDef.id)}
                <IconButton
                    size='small'
                    onClick={(e) => {
                        if (header.column.getCanPin())
                            header.column.pin('left')
                    }}
                >
                    <PushPinOutlined fontSize="inherit" />
                </IconButton>
            </Typography>
        </th >
    );
};
