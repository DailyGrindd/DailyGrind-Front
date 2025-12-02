import * as React from "react";
import { cn } from "../lib/utils";
import { ChevronDown } from "lucide-react";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    children: React.ReactNode;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
    ({ className, children, ...props }, ref) => {
        return (
            <div className="relative">
                <select
                    ref={ref}
                    className={cn(
                        "flex h-9 w-full appearance-none rounded-md border border-input bg-input text-foreground px-3 py-1 text-sm outline-none transition-colors duration-200 ease-in-out",
                        "focus:ring-2 focus:ring-ring",
                        "hover:border-primary hover:border-2",
                        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
                        "[aria-invalid='true']:border-destructive [aria-invalid='true']:ring-destructive",
                        "pr-9 cursor-pointer",
                        className
                    )}
                    {...props}
                >
                    {children}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none transition-transform" />
            </div>
        );
    }
);

Select.displayName = "Select";

export { Select };
