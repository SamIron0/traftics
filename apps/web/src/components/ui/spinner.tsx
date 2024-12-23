import { cn } from "@/lib/utils";

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "default" | "lg";
}

export function Spinner({ className, size = "default", ...props }: SpinnerProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-full bg-primary/50",
        {
          "h-12 w-12": size === "sm",
          "h-16 w-16": size === "default",
          "h-20 w-20": size === "lg",
        },
        className
      )}
      {...props}
    />
  );
} 