"use client";
import { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from "react";

export default function Input({
  value,
  placeholder,
  onChange,
  disabled,
}: InputHTMLAttributes<HTMLInputElement>) {
  const classes = ["bg-white p-2 text-blue-900 rounded"];

  if (disabled) classes.push("opacity-50");
  return (
    <input
      value={value}
      placeholder={placeholder}
      onChange={onChange}
      disabled={disabled}
      className={classes.join(" ")}
    />
  );
}
