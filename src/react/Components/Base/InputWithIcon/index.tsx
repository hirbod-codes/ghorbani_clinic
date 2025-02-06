import { cn } from "@/src/react/shadcn/lib/utils";
import { ComponentProps, ReactNode, RefObject } from "react";

export function InputWithIcon({ startIcon, startIconProps, endIcon, endIconProps, inputRef, ...props }: { startIcon?: ReactNode, startIconProps?: ComponentProps<'div'>, endIcon?: ReactNode, endIconProps?: ComponentProps<'div'>, inputRef?: RefObject<HTMLInputElement> } & ComponentProps<'input'>) {
    const StartIcon = startIcon;
    const EndIcon = endIcon;

    return (
        <div className="relative">
            {StartIcon && (
                <div {...startIconProps} className={cn("absolute left-1.5 top-1/2 transform -translate-y-1/2", startIconProps?.className)}>
                    {startIcon}
                </div>
            )}
            <input
                ref={inputRef}
                {...props}
                type={props?.type ?? 'text'}
                className={cn(
                    `cursor-pointer flex h-10 w-full rounded-md border border-input bg-surface py-2 px-4 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50${startIcon ? ' pl-8' : ''}${endIcon ? 'pr-8' : ''}`,
                    props?.className
                )}
            />
            {EndIcon && (
                <div {...endIconProps} className={cn("absolute right-3 top-1/2 transform -translate-y-1/2", endIconProps?.className)}>
                    {endIcon}
                </div>
            )}
        </div>
    );
}

// export function InputWithIcon({ startIcon, startIconProps, endIcon, endIconProps, inputRef, ...props }: { startIcon?: ReactNode, startIconProps?: ComponentProps<'div'>, endIcon?: ReactNode, endIconProps?: ComponentProps<'div'>, inputRef?: RefObject<HTMLInputElement> } & ComponentProps<'input'>) {
//     const StartIcon = startIcon;
//     const EndIcon = endIcon;

//     return (
//         <div className="relative flex items-center cursor-pointer h-10 w-full rounded-md border border-input bg-surface py-2 px-4 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50">
//             {StartIcon && (
//                 <div {...startIconProps} className={cn("", startIconProps?.className)}>
//                     {startIcon}
//                 </div>
//             )}
//             <input
//                 ref={inputRef}
//                 {...props}
//                 type={props?.type ?? 'text'}
//                 className={cn(
//                     // `cursor-pointer flex h-10 w-full rounded-md border border-input bg-surface py-2 px-4 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50`,
//                     props?.className
//                 )}
//             />
//             {EndIcon && (
//                 <div {...endIconProps} className={cn("", endIconProps?.className)}>
//                     {endIcon}
//                 </div>
//             )}
//         </div>
//     );
// }
InputWithIcon.displayName = "Input";
