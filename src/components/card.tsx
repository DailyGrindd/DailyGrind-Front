import * as React from "react";
import { cn } from "../lib/utils";

// Card principal
function Card({ className, ...props }: React.ComponentProps<"div">) {
    return (
        <div
            data-slot="card"
            className={cn(
                "bg-card text-card-foreground border border-border rounded-xl flex flex-col shadow-sm transition-shadow hover:shadow-md",
                className
            )}
            {...props}
        />
    );
}

// Header del card
function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
    return (
        <div
            data-slot="card-header"
            className={cn("px-6 pt-6 flex flex-col gap-1.5", className)}
            {...props}
        />
    );
}

// Titulo del card
function CardTitle({ className, ...props }: React.ComponentProps<"h4">) {
    return (
        <h4
            data-slot="card-title"
            className={cn("text-xl font-semibold leading-none", className)}
            {...props}
        />
    );
}

// Descripcion del card
function CardDescription({ className, ...props }: React.ComponentProps<"p">) {
    return (
        <p
            data-slot="card-description"
            className={cn("text-label/90 text-sm", className)}
            {...props}
        />
    );
}

// Contenido del card
function CardContent({ className, ...props }: React.ComponentProps<"div">) {
    return (
        <div
            data-slot="card-content"
            className={cn("px-6 py-4", className)}
            {...props}
        />
    );
}

// Footer del card
function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
    return (
        <div
            data-slot="card-footer"
            className={cn("flex items-center justify-end gap-2 px-6 pb-6 pt-2", className)}
            {...props}
        />
    );
}

export {
    Card,
    CardHeader,
    CardFooter,
    CardTitle,
    CardDescription,
    CardContent,
};
