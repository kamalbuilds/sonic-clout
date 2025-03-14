import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        glass: "bg-white/20 backdrop-blur-[15px] text-white border border-white/30 shadow-[0_4px_15px_rgba(0,0,0,0.1),0_2px_4px_rgba(255,255,255,0.1)_inset] hover:bg-white/25 hover:border-white/40 hover:shadow-[0_4px_20px_rgba(255,255,255,0.15)] active:scale-[0.98] transition-all duration-200",
        glassColored: "backdrop-blur-[15px] border border-white/30 shadow-[0_4px_15px_rgba(0,0,0,0.15),0_2px_4px_rgba(255,255,255,0.1)_inset] hover:shadow-[0_4px_20px_rgba(0,0,0,0.2)] hover:border-white/40 active:scale-[0.98] transition-all duration-200 font-medium text-white",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  gradient?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, gradient, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    const style = gradient && variant === "glassColored"
      ? { background: `linear-gradient(135deg, ${gradient})` }
      : {};

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        style={style}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants }; 