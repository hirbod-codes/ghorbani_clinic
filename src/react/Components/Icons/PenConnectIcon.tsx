import { useTheme } from '@mui/material/styles';
import { SvgIcon } from "@mui/material";
import Logo from "../../assets/pen-connect.svg?react";

export function PenConnectIcon({ color }: { color?: string }): JSX.Element {
    const theme = useTheme();

    if (!color)
        color = theme.palette.text.primary

    return (
        <SvgIcon viewBox="0 0 24 24" stroke={color}>
            <Logo />
        </SvgIcon>
    );
}
