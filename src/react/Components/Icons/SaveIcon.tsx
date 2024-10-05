import { useTheme } from '@mui/material/styles';
import { SvgIcon } from "@mui/material";
import Logo from "../../assets/save-floppy.svg?react";

export function SaveIcon({ color }: { color?: string }): JSX.Element {
    const theme = useTheme();

    if (!color.startsWith('#'))
        color = (theme.palette as any)[color].main

    if (!color)
        color = theme.palette.text.primary

    return (
        <SvgIcon viewBox="0 0 32 32" fill={color}>
            <Logo />
        </SvgIcon>
    );
}
