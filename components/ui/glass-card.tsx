import React from "react";
import { cn } from "./utils";
import { VariantProps, cva } from "class-variance-authority";

const glassCardVariants = cva(
  "rounded-xl backdrop-blur-[15px] transition-all duration-300 relative overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-white/15 border border-white/30 shadow-[0_10px_30px_rgba(0,0,0,0.15),0_2px_8px_rgba(255,255,255,0.1)_inset]",
        dark: "bg-black/30 border border-white/15 shadow-[0_10px_35px_rgba(0,0,0,0.25),0_2px_8px_rgba(255,255,255,0.05)_inset]",
        light: "bg-white/20 border border-white/40 shadow-[0_10px_30px_rgba(0,0,0,0.1),0_2px_10px_rgba(255,255,255,0.2)_inset]",
        colored: "border border-white/30 shadow-[0_10px_30px_rgba(0,0,0,0.15),0_2px_8px_rgba(255,255,255,0.1)_inset]",
      },
      size: {
        sm: "p-3",
        md: "p-5",
        lg: "p-7",
      },
      hover: {
        default: "hover:bg-white/20 hover:border-white/40",
        glow: "hover:shadow-[0_0_25px_rgba(255,255,255,0.3)] hover:border-white/50",
        scale: "hover:scale-[1.02] hover:shadow-[0_15px_40px_rgba(0,0,0,0.2)] hover:border-white/40",
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
  glassBefore?: boolean;
  glassHighlight?: boolean;
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant, size, hover, gradient, glassBefore = false, glassHighlight = true, children, ...props }, ref) => {
    const gradientStyle = gradient
      ? {
          background: `linear-gradient(135deg, ${
            variant === "colored" ? gradient : "transparent"
          })`,
          backdropFilter: "blur(15px)",
        }
      : {
          backdropFilter: "blur(15px)",
        };

    return (
      <div
        ref={ref}
        className={cn(
          glassCardVariants({ variant, size, hover }), 
          glassBefore && "before:absolute before:content-[''] before:inset-0 before:bg-gradient-to-br before:from-white/15 before:to-transparent before:rounded-xl before:pointer-events-none",
          glassHighlight && "after:absolute after:content-[''] after:left-0 after:right-0 after:top-0 after:h-[30%] after:bg-gradient-to-b after:from-white/20 after:to-transparent after:opacity-70 after:rounded-t-xl after:pointer-events-none",
          className
        )}
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