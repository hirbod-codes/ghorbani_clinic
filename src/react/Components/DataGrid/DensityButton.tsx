import { t } from "i18next";
import { useContext, useState } from "react";
import { DataGridContext } from "./Context";
import { DropdownMenu } from "../Base/DropdownMenu";
import { Button } from "../../Components/Base/Button";
import { MenuIcon } from "lucide-react";

export function DensityButton() {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
    const open = Boolean(anchorEl)

    const ctx = useContext(DataGridContext)!

    return (
        <>
            <DropdownMenu
                trigger={
                    <Button>
                        <MenuIcon />{t('DataGrid.density')}
                    </Button>
                }
                contents={[
                    {
                        type: 'item',
                        options: {
                            onClick: () => ctx.density.set('compact')
                        },
                        content: t('DataGrid.compact')
                    },
                    {
                        type: 'item',
                        options: {
                            onClick: () => ctx.density.set('standard')
                        },
                        content: t('DataGrid.standard')
                    },
                    {
                        type: 'item',
                        options: {
                            onClick: () => ctx.density.set('comfortable')
                        },
                        content: t('DataGrid.comfortable')
                    }
                ]}
            />
        </>
    )
}

