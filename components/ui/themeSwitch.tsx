'use client'

import * as React from 'react'
import { Palette } from 'lucide-react'
import { useTheme } from 'next-themes'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function ThemeSwitcher() {
  const { setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Palette className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Select Theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme('light')}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')}>
          System
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('high-contrast')}>
          High Contrast
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('high-contrast-dark')}>
          High Contrast Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('crimson-red')}>
          Crimson Red
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('ocean-blue')}>
          Ocean Blue
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('hacker-green')}>
          Hacker Green
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('fluffy-pink')}>
          Fluffy Pink
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('baby-blue')}>
          Baby Blue
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}