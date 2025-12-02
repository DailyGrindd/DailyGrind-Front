import * as React from "react";
import { X } from "lucide-react";
import { Button } from "./button";

interface DialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    children: React.ReactNode;
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
    React.useEffect(() => {
        if (open) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [open]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                onClick={() => onOpenChange(false)}
            />
            
            {/* Dialog Content */}
            <div className="relative z-50 w-full">
                {children}
            </div>
        </div>
    );
}

interface DialogContentProps {
    children: React.ReactNode;
    className?: string;
}

export function DialogContent({ children, className = "" }: DialogContentProps) {
    return (
        <div className={`relative mx-auto bg-white rounded-lg shadow-xl ${className}`}>
            {children}
        </div>
    );
}

interface DialogHeaderProps {
    children: React.ReactNode;
}

export function DialogHeader({ children }: DialogHeaderProps) {
    return (
        <div className="px-6 py-4 border-b border-border">
            {children}
        </div>
    );
}

interface DialogTitleProps {
    children: React.ReactNode;
    className?: string;
}

export function DialogTitle({ children, className = "" }: DialogTitleProps) {
    return (
        <h2 className={`text-lg font-semibold text-foreground ${className}`}>
            {children}
        </h2>
    );
}

interface DialogCloseProps {
    onClose: () => void;
}

export function DialogClose({ onClose }: DialogCloseProps) {
    return (
        <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4 rounded-md opacity-70 hover:opacity-100"
            onClick={onClose}
        >
            <X className="h-4 w-4" />
        </Button>
    );
}
