import { FileDownloadOutlined } from "@mui/icons-material";
import { Button } from "@mui/material";
import { t } from "i18next";
import { useContext } from "react";
import { appAPI } from "src/Electron/handleAppRendererEvents";
import { DataGridContext } from "./Context";

export function ExportButton() {
    const table = useContext(DataGridContext).table

    return (
        <>
            <Button onClick={() => {
                const json = JSON.stringify([].concat(table.getTopRows(), table.getCenterRows(), table.getBottomRows()), undefined, 4);
                (window as typeof window & { appAPI: appAPI }).appAPI.saveFile(json)
            }} startIcon={<FileDownloadOutlined />}>
                {t('DataGrid.density')}
            </Button>
        </>
    )
}

