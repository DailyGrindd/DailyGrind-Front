import React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/utils";

const buttonVariants = cva(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
    {
        variants: {
            variant: {
                default:
                    "bg-[rgb(var(--color-primary))] text-[rgb(var(--color-primary-foreground))] hover:bg-[rgb(var(--color-primary-hover))]",
                destructive:
                    "bg-[rgb(var(--color-destructive))] text-white hover:bg-[rgb(var(--color-destructive)/0.9)]",
                outline:
                    "border border-[rgb(var(--color-foreground)/0.1)] bg-[rgb(var(--color-background))] text-[rgb(var(--color-foreground))] hover:bg-[rgb(var(--color-accent))] hover:text-[rgb(var(--color-accent-foreground))]",
                secondary:
                    "bg-[rgb(var(--color-secondary))] text-[rgb(var(--color-secondary-foreground))] hover:bg-[rgb(var(--color-secondary)/0.8)]",
                ghost:
                    "hover:bg-[rgb(var(--color-accent))] hover:text-[rgb(var(--color-accent-foreground))]",
                link:
                    "text-[rgb(var(--color-primary))] underline-offset-4 hover:underline",
            },
            size: {
                default: "h-9 px-4 py-2",
                sm: "h-8 rounded-md gap-1.5 px-3",
                lg: "h-10 rounded-md px-6",
                icon: "size-9 rounded-md",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
);

export type ButtonProps = React.ComponentPropsWithoutRef<"button"> &
    VariantProps<typeof buttonVariants> & {
        asChild?: boolean;
    };

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        const Comp: React.ElementType = asChild ? Slot : "button";

        return (
            <Comp
                ref={ref}
                className={cn(buttonVariants({ variant, size, className }))}
                {...props}
            />
        );
    }
);

Button.displayName = "Button";

export { buttonVariants };