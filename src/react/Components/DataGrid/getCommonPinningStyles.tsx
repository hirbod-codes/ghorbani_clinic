import { useTheme } from "@mui/material";
import { Column } from "@tanstack/react-table";
import { CSSProperties } from "react";


export function getCommonPinningStyles(column: Column<any>): CSSProperties {
    const theme = useTheme();

    const isPinned = column.getIsPinned();
    const isLastLeftPinnedColumn = isPinned === 'left' && column.getIsLastColumn('left');
    const isFirstRightPinnedColumn = isPinned === 'right' && column.getIsFirstColumn('right');

    return {
        backgroundColor: isPinned ? theme.palette.background.default : undefined,
        boxShadow: isLastLeftPinnedColumn ? '-4px 0 4px -4px gray inset' : isFirstRightPinnedColumn ? '4px 0 4px -4px gray inset' : undefined,
        left: isPinned === 'left' ? `${column.getStart('left')}px` : undefined,
        right: isPinned === 'right' ? `${column.getAfter('right')}px` : undefined,
        opacity: isPinned ? 0.95 : 1,
        position: isPinned ? 'sticky' : 'relative',
        width: column.getSize(),
        zIndex: isPinned ? 1 : 0,
    };
}
