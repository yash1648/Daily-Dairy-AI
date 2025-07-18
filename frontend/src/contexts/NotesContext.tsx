
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

interface NotesContextType {
  notes: Note[];
  currentNote: Note | null;
  createNote: () => void;
  updateNote: (id: string, data: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  setCurrentNote: (note: Note | null) => void;
}

const NotesContext = createContext<NotesContextType | undefined>(undefined);

interface NotesProviderProps {
  children: ReactNode;
}

export const NotesProvider = ({ children }: NotesProviderProps) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);

  // Load notes from localStorage on component mount
  useEffect(() => {
    const savedNotes = localStorage.getItem('notes');
    if (savedNotes) {
      try {
        const parsedNotes = JSON.parse(savedNotes) as Note[];
        setNotes(parsedNotes);
        
        // Set the first note as current if there's no current note
        if (parsedNotes.length > 0 && !currentNote) {
          setCurrentNote(parsedNotes[0]);
        }
      } catch (error) {
        console.error('Failed to parse notes from localStorage:', error);
      }
    } else {
      // Create a welcome note if there are no notes
      const welcomeNote: Note = {
        id: crypto.randomUUID(),
        title: '',
        content: ``,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setNotes([welcomeNote]);
      setCurrentNote(welcomeNote);
      localStorage.setItem('notes', JSON.stringify([welcomeNote]));
    }
  }, []);

  // Save notes to localStorage whenever they change
  useEffect(() => {
    if (notes.length > 0) {
      //Logic should be here

      localStorage.setItem('notes', JSON.stringify(notes));
    }
  }, [notes]);

  const createNote = () => {
    const newNote: Note = {
      id: crypto.randomUUID(),
      title: '',
      content: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setNotes((prevNotes) => [...prevNotes, newNote]);
    setCurrentNote(newNote);
  };

  const updateNote = (id: string, data: Partial<Note>) => {
    setNotes((prevNotes) =>
      prevNotes.map((note) =>
        note.id === id
          ? { ...note, ...data, updatedAt: new Date().toISOString() }
          : note
      )
    );

    if (currentNote && currentNote.id === id) {
      setCurrentNote((prevNote) =>
        prevNote ? { ...prevNote, ...data, updatedAt: new Date().toISOString() } : null
      );
    }
  };

  const deleteNote = (id: string) => {
    setNotes((prevNotes) => prevNotes.filter((note) => note.id !== id));

    // If the deleted note is the current note, set current note to the first available note
    if (currentNote && currentNote.id === id) {
      setNotes((prevNotes) => {
        if (prevNotes.length > 0 && prevNotes[0].id !== id) {
          setCurrentNote(prevNotes.find(note => note.id !== id) || null);
        } else {
          setCurrentNote(null);
        }
        return prevNotes;
      });
    }
  };

  return (
    <NotesContext.Provider
      value={{
        notes,
        currentNote,
        createNote,
        updateNote,
        deleteNote,
        setCurrentNote,
      }}
    >
      {children}
    </NotesContext.Provider>
  );
};

export const useNotes = () => {
  const context = useContext(NotesContext);
  if (context === undefined) {
    throw new Error('useNotes must be used within a NotesProvider');
  }
  return context;
};
