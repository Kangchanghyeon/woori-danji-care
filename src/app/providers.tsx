"use client";

import { ThemeProvider } from "next-themes";
import { AccidentProvider } from "@/contexts/AccidentContext";
import { Toaster } from "@/components/ui/sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <AccidentProvider>
        {children}
        <Toaster position="top-center" richColors />
      </AccidentProvider>
    </ThemeProvider>
  );
}
