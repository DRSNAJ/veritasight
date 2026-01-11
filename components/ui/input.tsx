import { forwardRef, InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error, className = "", ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`
          w-full px-3 py-2 bg-secondary border rounded-lg
          text-text-primary placeholder:text-text-muted font-mono
          focus:outline-none focus:ring-1
          transition-colors duration-150
          ${
            error
              ? "border-loss focus:border-loss focus:ring-loss"
              : "border-border-subtle focus:border-veritasight-blue focus:ring-veritasight-blue"
          }
          ${className}
        `}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
