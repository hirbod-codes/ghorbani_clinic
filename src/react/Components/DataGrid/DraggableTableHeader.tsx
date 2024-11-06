import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { IconButton, Stack, Typography, useTheme } from "@mui/material";
import { Header } from "@tanstack/react-table";
import { CSSProperties, useContext, useEffect, useRef } from "react";
import { DataGridContext } from "./Context";
import { t } from "i18next";
import { PushPinOutlined } from "@mui/icons-material";
import { getCommonPinningStyles } from "./helpers";

export const DraggableTableHeader = ({ header }: { header: Header<any, unknown>; }) => {
    const theme = useTheme()
    const table = useContext(DataGridContext).table

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
        paddingLeft: '1rem',
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
                {...attributes}
            >
                <Stack direction='row' alignItems='center' justifyContent='end'>
                    <Typography variant="body1" {...listeners} sx={{ flexGrow: 2,textAlign: 'center', cursor: isDragging ? 'grabbing' : 'grab' }}>
                        {t('Columns.' + header.column.columnDef.id)}
                    </Typography>

                    <IconButton
                        sx={{ ml: 1 }}
                        size='small'
                        onClick={(e) => {
                            if (header.column.getCanPin())
                                header.column.pin('left')
                        }}
                    >
                        <PushPinOutlined fontSize="inherit" />
                    </IconButton>

                    {header.index - 1 !== header.headerGroup.headers.length && <div style={{ height: '1.5rem', borderRight: `2px solid ${theme.palette.grey[400]}`, padding: '0 0.2rem', cursor: 'ew-resize' }} />}
                </Stack>
            </th >
        </>
    );
};
