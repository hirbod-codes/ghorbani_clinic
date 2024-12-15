import { FileDownloadOutlined } from "@mui/icons-material";
import { Button } from "@mui/material";
import { t } from "i18next";
import { useContext } from "react";
import { appAPI } from "src/Electron/appRendererEvents";
import { DataGridContext } from "./Context";

export function ExportButton() {
    const table = useContext(DataGridContext).table

    return (
        <>
            <Button onClick={async () => {
                const json = JSON.stringify([].concat(table.getTopRows(), table.getCenterRows(), table.getBottomRows()), undefined, 4)
                const path = await (window as typeof window & { appAPI: appAPI }).appAPI.saveFileDialog();
                if (path.canceled)
                    return

                (window as typeof window & { appAPI: appAPI }).appAPI.saveFile({ content: json, path: path.filePath })
            }} startIcon={<FileDownloadOutlined />}>
                {t('DataGrid.export')}
            </Button>
        </>
    )
}

