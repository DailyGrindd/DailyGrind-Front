import { cn } from "../lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
    return (
        <input
            type={type}
            data-slot="input"
            className={cn(
                "flex h-9 w-full min-w-0 rounded-md border border-input bg-input placeholder:text-muted-foreground px-3 py-1 text-base outline-none transition-colors duration-200 ease-in-out focus:ring-2 focus:ring-ring disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
                "[aria-invalid='true']:ring-destructive [aria-invalid='true']:border-destructive",
                className
            )}
            {...props}
        />
    );
}

export { Input };