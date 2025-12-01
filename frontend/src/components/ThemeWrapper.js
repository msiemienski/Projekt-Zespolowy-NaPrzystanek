"use client";
import { ThemeProvider } from "@/contexts/ThemeContext";

export default function ThemeWrapper({ children }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}

