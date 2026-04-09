import * as React from "react";
import { cn, getInitials } from "../lib/utils";

interface AvatarProps {
  src?: string | null;
  name: string;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  xs: "h-6 w-6 text-[10px]",
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
};

function Avatar({ src, name, size = "md", className }: AvatarProps) {
  const [imgError, setImgError] = React.useState(false);

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center shrink-0 rounded-full overflow-hidden bg-emerald-100",
        sizeMap[size],
        className
      )}
    >
      {src && !imgError ? (
        <img
          src={src}
          alt={name}
          className="h-full w-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <span className="font-semibold text-emerald-700 select-none">
          {getInitials(name)}
        </span>
      )}
    </div>
  );
}

export { Avatar };
