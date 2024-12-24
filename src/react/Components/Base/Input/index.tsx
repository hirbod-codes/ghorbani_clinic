import { InputWithIcon as ReferenceInput } from "../InputWithIcon";
import { Label } from "@/src/react/shadcn/components/ui/label";
import { ComponentProps, memo, useEffect } from "react";
import { Tooltip } from "../Tooltip";
import { AnimatePresence, motion } from "framer-motion";

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

export const Input = memo(function Input({ label, labelId, errorText, helperText, ...inputProps }: { label?: string, labelId?: string, errorText?: string, helperText?: string } & ComponentProps<typeof ReferenceInput>) {
    const input = <ReferenceInput id={labelId} {...inputProps} />

    useEffect(() => { setTimeout(() => { errorText = undefined }, 3000) }, [])

    return (
        <motion.div layout className="p-2 flex flex-col relative">
            <div className="flex flex-row items-center space-x-2">
                {label && labelId &&
                    <Label htmlFor={labelId}>
                        {label}
                    </Label>
                }
                {input}
            </div>

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
                            <p className="text-left text-xs text-foreground text-nowrap text-ellipsis w-full overflow-hidden">
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
