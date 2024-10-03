import { useTheme } from '@mui/material/styles';
import { SvgIcon } from "@mui/material";
import Logo from "../../assets/menu.svg?react";

export function MenuIcon(): JSX.Element {
    const theme = useTheme();

    return (
        <SvgIcon inheritViewBox stroke={theme.palette.text.primary}>
            <Logo />
        </SvgIcon>
    );
}
