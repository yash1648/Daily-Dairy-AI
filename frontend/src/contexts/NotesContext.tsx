import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { notesApi } from '../apis/Apis.tsx';

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
    createNote: () => Promise<Note | null>;
    updateNote: (id: string, data: Partial<Note>) => Promise<void>;
    deleteNote: (id: string) => Promise<void>;
    setCurrentNote: (note: Note | null) => void;
    refreshNotes: () => Promise<void>;
    isLoading: boolean;
}

const NotesContext = createContext<NotesContextType | undefined>(undefined);

interface NotesProviderProps {
    children: ReactNode;
}

export const NotesProvider = ({ children }: NotesProviderProps) => {
    const [notes, setNotes] = useState<Note[]>([]);
    const [currentNote, setCurrentNote] = useState<Note | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const hasFetchedRef = useRef(false);
    const isInitializingRef = useRef(false);
    const isCreatingRef = useRef(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token && !hasFetchedRef.current && !isInitializingRef.current) {
            isInitializingRef.current = true;
            fetchNotesFromBackend();
        }
    }, []);

    const fetchNotesFromBackend = async () => {
        if (hasFetchedRef.current) return;

        setIsLoading(true);
        try {
            const fetchedNotes = await notesApi.getAllNotes();
            setNotes(fetchedNotes);
            hasFetchedRef.current = true;

            if (fetchedNotes.length > 0 && !currentNote) {
                setCurrentNote(fetchedNotes[0]);
            }
        } catch (error) {
            console.error('Failed to fetch notes:', error);
        } finally {
            setIsLoading(false);
            isInitializingRef.current = false;
        }
    };

    const createNote = useCallback(async (): Promise<Note | null> => {

            if (isCreatingRef.current || isLoading) return null;

            isCreatingRef.current = true;
            setIsLoading(true);
            let optimisticNote: Note | null = null;
            try {
                const newNoteData = {title: 'New Note', content: 'Hello this is new note'};
                optimisticNote = {
                    id: `temp-${Date.now()}`,
                    title: newNoteData.title,
                    content: newNoteData.content,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                };

                setNotes((prevNotes) => [optimisticNote, ...prevNotes]);
                setCurrentNote(optimisticNote);

                const newNote = await notesApi.createNote(newNoteData);
                setNotes((prevNotes) => prevNotes.map(note => note.id === optimisticNote.id ? newNote : note));
                setCurrentNote(newNote);
                return newNote;
            } catch (error) {
                console.error('Failed to create note:', error);
                setNotes((prevNotes) => prevNotes.filter(note => note.id !== optimisticNote.id));
                return null;
            } finally {
                setIsLoading(false);
                isCreatingRef.current = false;
            }

    }, [isLoading]);

    const updateNote = useCallback(async (id: string, data: Partial<Note>): Promise<void> => {

        if (id.startsWith('temp-')) return;

        const updatedData = { ...data, updatedAt: new Date().toISOString() };
        setNotes((prevNotes) => prevNotes.map(note => note.id === id ? { ...note, ...updatedData } : note));
        setCurrentNote((prevNote) => prevNote && prevNote.id === id ? { ...prevNote, ...updatedData } : prevNote);

        if (updateTimeoutRef.current) {
            clearTimeout(updateTimeoutRef.current);
        }

        updateTimeoutRef.current = setTimeout(async () => {
            try {
                await notesApi.updateNote(id, data);
            } catch (error) {
                console.error('Failed to update note:', error);
                setNotes((prevNotes) => prevNotes.map(note => note.id === id ? { ...note, updatedAt: note.updatedAt } : note));
            }
        }, 1000);
    }, []);

    const deleteNote = useCallback(async (id: string): Promise<void> => {
        if (String(id).startsWith('temp-')) {
            setNotes((prevNotes) => prevNotes.filter(note => note.id !== id));
            return;
        }

        setIsLoading(true);
        const noteToDelete = notes.find(note => note.id === id);
        const wasCurrentNote = currentNote?.id === id;

        try {
            setNotes((prevNotes) => prevNotes.filter(note => note.id !== id));
            if (wasCurrentNote) {
                const remainingNotes = notes.filter(note => note.id !== id);
                setCurrentNote(remainingNotes.length > 0 ? remainingNotes[0] : null);
            }
            await notesApi.deleteNote(id);
        } catch (error) {
            console.error('Failed to delete note:', error);
            if (noteToDelete) {
                setNotes((prevNotes) => [noteToDelete, ...prevNotes]);
                if (wasCurrentNote) {
                    setCurrentNote(noteToDelete);
                }
            }
        } finally {
            setIsLoading(false);
        }
    }, [notes, currentNote]);

    const refreshNotes = useCallback(async (): Promise<void> => {
        try {
            const updatedNotes = await notesApi.getAllNotes();
            setNotes(updatedNotes);
            if (currentNote) {
                const updatedCurrentNote = updatedNotes.find(note => note.id === currentNote.id);
                setCurrentNote(updatedCurrentNote || (updatedNotes.length > 0 ? updatedNotes[0] : null));
            }
        } catch (error) {
            console.error('Failed to refresh notes:', error);
        }
    }, [currentNote]);

    const resetNotes = useCallback(() => {
        setNotes([]);
        setCurrentNote(null);
        hasFetchedRef.current = false;
        isInitializingRef.current = false;
        isCreatingRef.current = false;
        if (updateTimeoutRef.current) {
            clearTimeout(updateTimeoutRef.current);
            updateTimeoutRef.current = null;
        }
    }, []);

    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'token' && !e.newValue) {
                resetNotes();
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [resetNotes]);

    useEffect(() => {
        return () => {
            if (updateTimeoutRef.current) {
                clearTimeout(updateTimeoutRef.current);
            }
        };
    }, []);

    const contextValue: NotesContextType = {
        notes,
        currentNote,
        createNote,
        updateNote,
        deleteNote,
        setCurrentNote,
        refreshNotes,
        isLoading,
    };

    return (
        <NotesContext.Provider value={contextValue}>
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
