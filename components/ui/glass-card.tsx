import React from "react";
import { cn } from "./utils";
import { VariantProps, cva } from "class-variance-authority";

const glassCardVariants = cva(
  "rounded-lg backdrop-blur-md shadow-lg border transition-all duration-300",
  {
    variants: {
      variant: {
        default: "bg-white/10 border-white/20",
        dark: "bg-black/30 border-white/10",
        light: "bg-white/20 border-white/30",
        colored: "border-white/20",
      },
      size: {
        sm: "p-3",
        md: "p-5",
        lg: "p-7",
      },
      hover: {
        default: "hover:bg-white/15",
        glow: "hover:shadow-[0_0_15px_rgba(255,255,255,0.3)]",
        scale: "hover:scale-[1.02]",
        none: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      hover: "default",
    },
  }
);

export interface GlassCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof glassCardVariants> {
  gradient?: string;
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant, size, hover, gradient, children, ...props }, ref) => {
    const gradientStyle = gradient
      ? {
          background: `linear-gradient(135deg, ${
            variant === "colored" ? gradient : "transparent"
          })`,
        }
      : {};

    return (
      <div
        ref={ref}
        className={cn(glassCardVariants({ variant, size, hover }), className)}
        style={gradientStyle}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GlassCard.displayName = "GlassCard";

export { GlassCard, glassCardVariants }; 