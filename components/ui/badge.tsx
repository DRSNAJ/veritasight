import { HTMLAttributes } from "react";

type BadgeVariant = "gain" | "loss" | "neutral";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant: BadgeVariant;
  showArrow?: boolean;
}

const variants: Record<BadgeVariant, string> = {
  gain: "bg-gain/10 border-gain text-gain",
  loss: "bg-loss/10 border-loss text-loss",
  neutral: "bg-warning/10 border-warning text-warning",
};

const arrows: Record<BadgeVariant, string> = {
  gain: "↑",
  loss: "↓",
  neutral: "→",
};

export function Badge({
  variant,
  showArrow = false,
  children,
  className = "",
  ...props
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1 px-2 py-0.5
        text-xs font-mono font-medium
        border rounded
        ${variants[variant]}
        ${className}
      `}
      {...props}
    >
      {showArrow && <span>{arrows[variant]}</span>}
      {children}
    </span>
  );
}
