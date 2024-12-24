import { Button as ShadcnButton } from "@/src/react/shadcn/components/ui/button";
import { cn } from "@/src/react/shadcn/lib/utils";
import { ComponentProps, MouseEvent, ReactNode } from "react";

export function Button({ children, rippleEffect = true, ...props }: { children?: ReactNode, rippleEffect?: boolean } & ComponentProps<typeof ShadcnButton>) {
    const ripple = (event: MouseEvent<HTMLButtonElement>) => {
        const btn = event.currentTarget;

        const circle = document.createElement("span");
        const diameter = Math.max(btn.clientWidth, btn.clientHeight);
        const radius = diameter / 2;

        circle.style.width = circle.style.height = `${diameter}px`;
        circle.style.left = `${event.clientX - (btn.offsetLeft + radius)}px`;
        circle.style.top = `${event.clientY - (btn.offsetTop + radius)}px`;
        circle.classList.add("ripple");

        const ripple = btn.getElementsByClassName("ripple")[0];

        if (ripple) {
            ripple.remove();
        }

        btn.appendChild(circle);
    }

    return (
        <ShadcnButton
            {...props}
            className={cn(['overflow-hidden relative hover:bg-opacity-90'], props.className)}
            onClick={(e: MouseEvent<HTMLButtonElement>) => {
                if (rippleEffect)
                    ripple(e)
                if (props.onClick)
                    props.onClick(e)
            }}
        >
            <div className="absolute w-full h-full top-0 left-0 bg-white opacity-0 z-10 transition-opacity duration-300 hover:opacity-50" />
            {children}
        </ShadcnButton>
    )
}

