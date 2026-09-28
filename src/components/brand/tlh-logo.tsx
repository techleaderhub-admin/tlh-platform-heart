import type { ImgHTMLAttributes } from "react";

type TLHLogoProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "alt"> & {
  variant?: "full" | "icon";
};

export function TLHLogo({ variant = "full", className = "", ...props }: TLHLogoProps) {
  return (
    <img
      src={variant === "full" ? "/tlh-logo.jpg" : "/tlh-icon.png"}
      alt="Tech Leader Hub"
      className={className}
      {...props}
    />
  );
}
