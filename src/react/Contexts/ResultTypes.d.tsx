import { ReactNode } from 'react';
import { AlertColor, AlertPropsColorOverrides } from '@mui/material';
import { OverridableStringUnion } from "@mui/types";

export type Result = {
    message: string;
    severity: OverridableStringUnion<AlertColor, AlertPropsColorOverrides>;
    action?: ReactNode;
};
