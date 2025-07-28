"use client"
import React, { useState, useRef, useEffect } from 'react';
import { Command } from 'cmdk';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { 
  FileText, 
  PlusCircle, 
  Trash, 
  Search, 
  Sun, 
  Moon 
} from 'lucide-react';
import { useCommandPalette } from '@/contexts/CommandPaletteContext';
import { useNotes } from '@/contexts/NotesContext';
import { useTheme } from '@/contexts/ThemeContext';

const CommandPalette: React.FC = () => {
  const { isOpen, closeCommandPalette } = useCommandPalette();
  const { notes, currentNote, createNote, deleteNote, setCurrentNote } = useNotes();
  const { theme, toggleTheme } = useTheme();
  const [search, setSearch] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus the input when the dialog opens
  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeCommandPalette()}>
      <DialogContent className="p-0 gap-0 max-w-[500px]">
        <Command className="rounded-lg border shadow-md">
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Command.Input
              ref={inputRef}
              value={search}
              onValueChange={setSearch}
              placeholder="Type a command or search..."
              className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <Command.List className="max-h-[300px] overflow-y-auto p-2">
            <Command.Empty className="py-6 text-center text-sm">
              No results found.
            </Command.Empty>

            <Command.Group heading="Actions">
              <Command.Item
                onSelect={() => {
                  createNote();
                  closeCommandPalette();
                }}
                className="flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-accent"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Create new note</span>
              </Command.Item>
              
              <Command.Item
                onSelect={() => {
                  toggleTheme();
                  closeCommandPalette();
                }}
                className="flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-accent"
              >
                {theme === 'light' ? (
                  <Moon className="h-4 w-4" />
                ) : (
                  <Sun className="h-4 w-4" />
                )}
                <span>Toggle {theme === 'light' ? 'dark' : 'light'} mode</span>
              </Command.Item>
            </Command.Group>

            {notes.length > 0 && (
              <Command.Group heading="Notes">
                {notes.map((note) => (
                  <Command.Item
                    key={note.id}
                    onSelect={() => {
                      setCurrentNote(note);
                      closeCommandPalette();
                    }}
                    className="flex items-center justify-between p-2 rounded-md cursor-pointer hover:bg-accent"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span>{note.title}</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNote(note.id);
                        if (notes.length <= 1) {
                          closeCommandPalette();
                        }
                      }}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash className="h-4 w-4" />
                    </button>
                  </Command.Item>
                ))}
              </Command.Group>
            )}
          </Command.List>
        </Command>
      </DialogContent>
    </Dialog>
  );
};

export default CommandPalette;
