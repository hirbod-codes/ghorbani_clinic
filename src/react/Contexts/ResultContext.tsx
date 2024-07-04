import { createContext, ReactNode } from 'react'
import { AlertColor, AlertPropsColorOverrides } from '@mui/material'
import { OverridableStringUnion } from "@mui/types"

export type Result = { message: string, severity: OverridableStringUnion<AlertColor, AlertPropsColorOverrides>, action?: ReactNode }

export type ResultContextType = { result?: Result, setResult?: (result: Result) => void | Promise<void> }

export const ResultContext = createContext<ResultContextType | undefined>(undefined)
