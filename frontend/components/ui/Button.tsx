import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// Note: We need to install class-variance-authority and @radix-ui/react-slot if not present.
// I will assume standard props for now and if those libs are missing I will install them or write a simpler version.
// To be safe and fast, I will write a version that doesn't strictly depend on cva/slot if I haven't installed them, 
// but `cva` is standard. I'll install them in the next step to be sure.

// Actually, I'll write a simpler version first to avoid extra dependencies if not needed, 
// but for "modern" feel, cva is great. I'll stick to simple props for now to reduce friction, 
// or just install them. I'll install them.

// Wait, I didn't install `class-variance-authority` yet. 
// I will write a robust component without CVA for now to save time/complexity, 
// or I can just use template literals.

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "default" | "outline" | "ghost" | "link";
    size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "default", size = "default", ...props }, ref) => {
        const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 transition-all duration-300";

        const variants = {
            default: "bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 shadow-md",
            outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground hover:border-accent",
            ghost: "hover:bg-accent hover:text-accent-foreground",
            link: "text-primary underline-offset-4 hover:underline",
        };

        const sizes = {
            default: "h-10 px-6 py-2",
            sm: "h-9 rounded-md px-3",
            lg: "h-12 rounded-full px-8 text-base",
            icon: "h-10 w-10",
        };

        return (
            <button
                className={cn(baseStyles, variants[variant], sizes[size], className)}
                ref={ref}
                {...props}
            />
        );
    }
);
Button.displayName = "Button";

export { Button };
