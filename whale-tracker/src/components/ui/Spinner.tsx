import { cn } from "@/lib/cn";

interface SpinnerProps {
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

const SIZE_STYLES = {
  xs: "w-3 h-3 border",
  sm: "w-4 h-4 border",
  md: "w-6 h-6 border-2",
  lg: "w-8 h-8 border-2",
};

export function Spinner({ size = "md", className }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cn(
        "inline-block rounded-full",
        "border-text-muted border-t-accent-cyan",
        "animate-spin",
        SIZE_STYLES[size],
        className
      )}
    />
  );
}
