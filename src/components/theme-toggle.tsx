
"use client"

import * as React from "react"
import { Moon, Sun, Palette } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator, 
  DropdownMenuLabel, 
} from "@/components/ui/dropdown-menu"

export function ThemeToggle() {
  const { setTheme, theme: currentTheme } = useTheme()

  const themes = [
    { name: "Claro", value: "light" },
    { name: "Oscuro", value: "dark" },
    { name: "Sistema", value: "system" },
    { name: "Azul", value: "blue" },
    { name: "Morado Oscuro", value: "dark-purple" },
    { name: "Verde Oscuro", value: "green-dark" },
    { name: "Ámbar", value: "amber" },
    { name: "Rojo Oscuro", value: "dark-red" },
    { name: "Océano Medianoche", value: "midnight-ocean" },
    { name: "Bosque Esmeralda", value: "emerald-forest" },
    { name: "Cyber Neón", value: "cyber-neon" },
    { name: "Dorado Atardecer", value: "sunset-gold" },
    { name: "Escarcha Ártica", value: "arctic-frost" },
  ];

  return (
    // This component is now designed to be used as a DropdownMenuItem itself
    // The DropdownMenu and Trigger will be part of the parent component (User Menu in Layout)
    // For standalone use, wrap it in DropdownMenu and DropdownMenuTrigger
    // This implementation is for direct use within the user menu in layout.tsx
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="w-full justify-start px-2 py-1.5 text-sm flex items-center gap-2 hover:bg-accent dark:hover:bg-slate-700">
          <Palette size={16} /> Cambiar Tema
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={5} className="w-56 bg-card border-border shadow-lg">
        <DropdownMenuLabel>Seleccionar Tema</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border"/>
        {themes.map((t) => (
          <DropdownMenuItem key={t.value} onClick={() => setTheme(t.value)} className={`cursor-pointer hover:bg-accent dark:hover:bg-slate-700 ${currentTheme === t.value ? "bg-accent text-accent-foreground dark:bg-slate-700" : ""}`}>
            {t.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
