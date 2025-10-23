"use client"
import React, {useState, useEffect, useCallback, useMemo, useRef} from 'react';
import {
    ChevronRight,
    ChevronLeft,
    Plus,
    File,
    Trash2,
    Menu,
    X,
    Search,
    Calendar,
    Clock,
    AlertCircle,
    RefreshCw,
    Settings,
    LogOut
} from 'lucide-react';
import { useNotes, Note } from '@/contexts/NotesContext';
import {authService, notesApi} from '@/apis/Apis';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {useGlobalAlert} from "@/contexts/AlertContext.tsx";

interface SidebarProps {
    isOpen: boolean;
    toggleSidebar: () => void;
}

// Custom hook for search functionality with optimized performance
const useNoteSearch = (notes: Note[], searchTerm: string) => {
    return useMemo(() => {
        if (!searchTerm.trim()) return notes;

        const lowercaseSearch = searchTerm.toLowerCase();
        return notes.filter(note =>
            note.title?.toLowerCase().includes(lowercaseSearch) ||
            note.content?.toLowerCase().includes(lowercaseSearch)
        );
    }, [notes, searchTerm]);
};

// Custom hook for note sorting with better date handling
const useNoteSorting = (notes: Note[], sortBy: 'date' | 'title' = 'date') => {
    return useMemo(() => {
        return [...notes].sort((a, b) => {
            if (sortBy === 'title') {
                const titleA = a.title?.trim() || 'Untitled Note';
                const titleB = b.title?.trim() || 'Untitled Note';
                return titleA.localeCompare(titleB);
            }
            // Sort by updated date (most recent first)
            const dateA = new Date(a.updatedAt).getTime();
            const dateB = new Date(b.updatedAt).getTime();
            return dateB - dateA;
        });
    }, [notes, sortBy]);
};

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
    const {
        notes,
        currentNote,
        createNote,
        updateNote,
        deleteNote,
        setCurrentNote,
        isLoading,
        refreshNotes // Add this method to your context if not present
    } = useNotes();

    const [isCollapsed, setIsCollapsed] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState<'date' | 'title'>('date');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const { showAlert } = useGlobalAlert();
    // Ensure notes is always an array with better error handling
    const safeNotes = useMemo(() => {
        if (!notes) {
            console.warn('📝 Notes is null/undefined, using empty array');
            return [];
        }
        if (!Array.isArray(notes)) {
            console.error('📝 Notes is not an array:', typeof notes, notes);
            return [];
        }
        return notes;
    }, [notes]);

    // Apply search and sorting
    const searchedNotes = useNoteSearch(safeNotes, searchTerm);
    const sortedNotes = useNoteSorting(searchedNotes, sortBy);

    // Enhanced date formatting with relative time and better error handling
    const formatDate = useCallback((dateString: string) => {
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                return 'Invalid date';
            }

            const now = new Date();
            const diffInMs = now.getTime() - date.getTime();
            const diffInMinutes = diffInMs / (1000 * 60);
            const diffInHours = diffInMinutes / 60;
            const diffInDays = diffInHours / 24;

            if (diffInMinutes < 1) {
                return 'Just now';
            } else if (diffInMinutes < 60) {
                return `${Math.floor(diffInMinutes)}m ago`;
            } else if (diffInHours < 24) {
                return `${Math.floor(diffInHours)}h ago`;
            } else if (diffInDays < 7) {
                return `${Math.floor(diffInDays)}d ago`;
            } else {
                return date.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
                });
            }
        } catch (error) {
            console.error('❌ Date formatting error:', error);
            return 'Invalid date';
        }
    }, []);

    // Enhanced create note with real-time updates and double-click prevention
    const handleCreateNote = useCallback(async () => {
        const token=localStorage.getItem("token");
        if(!token){
            console.log("User not logged in!");
            showAlert({
                title: "Please Login",
                message: "User not logged in!",
                variant: "destructive"
            });
            return;
        }
        if (isCreating || isLoading) {
            console.log('⚠️ Note creation already in progress');
            return;
        }

        try {
            setIsCreating(true);
            console.log('➕ Creating new note...');

            const newNote = await createNote();

            // Ensure the new note is selected immediately
            if (newNote) {
                setCurrentNote(newNote);
            }

            // Clear search to show the new note
            setSearchTerm('');

        } catch (error) {
            console.error('❌ Failed to create note:', error);
        } finally {
            // Add small delay to prevent rapid double clicks
            setTimeout(() => {
                setIsCreating(false);
            }, 500);
        }
    }, [createNote, setCurrentNote, isCreating, isLoading]);

    // Enhanced update note with optimistic updates
    const handleUpdateNote = useCallback(async (id: string, data: Partial<Note>) => {
        try {
            console.log("📝 Updating note...", id);
            await updateNote(id, data);

            // Force a refresh of the current note if it's the one being updated
            if (currentNote?.id === id) {
                // The context should handle this automatically, but we can ensure it
                const updatedNote = safeNotes.find(note => note.id === id);
                if (updatedNote) {
                    setCurrentNote({...updatedNote, ...data});
                }
            }
        } catch (error) {
            console.error('❌ Failed to update note:', error);
        }
    }, [updateNote, currentNote, safeNotes, setCurrentNote]);

    // Enhanced delete with confirmation and better state management
    const handleDeleteNote = useCallback(async (noteId: string) => {
        if (showDeleteConfirm !== noteId) {
            setShowDeleteConfirm(noteId);
            // Auto-hide confirmation after 3 seconds
            setTimeout(() => {
                setShowDeleteConfirm(prev => prev === noteId ? null : prev);
            }, 3000);
            return;
        }

        try {
            console.log('🗑️ Deleting note:', noteId);
            await deleteNote(noteId);
            setShowDeleteConfirm(null);

            // If we're deleting the current note, select another one
            if (currentNote?.id === noteId) {
                const remainingNotes = safeNotes.filter(note => note.id !== noteId);
                if (remainingNotes.length > 0) {
                    setCurrentNote(remainingNotes[0]);
                } else {
                    setCurrentNote(null);
                }
            }
        } catch (error) {
            console.error('❌ Failed to delete note:', error);
            setShowDeleteConfirm(null);
        }
    }, [deleteNote, showDeleteConfirm, currentNote, safeNotes, setCurrentNote]);

    // Handle logout
    const handleLogout = useCallback(() => {
        console.log('🚪 Logging out...');
        authService.logout();
        window.location.href = '/';
    }, []);

    // Clear search when collapsed
    useEffect(() => {
        if (isCollapsed) {
            setSearchTerm('');
        }
    }, [isCollapsed]);

    // Focus search input when opening
    useEffect(() => {
        if (!isCollapsed && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [isCollapsed]);

    // Keyboard shortcuts with better handling and debouncing
    useEffect(() => {
        let createNoteTimeout: NodeJS.Timeout;

        const handleKeyboard = (e: KeyboardEvent) => {
            // Don't interfere with form inputs
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                if (e.key === 'Escape') {
                    setSearchTerm('');
                    (e.target as HTMLElement).blur();
                }
                return;
            }

            // Ctrl/Cmd + N for new note (with debouncing)
            if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
                e.preventDefault();

                // Clear any existing timeout
                if (createNoteTimeout) {
                    clearTimeout(createNoteTimeout);
                }

                // Debounce the create note call
                createNoteTimeout = setTimeout(() => {
                    // handleCreateNote();
                }, 100);
            }

            // Ctrl/Cmd + F for search focus
            if ((e.ctrlKey || e.metaKey) && e.key === 'f' && !isCollapsed) {
                e.preventDefault();
                searchInputRef.current?.focus();
            }

            // Escape to clear search
            if (e.key === 'Escape' && searchTerm) {
                setSearchTerm('');
            }
        };

        document.addEventListener('keydown', handleKeyboard);
        return () => {
            document.removeEventListener('keydown', handleKeyboard);
            if (createNoteTimeout) {
                clearTimeout(createNoteTimeout);
            }
        };
    }, [handleCreateNote, searchTerm, isCollapsed]);

    // Auto-refresh notes periodically for real-time updates
    useEffect(() => {
        if (typeof refreshNotes === 'function') {
            const interval = setInterval(() => {
                refreshNotes();
            }, 30000); // Refresh every 30 seconds

            return () => clearInterval(interval);
        }
    }, [refreshNotes]);

    // Render note item with improved performance
    const renderNoteItem = useCallback((note: Note) => {
        const isSelected = currentNote?.id === note.id;
        const isDeleteConfirm = showDeleteConfirm === note.id;
        const hasContent = note.content && note.content.trim().length > 0;
        const previewText = note.content?.slice(0, 50).replace(/\n/g, ' ') || '';
        const noteTitle = note.title?.trim() || 'Untitled Note';
        const isTemporary = String(note.id).startsWith('temp-');

        return (
            <TooltipProvider key={note.id}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div
                            onClick={() => !isDeleteConfirm && setCurrentNote(note)}
                            className={cn(
                                "flex items-center gap-2 py-2 px-3 rounded-md cursor-pointer transition-all duration-200 group relative",
                                isSelected
                                    ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                                    : "hover:bg-sidebar-accent/50",
                                isDeleteConfirm && "bg-destructive/10 border border-destructive/20"
                            )}
                        >
                            {/* Note icon with status indicator */}
                            <div className="relative flex-shrink-0">
                                <File size={isCollapsed ? 20 : 16} className={cn(
                                    hasContent ? "text-current" : "text-muted-foreground/50"
                                )} />
                                {!hasContent && (
                                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-500 rounded-full" />
                                )}
                                {isTemporary && (
                                    <RefreshCw size={8} className="absolute -bottom-1 -right-1 text-blue-500 animate-spin" />
                                )}
                            </div>

                            {!isCollapsed && (
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={cn(
                                            "font-medium truncate text-sm",
                                            noteTitle === 'Untitled Note' && "text-muted-foreground italic"
                                        )}>
                                            {noteTitle}
                                        </span>
                                        {isTemporary && (
                                            <Badge variant="secondary" className="text-xs">
                                                Saving...
                                            </Badge>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <Clock size={10}/>
                                        <span>{formatDate(note.updatedAt)}</span>
                                    </div>

                                    {previewText && (
                                        <p className="text-xs text-muted-foreground/80 truncate mt-1">
                                            {previewText}...
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Action buttons */}
                            {!isCollapsed && (
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteNote(note.id);
                                        }}
                                        disabled={isTemporary}
                                        className={cn(
                                            "h-6 w-6",
                                            isDeleteConfirm
                                                ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                : "hover:bg-destructive/10 hover:text-destructive"
                                        )}
                                    >
                                        {isDeleteConfirm ? (
                                            <AlertCircle size={12} />
                                        ) : (
                                            <Trash2 size={12} />
                                        )}
                                    </Button>
                                </div>
                            )}

                            {/* Selection indicator */}
                            {isSelected && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r" />
                            )}
                        </div>
                    </TooltipTrigger>
                    <TooltipContent side="right" className={cn(isCollapsed ? "block" : "hidden")}>
                        <div className="max-w-xs">
                            <p className="font-medium">{noteTitle}</p>
                            <p className="text-xs text-muted-foreground">{formatDate(note.updatedAt)}</p>
                            {previewText && (
                                <p className="text-xs mt-1">{previewText}...</p>
                            )}
                        </div>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );
    }, [currentNote, showDeleteConfirm, isCollapsed, formatDate, handleDeleteNote, setCurrentNote]);

    return (
        <>
            {/* Mobile sidebar toggle */}
            <div className="fixed top-4 left-4 z-40 lg:hidden">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={toggleSidebar}
                    className="rounded-full shadow-md"
                >
                    {isOpen ? <X size={18} /> : <Menu size={18} />}
                </Button>
            </div>

            {/* Sidebar overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
                    onClick={toggleSidebar}
                />
            )}

            {/* Main sidebar */}
            <aside
                className={cn(
                    "fixed top-0 left-0 h-full bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-300 ease-in-out z-30 lg:relative flex flex-col",
                    isOpen ? "translate-x-0 shadow-lg" : "-translate-x-full lg:translate-x-0",
                    isCollapsed ? "w-[60px]" : "w-[280px]"
                )}
            >
                {/* Sidebar header */}
                <div className="flex items-center justify-between p-3 border-b border-sidebar-border bg-sidebar/50">
                    {!isCollapsed && (
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                                <File size={16} className="text-primary-foreground" />
                            </div>
                            <h2 className="font-bold text-lg">Daily Diary</h2>
                        </div>
                    )}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="text-sidebar-foreground hover:text-sidebar-foreground/80 hover:bg-sidebar-accent"
                    >
                        {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                    </Button>
                </div>

                {/* Search bar */}
                {!isCollapsed && (
                    <div className="p-3 border-b border-sidebar-border">
                        <div className="relative">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                ref={searchInputRef}
                                placeholder="Search notes... (Ctrl+F)"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 h-8 bg-sidebar-accent/30 border-sidebar-accent"
                            />
                            {searchTerm && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setSearchTerm('')}
                                    className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
                                >
                                    <X size={12} />
                                </Button>
                            )}
                        </div>
                    </div>
                )}

                {/* Notes section header */}
                <div className="flex items-center justify-between p-3 border-b border-sidebar-border">
                    {!isCollapsed && (
                        <div className="flex items-center gap-2">
                            <span className="font-medium">Notes</span>
                            <Badge variant="secondary" className="text-xs">
                                {sortedNotes.length}
                            </Badge>
                        </div>
                    )}
                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleCreateNote}
                            disabled={isLoading || isCreating}
                            title="Create new note (Ctrl+N)"
                            className="h-8 w-8 text-sidebar-foreground hover:text-sidebar-foreground/80 hover:bg-sidebar-accent disabled:opacity-50"
                        >
                            {isLoading || isCreating ? (
                                <RefreshCw size={16} className="animate-spin" />
                            ) : (
                                <Plus size={16} />
                            )}
                        </Button>
                        {!isCollapsed && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setSortBy(sortBy === 'date' ? 'title' : 'date')}
                                title={`Sort by ${sortBy === 'date' ? 'title' : 'date'}`}
                                className="h-8 w-8 text-sidebar-foreground hover:text-sidebar-foreground/80 hover:bg-sidebar-accent"
                            >
                                {sortBy === 'date' ? <Calendar size={14} /> : <File size={14} />}
                            </Button>
                        )}
                    </div>
                </div>

                {/* Notes list */}
                <ScrollArea className="flex-1">
                    <div className="p-1 space-y-1">
                        {/* Loading state */}
                        {isLoading && safeNotes.length === 0 && (
                            <div className="flex items-center justify-center p-8">
                                <div className="text-center">
                                    <RefreshCw size={24} className="animate-spin text-muted-foreground mx-auto mb-2" />
                                    {!isCollapsed && (
                                        <p className="text-sm text-muted-foreground">Loading notes...</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Empty state */}
                        {!isLoading && safeNotes.length === 0 && (
                            <div className="flex items-center justify-center p-8">
                                <div className="text-center">
                                    <File size={32} className="text-muted-foreground/50 mx-auto mb-2" />
                                    {!isCollapsed && (
                                        <>
                                            <p className="text-sm text-muted-foreground mb-2">No notes yet</p>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={handleCreateNote}
                                                disabled={isCreating}
                                                className="text-xs"
                                            >
                                                {isCreating ? (
                                                    <RefreshCw size={12} className="mr-1 animate-spin" />
                                                ) : (
                                                    <Plus size={12} className="mr-1" />
                                                )}
                                                Create your first note
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* No search results */}
                        {!isLoading && safeNotes.length > 0 && sortedNotes.length === 0 && searchTerm && (
                            <div className="flex items-center justify-center p-8">
                                <div className="text-center">
                                    <Search size={24} className="text-muted-foreground/50 mx-auto mb-2" />
                                    {!isCollapsed && (
                                        <>
                                            <p className="text-sm text-muted-foreground mb-2">
                                                No notes found for "{searchTerm}"
                                            </p>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setSearchTerm('')}
                                                className="text-xs"
                                            >
                                                Clear search
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Notes list */}
                        {sortedNotes.map(renderNoteItem)}
                    </div>
                </ScrollArea>

                {/* Footer */}
                <div className="border-t border-sidebar-border">
                    {!isCollapsed && searchTerm && (
                        <div className="px-3 py-2 text-xs text-muted-foreground">
                            Showing {sortedNotes.length} of {safeNotes.length} notes
                        </div>
                    )}

                    <div className="p-2 flex items-center justify-between">
                        {!isCollapsed && (
                            <div className="text-xs text-muted-foreground">
                                {safeNotes.length} note{safeNotes.length !== 1 ? 's' : ''}
                            </div>
                        )}
                        <div className="flex items-center gap-1">
                            {typeof refreshNotes === 'function' && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={refreshNotes}
                                    title="Refresh notes"
                                    className="h-8 w-8 text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent"
                                >
                                    <RefreshCw size={14} />
                                </Button>
                            )}
                            {
                                authService.isAuthenticated()?<Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={handleLogout}
                                    title="Logout"
                                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                >
                                    <LogOut size={14} />
                                </Button>:
                                    null
                            }

                        </div>
                    </div>
                </div>

                {/* Development debug info */}
                {process.env.NODE_ENV === 'development' && !isCollapsed && (
                    <div className="absolute bottom-16 right-2 p-1 pointer-events-none">
                        <div className="text-xs text-muted-foreground/50 bg-sidebar/90 px-2 py-1 rounded">
                            Debug: {safeNotes.length} notes | {isLoading ? 'Loading' : 'Ready'}
                        </div>
                    </div>
                )}
            </aside>
        </>
    );
};

export default Sidebar;