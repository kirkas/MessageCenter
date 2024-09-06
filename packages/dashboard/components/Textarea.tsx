"use client";
import { TextareaHTMLAttributes } from "react";

export default function Textarea({
  value,
  placeholder,
  onChange,
  disabled,
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const classes = ["bg-white p-2 text-blue-900 rounded"];

  if (disabled) classes.push("opacity-50");
  return (
    <textarea
      value={value}
      placeholder={placeholder}
      onChange={onChange}
      disabled={disabled}
      className={classes.join(" ")}
    />
  );
}
