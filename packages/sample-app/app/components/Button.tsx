"use client";
import { ButtonHTMLAttributes, ReactNode } from "react";

export default function Button({
  children,
  onClick,
  type = "button",
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className="p-2 rounded bg-blue-500 text-white"
      onClick={onClick}
      type={type}
    >
      {children}
    </button>
  );
}
