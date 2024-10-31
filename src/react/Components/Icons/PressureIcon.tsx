import { useTheme } from '@mui/material/styles';
import { SvgIcon } from "@mui/material";
import Logo from "../../assets/pressure-sprayer.svg?react";

export function PressureIcon({ color }: { color?: string }): JSX.Element {
    const theme = useTheme();

    if (!color)
        color = theme.palette.text.primary

    return (
        <SvgIcon viewBox="0 0 550 550" fontSize='large' fill={color}>
            <Logo fill={color} />
        </SvgIcon>
    );
}
