import { useTheme } from '@mui/material/styles';
import { SvgIcon } from "@mui/material";
import Logo from "../../assets/close.svg?react";

export function CloseIcon(): JSX.Element {
    const theme = useTheme();

    return (
        <SvgIcon inheritViewBox stroke={theme.palette.error.main}>
            <Logo />
        </SvgIcon>
    );
}
