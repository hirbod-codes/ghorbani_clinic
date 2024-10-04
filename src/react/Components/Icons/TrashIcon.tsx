import { useTheme } from '@mui/material/styles';
import { SvgIcon } from "@mui/material";
import Logo from "../../assets/trash.svg?react";

export function TrashIcon({ color }: { color?: string }): JSX.Element {
    const theme = useTheme();

    if (!color)
        color = theme.palette.text.primary

    return (
        <SvgIcon viewBox='0 0 32 32' stroke={color}>
            <Logo />
        </SvgIcon>
    );
}
