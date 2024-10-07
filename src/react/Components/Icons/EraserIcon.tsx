import { useTheme } from '@mui/material/styles';
import { SvgIcon } from "@mui/material";
import Logo from "../../assets/eraser.svg?react";

export function EraserIcon({ color }: { color?: string }): JSX.Element {
    const theme = useTheme();

    console.log(color)

    if (!color)
        color = theme.palette.text.primary

    return (
        <SvgIcon viewBox="0 0 24 24" stroke={color}>
            <Logo />
        </SvgIcon>
    );
}
