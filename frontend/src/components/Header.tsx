"use client"
import React from 'react';
import { Button } from '@/components/ui/button';

import {
  Moon,
  Sun,
  Command,
  Search, Fingerprint, UserCheck
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useCommandPalette } from '@/contexts/CommandPaletteContext';
import { useLoginPalette } from '@/contexts/LoginPaletteContext';
const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { openCommandPalette } = useCommandPalette();
  const { openLoginPalette, isLoggedIn } = useLoginPalette();
  return (
    <header className="border-b bg-background/90 backdrop-blur-sm sticky top-0 z-10">
      <div className="flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Button
              variant="outline"
              size="sm"
              className="hidden md:flex"
              onClick={openCommandPalette}
          >
            <Search className="mr-2 h-4 w-4"/>
            Search or run command...
            <kbd
                className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
              <span className="text-xs">⌘</span>K
            </kbd>
          </Button>
          <Button
              variant="outline"
              size="icon"
              className="md:hidden"
              onClick={openCommandPalette}
          >
            <Command className="h-4 w-4"/>
          </Button>
          <div className="flex items-center gap-2">
            <Button
                variant="outline"
                size="icon"
                onClick={toggleTheme}
                title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? (
                  <Moon className="h-4 w-4"/>
              ) : (
                  <Sun className="h-4 w-4"/>
              )}
            </Button>
          </div>
        </div>


        <div className="flex items-center gap-2">
          <Button
              variant="outline"
              size="icon"
              onClick= { openLoginPalette}
          >
            {isLoggedIn ? <UserCheck/> :  <Fingerprint/>}
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
