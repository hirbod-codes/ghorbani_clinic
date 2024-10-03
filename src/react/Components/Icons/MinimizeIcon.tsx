import { useTheme } from '@mui/material/styles';
import { SvgIcon } from "@mui/material";
import Logo from "../../assets/minus.svg?react";

export function MinimizeIcon(): JSX.Element {
    const theme = useTheme();

    return (
        <SvgIcon viewBox='-4 -4 32 32' stroke={theme.palette.text.primary}>
            <Logo />
        </SvgIcon>
    );
}
