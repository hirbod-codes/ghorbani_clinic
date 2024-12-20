import { t } from "i18next";
import { useContext } from "react";
import { appAPI } from "src/Electron/appRendererEvents";
import { DataGridContext } from "./Context";
import { Row } from "@tanstack/react-table";
import { Button } from "../../shadcn/components/ui/button";
import { FileDownIcon } from "lucide-react";

export function ExportButton() {
    const table = useContext(DataGridContext)!.table!

    return (
        <>
            <Button
                size='icon'
                onClick={async () => {
                    const json = JSON.stringify(([] as Row<any>[]).concat(table.getTopRows(), table.getCenterRows(), table.getBottomRows()), undefined, 4)
                    const path = await (window as typeof window & { appAPI: appAPI }).appAPI.saveFileDialog();
                    if (path.canceled)
                        return

                    (window as typeof window & { appAPI: appAPI }).appAPI.saveFile({ content: json, path: path.filePath })
                }}
            >
                <FileDownIcon strokeWidth={1.25} />{t('DataGrid.export')}
            </Button >
        </>
    )
}

