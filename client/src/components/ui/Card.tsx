import { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hoverable?: boolean;
}

export function Card({ children, hoverable = false, className = "", ...rest }: CardProps) {
  return (
    <div
      className={`rounded-2xl border border-ink-100 bg-white p-4 shadow-card ${
        hoverable ? "transition-shadow hover:shadow-card-hover" : ""
      } ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}