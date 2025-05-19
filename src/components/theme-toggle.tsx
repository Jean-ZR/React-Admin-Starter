
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
  const { setTheme, theme: currentTheme } = useTheme() // Renamed theme to currentTheme to avoid conflict

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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {/* This Button can be styled or replaced if used in the new sidebar menu */}
        <Button variant="ghost" className="w-full justify-start px-2 py-1.5 text-sm flex items-center gap-2">
          <Palette size={16} /> Cambiar Tema
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Seleccionar Tema</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {themes.map((t) => (
          <DropdownMenuItem key={t.value} onClick={() => setTheme(t.value)} className={currentTheme === t.value ? "bg-accent text-accent-foreground" : ""}>
            {t.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
