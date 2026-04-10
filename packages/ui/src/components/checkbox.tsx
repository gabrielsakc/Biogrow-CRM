import * as React from "react";
import { cn } from "../lib/utils";
import { Check } from "lucide-react";

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, checked, onCheckedChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onCheckedChange?.(e.target.checked);
    };

    return (
      <label className="inline-flex items-center cursor-pointer">
        <span className="relative inline-flex items-center justify-center">
          <input
            type="checkbox"
            ref={ref}
            checked={checked}
            onChange={handleChange}
            className="sr-only peer"
            {...props}
          />
          <span
            className={cn(
              "h-4 w-4 rounded border border-gray-300 bg-white transition-colors",
              "peer-checked:bg-emerald-600 peer-checked:border-emerald-600",
              "peer-focus:ring-2 peer-focus:ring-emerald-500 peer-focus:ring-offset-2",
              "flex items-center justify-center",
              className
            )}
          >
            {checked && <Check className="h-3 w-3 text-white" />}
          </span>
        </span>
      </label>
    );
  }
);

Checkbox.displayName = "Checkbox";

export { Checkbox };