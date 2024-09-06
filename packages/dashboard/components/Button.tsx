"use client";
import { ButtonHTMLAttributes, ReactNode } from "react";

export default function Button({
  children,
  onClick,
  type = "button",
  disabled,
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  const classes = ["p-2 rounded bg-blue-500 text-white text-sm"];

  if (disabled) classes.push("opacity-50");
  return (
    <button
      className={classes.join(" ")}
      onClick={onClick}
      type={type}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
