import { SvgIcon } from "@mui/material";
import Logo from "../../assets/copy.svg?react";

export function MaxUnmaxIcon(): JSX.Element {
    return (
        <svg fill="none" viewBox="-4 -4 32 32">
            <rect x="4" y="8" width="12" height="12" rx="1" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M8 6V5C8 4.44772 8.44772 4 9 4H19C19.5523 4 20 4.44772 20 5V15C20 15.5523 19.5523 16 19 16H18" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="2 2" />
        </svg>
    );
}
