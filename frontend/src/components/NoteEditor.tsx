
import React, { useEffect, useState } from 'react';
import { useNotes } from '@/contexts/NotesContext';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';

const NoteEditor: React.FC = () => {
  const { currentNote, updateNote } = useNotes();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [previewMode, setPreviewMode] = useState(false);

  // Update local state when currentNote changes
  useEffect(() => {
    if (currentNote) {
      setTitle(currentNote.title);
      setContent(currentNote.content);
    } else {
      setTitle('');
      setContent('');
    }
  }, [currentNote]);

  // Auto-save when input loses focus
  const handleBlur = () => {
    if (currentNote) {
      updateNote(String(currentNote.id), { title, content });
    }
  };

  // Manual save with Ctrl+S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (currentNote) {
          updateNote(currentNote.id, { title, content });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentNote, title, content, updateNote]);

  if (!currentNote) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center p-8">
          <h2 className="text-2xl font-semibold mb-2">No Note Selected</h2>
          <p className="text-muted-foreground">Select a note from the sidebar or create a new one.</p>
        </div>
      </div>
    );
  }

  const renderMarkdown = (text: string) => {
    return <div className="note-content prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: convertMarkdownToHtml(text) }} />;
  };

  // Simple markdown to HTML converter (a more robust solution would use a proper markdown library)
  const convertMarkdownToHtml = (markdown: string) => {
    let html = markdown
      // Headers
      .replace(/^# (.*$)/gm, '<h1>$1</h1>')
      .replace(/^## (.*$)/gm, '<h2>$1</h2>')
      .replace(/^### (.*$)/gm, '<h3>$1</h3>')
      // Bold
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Italic
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Strike
      .replace(/~~(.*?)~~/g, '<del>$1</del>')
      // Code blocks
      .replace(/```([^`]+)```/g, '<pre><code>$1</code></pre>')
      // Inline code
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      // Lists
      .replace(/^\- (.*$)/gm, '<li>$1</li>')
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
      // Paragraphs
      .replace(/^\s*(\n)?(.+)/gm, function (m) {
        return /\<(\/)?(h1|h2|h3|li|pre)/.test(m) ? m : '<p>' + m + '</p>';
      });

    // Fix lists
    html = html.replace(/<li>(.*)<\/li>/g, '<ul><li>$1</li></ul>').replace(/<\/ul>\s*<ul>/g, '');
    
    return html;
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <div className="border-b p-4 flex items-center justify-between">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleBlur}
          placeholder="Untitled Note"
          className="text-xl font-semibold border-none h-auto px-0 focus-visible:ring-0"
        />
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPreviewMode(!previewMode)}
          >
            {previewMode ? 'Edit' : 'Preview'}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleBlur}
            title="Save (Ctrl+S)"
          >
            <Save size={16} />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {previewMode ? (
          renderMarkdown(content)
        ) : (
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onBlur={handleBlur}
            placeholder="Start writing your note here..."
            className="min-h-full resize-none border-none focus-visible:ring-0 font-mono"
          />
        )}
      </div>
    </div>
  );
};

export default NoteEditor;
