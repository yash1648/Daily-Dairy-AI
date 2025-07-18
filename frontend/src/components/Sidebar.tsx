
import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronRight, 
  ChevronLeft,
  Plus, 
  File, 
  Trash2, 
  Menu, 
  X
} from 'lucide-react';
import { useNotes, Note } from '@/contexts/NotesContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  const { notes, currentNote, createNote, deleteNote, setCurrentNote } = useNotes();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <>
      {/* Mobile sidebar toggle */}
      <div className="fixed top-4 left-4 z-40 lg:hidden">
        <Button
          variant="outline"
          size="icon"
          onClick={toggleSidebar}
          className="rounded-full"
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
          "fixed top-0 left-0 h-full bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-300 ease-in-out z-30 lg:relative",
          isOpen ? "translate-x-0 shadow-lg" : "-translate-x-full lg:translate-x-0",
          isCollapsed ? "w-[60px]" : "w-[250px]"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar header */}
          <div className="flex items-center justify-between p-3 border-b border-sidebar-border">
            {!isCollapsed && <h2 className="font-bold text-lg">Daily Dairy</h2>}
            <div className="flex items-center ml-auto">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="text-sidebar-foreground hover:text-sidebar-foreground/80 hover:bg-sidebar-accent"
              >
                {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
              </Button>
            </div>
          </div>

          {/* Notes section */}
          <div className="flex-1 overflow-y-auto">
            <div className="flex items-center justify-between p-3">
              {!isCollapsed && <span className="font-medium">Notes</span>}
              <Button
                variant="ghost"
                size="icon"
                onClick={createNote}
                title="Create new note"
                className="text-sidebar-foreground hover:text-sidebar-foreground/80 hover:bg-sidebar-accent"
              >
                <Plus size={18} />
              </Button>
            </div>

            <div className="space-y-1 px-1">
              {notes.map((note) => (
                <div
                  key={note.id}
                  onClick={() => setCurrentNote(note)}
                  className={cn(
                    "flex items-center gap-2 py-2 px-3 rounded-md cursor-pointer transition-colors group",
                    currentNote?.id === note.id
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "hover:bg-sidebar-accent/50"
                  )}
                >
                  <File size={isCollapsed ? 20 : 16} />
                  {!isCollapsed && (
                    <div className="flex-1 truncate">
                      <div className="font-medium truncate">Date : {formatDate(note.updatedAt)}</div>
                      
                    </div>
                  )}
                  {!isCollapsed && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNote(note.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 size={14} />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
