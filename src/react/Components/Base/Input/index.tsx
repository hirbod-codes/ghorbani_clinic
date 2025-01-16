import { InputWithIcon as ReferenceInput } from "../InputWithIcon";
import { Label } from "@/src/react/shadcn/components/ui/label";
import { ComponentProps, memo, useEffect } from "react";
import { Tooltip } from "../Tooltip";
import { AnimatePresence, motion, MotionProps } from "framer-motion";
import { cn } from "@/src/react/shadcn/lib/utils";
import { Stack } from "../Stack";

const inputVariants = {
    animate: {
        y: '0%',
        opacity: 1
    },
    exit: {
        y: '-100%',
        opacity: 0
    },
}

export type InputProps = {
    label?: string
    labelId?: string
    errorText?: string
    helperText?: string
    containerProps?: MotionProps & ComponentProps<'div'>
} & ComponentProps<typeof ReferenceInput>

export const Input = memo(function Input({ label, labelId, errorText, helperText, containerProps, inputRef, ...inputProps }: InputProps) {
    const input = <ReferenceInput inputRef={inputRef} id={labelId} {...inputProps} className={cn("bg-surface-container-highest text-surface-foreground", inputProps?.className)} />

    useEffect(() => { setTimeout(() => { errorText = undefined }, 3000) }, [])

    return (
        <motion.div layout {...containerProps} className={cn("flex flex-col relative", containerProps?.className)}>
            {label && labelId
                ? <Stack stackProps={{ className: "items-center size-full last:m-0 m-0" }}>
                    <Label htmlFor={labelId}>
                        {label}
                    </Label>
                    {input}
                </Stack>
                : input
            }

            <AnimatePresence mode='sync'>
                {!errorText && helperText !== undefined &&
                    <motion.div
                        key={0}
                        layout
                        initial='exit'
                        animate='animate'
                        exit='exit'
                        variants={inputVariants}
                        transition={{ ease: [0.5, 0, 0.5, 1] }}
                        className="absolute -bottom-1 inline"
                    >
                        <Tooltip tooltipContent={helperText}>
                            <p className="text-left text-xs text-surface-foreground text-nowrap text-ellipsis w-full overflow-hidden">
                                {helperText}
                            </p>
                        </Tooltip>
                    </motion.div>
                }

                {errorText !== undefined &&
                    <motion.div
                        key={1}
                        layout
                        initial='exit'
                        animate='animate'
                        exit='exit'
                        variants={inputVariants}
                        transition={{ ease: [0.5, 0, 0.5, 1] }}
                        className="absolute -bottom-1 inline"
                    >
                        <Tooltip
                            contentProps={{ className: `bg-destructive text-destructive-foreground` }}
                            tooltipContent={errorText}
                        >
                            <p className="text-left text-xs text-destructive text-nowrap text-ellipsis w-full overflow-hidden">
                                {errorText}
                            </p>
                        </Tooltip>
                    </motion.div>
                }
            </AnimatePresence>
        </motion.div>
    )
})
