
"use client"

import * as React from "react"
import { Moon, Sun, Palette } from "lucide-react" // Added Palette icon
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator, // Added Separator
  DropdownMenuLabel, // Added Label
} from "@/components/ui/dropdown-menu"

export function ThemeToggle() {
  const { setTheme, theme } = useTheme()

  const themes = [
    { name: "Light", value: "light" },
    { name: "Dark", value: "dark" },
    { name: "System", value: "system" },
    { name: "Blue", value: "blue" },
    { name: "Dark Purple", value: "dark-purple" },
    { name: "Green Dark", value: "green-dark" },
    { name: "Amber", value: "amber" },
    { name: "Dark Red", value: "dark-red" },
    { name: "Midnight Ocean", value: "midnight-ocean" },
    { name: "Emerald Forest", value: "emerald-forest" },
    { name: "Cyber Neon", value: "cyber-neon" },
    { name: "Sunset Gold", value: "sunset-gold" },
    { name: "Arctic Frost", value: "arctic-frost" },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          {/* Use a different icon if current theme is not light or dark, or keep sun/moon based on resolved theme */}
          {/* For simplicity, keeping Sun/Moon based on light/dark resolved by system or direct set */}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Select Theme</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {themes.map((t) => (
          <DropdownMenuItem key={t.value} onClick={() => setTheme(t.value)} className={theme === t.value ? "bg-accent" : ""}>
            {/* Optionally add an icon next to each theme name */}
            {/* <Palette className="mr-2 h-4 w-4" /> */}
            {t.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
