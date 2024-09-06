"use client";
import { InputHTMLAttributes } from "react";

export default function Input({
  value,
  placeholder,
  onChange,
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      value={value}
      placeholder={placeholder}
      onChange={onChange}
      className="bg-white p-2 text-blue-900 rounded"
    />
  );
}
