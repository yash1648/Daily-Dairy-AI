"use client"
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNotes } from '@/contexts/NotesContext';
import { useGlobalAlert } from '@/contexts/AlertContext';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Save, Bot, Sparkles, ChevronDown, ChevronUp, Zap, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import useWebSocket from '@/hooks/useWebSocket';

interface WebSocketMessage {
  type: 'chunk' | 'complete' | 'error' | 'connected';
  content?: string;
  message?: string;
  timestamp?: number;
}

interface AISuggestion {
  id: string;
  content: string;
  timestamp: number;
  status: 'streaming' | 'complete' | 'error';
  trigger: 'save' | 'manual';
}

const NoteEditor: React.FC = () => {
  const { currentNote, updateNote } = useNotes();
  const { showAlert } = useGlobalAlert();

  // Core state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [previewMode, setPreviewMode] = useState(false);

  // AI state
  const [aiSuggestion, setAiSuggestion] = useState<AISuggestion | null>(null);
  const [isAiExpanded, setIsAiExpanded] = useState(false);
  const [isProcessingAi, setIsProcessingAi] = useState(false);
  const [currentStreamId, setCurrentStreamId] = useState<string | null>(null);
  const currentStreamIdRef = useRef<string | null>(null)

  // Auto-save tracking
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const aiContainerRef = useRef<HTMLDivElement>(null);

  // WebSocket handler
  const handleWebSocketMessage = useCallback((message: WebSocketMessage) => {
    try {
      switch (message.type) {
        case 'connected':
          showAlert({
            title: "🤖 AI Assistant Connected",
            message: "Ready to provide intelligent suggestions!",
            variant: "default"
          });
          break;

        case 'chunk':
          if (message.content && currentStreamIdRef.current) {
            setAiSuggestion(prev => prev ? {
              ...prev,
              content: prev.content + message.content,
              status: 'streaming'
            } : null);

            // Auto-expand AI panel when streaming starts
            if (!isAiExpanded) {
              setIsAiExpanded(true);
            }
          }
          break;

        case 'complete':
          if (currentStreamIdRef.current) {
            setAiSuggestion(prev => prev ? {
              ...prev,
              status: 'complete'
            } : null);
            setCurrentStreamId(null);
            setIsProcessingAi(false);
          }
          break;

        case 'error':
          setIsProcessingAi(false);
          setCurrentStreamId(null);
          showAlert({
            title: "⚠️ AI Error",
            message: message.message || "Failed to get AI suggestion. Please try again.",
            variant: "destructive"
          });
          if (currentStreamId) {
            setAiSuggestion(prev => prev ? {
              ...prev,
              status: 'error',
              content: prev.content || 'Failed to generate suggestion. Please try again.'
            } : null);
          }
          break;
      }
    } catch (error) {
      console.error('WebSocket message handling error:', error);
      setIsProcessingAi(false);
      setCurrentStreamId(null);
    }
  }, [currentStreamId, isAiExpanded, showAlert]);

  const { sendMessage } = useWebSocket(handleWebSocketMessage);

  // Update local state when currentNote changes
  useEffect(() => {
    if (currentNote) {
      setTitle(currentNote.title || '');
      setContent(currentNote.content || '');
      setHasUnsavedChanges(false);
      // Keep AI suggestion when switching notes, but mark it as from previous note
      if (aiSuggestion) {
        setAiSuggestion(prev => prev ? { ...prev, status: 'complete' } : null);
      }
    } else {
      setTitle('');
      setContent('');
      setHasUnsavedChanges(false);
      setAiSuggestion(null);
    }
  }, [currentNote]);

  // Track content changes
  const handleContentChange = useCallback((newContent: string) => {
    setContent(newContent);
    setHasUnsavedChanges(true);

    // Clear auto-save timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new auto-save timeout (5 seconds)
    saveTimeoutRef.current = setTimeout(() => {
      handleSave(false); // Auto-save without AI suggestion
    }, 5000);
  }, []);

  const handleTitleChange = useCallback((newTitle: string) => {
    setTitle(newTitle);
    setHasUnsavedChanges(true);
  }, []);

  // Request AI suggestion
  const requestAiSuggestion = useCallback((noteContent: string, noteTitle: string, trigger: 'save' | 'manual' = 'manual') => {
    if (!noteContent.trim() || noteContent.length < 15) {
      if (trigger === 'manual') {
        showAlert({
          title: "📝 Content Too Short",
          message: "Write at least 15 characters to get AI suggestions.",
          variant: "default"
        });
      }
      return;
    }

    if (isProcessingAi) {
      if (trigger === 'manual') {
        showAlert({
          title: "⏳ AI Busy",
          message: "AI is currently processing. Please wait...",
          variant: "default"
        });
      }
      return;
    }

    try {
      const streamId = `ai_${Date.now()}`;
      setCurrentStreamId(streamId);
      currentStreamIdRef.current = streamId
      setIsProcessingAi(true);

      // Create new suggestion
      const newSuggestion: AISuggestion = {
        id: streamId,
        content: '',
        timestamp: Date.now(),
        status: 'streaming',
        trigger
      };

      setAiSuggestion(newSuggestion);
      setIsAiExpanded(true);

      // Prepare AI prompt
      const promptData = {
        message: `Analyze this note and provide concise, actionable suggestions for improvement, insights, or related ideas:\n\nTitle: "${noteTitle}"\n\nContent: "${noteContent}"`,
        context: "This is a note-taking app. Provide helpful writing suggestions, content improvements, or relevant insights. Be concise and practical.",
        timestamp: Date.now()
      };

      sendMessage(promptData);

    } catch (error) {
      console.error('Error requesting AI suggestion:', error);
      setIsProcessingAi(false);
      setCurrentStreamId(null);
      showAlert({
        title: "❌ Request Failed",
        message: "Failed to request AI suggestion. Please try again.",
        variant: "destructive"
      });
    }
  }, [isProcessingAi, sendMessage, showAlert]);

  // Save function
  const handleSave = useCallback((withAi: boolean = true) => {
    if (!currentNote) return;

    try {
      updateNote(String(currentNote.id), { title, content });
      setHasUnsavedChanges(false);

      // Clear auto-save timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      if (withAi && content.trim().length >= 15) {
        // Request AI suggestion after save
        setTimeout(() => {
          requestAiSuggestion(content, title, 'save');
        }, 300);
      }

    } catch (error) {
      console.error('Error saving note:', error);
      showAlert({
        title: "❌ Save Failed",
        message: "Failed to save note. Please try again.",
        variant: "destructive"
      });
    }
  }, [currentNote, title, content, updateNote, showAlert, requestAiSuggestion]);

  // Auto-save when input loses focus
  const handleBlur = useCallback(() => {
    if (hasUnsavedChanges) {
      handleSave(false); // Save without AI on blur
    }
  }, [hasUnsavedChanges, handleSave]);

  // Manual save with Ctrl+S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave(true); // Save with AI on manual save
      }

      // Ctrl+Shift+A for AI suggestion
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        requestAiSuggestion(content, title, 'manual');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSave, requestAiSuggestion, content, title]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Markdown converter (enhanced from original)
  const convertMarkdownToHtml = useCallback((markdown: string) => {
    let html = markdown
        // Headers
        .replace(/^# (.*$)/gm, '<h1 class="text-3xl font-bold mb-4 text-gray-900 dark:text-gray-100">$1</h1>')
        .replace(/^## (.*$)/gm, '<h2 class="text-2xl font-semibold mb-3 text-gray-800 dark:text-gray-200">$1</h2>')
        .replace(/^### (.*$)/gm, '<h3 class="text-xl font-medium mb-2 text-gray-700 dark:text-gray-300">$1</h3>')
        .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900 dark:text-gray-100">$1</strong>')
        .replace(/\*(.*?)\*/g, '<em class="italic text-gray-800 dark:text-gray-200">$1</em>')
        .replace(/~~(.*?)~~/g, '<del class="line-through text-gray-600 dark:text-gray-400">$1</del>')
        .replace(/```([^`]+)```/g, '<pre class="bg-neutral-100 dark:bg-neutral-800 p-4 rounded-lg text-sm overflow-x-auto my-4 border"><code class="text-gray-800 dark:text-gray-200">$1</code></pre>')
        .replace(/`([^`]+)`/g, '<code class="bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded text-sm text-gray-800 dark:text-gray-200 border">$1</code>')
        .replace(/^\- (.*$)/gm, '<li class="ml-6 mb-1 text-gray-700 dark:text-gray-300">• $1</li>')
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-black dark:text-white hover:underline">$1</a>')
        .replace(/^\s*(\n)?(.+)/gm, function (m) {
          return /\<(\/)?(h1|h2|h3|li|pre)/.test(m) ? m : '<p class="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed">' + m + '</p>';
        })

    html = html.replace(/<li>(.*)<\/li>/g, '<ul class="mb-4"><li>$1</li></ul>').replace(/<\/ul>\s*<ul>/g, '')

    return html;
  }, []);

  const renderMarkdown = useCallback((text: string) => {
    return <div className="note-content prose prose-lg dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: convertMarkdownToHtml(text) }} />;
  }, [convertMarkdownToHtml]);

  // AI Suggestion Component
  const AISuggestionPanel = () => {
    if (!aiSuggestion) return null;

    const getStatusIcon = () => {
      switch (aiSuggestion.status) {
        case 'streaming':
          return <Loader2 size={16} className="animate-spin text-blue-500" />;
        case 'complete':
          return <CheckCircle2 size={16} className="text-green-500" />;
        case 'error':
          return <AlertCircle size={16} className="text-red-500" />;
        default:
          return <Bot size={16} className="text-gray-400" />;
      }
    };

    return (
        <div className="border-t bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50">
          <div
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-blue-100/50 dark:hover:bg-blue-900/30 transition-colors"
              onClick={() => setIsAiExpanded(!isAiExpanded)}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm border">
                <Sparkles size={16} className="text-blue-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  {getStatusIcon()}
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                  AI Suggestion
                </span>
                  {aiSuggestion.status === 'streaming' && (
                      <span className="text-xs text-blue-600 bg-blue-100 dark:bg-blue-900/50 px-2 py-1 rounded-full">
                    Writing...
                  </span>
                  )}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {aiSuggestion.status === 'streaming'
                      ? 'AI is analyzing your note...'
                      : aiSuggestion.status === 'complete'
                          ? 'Click to view AI insights'
                          : 'Error occurred'
                  }
                </div>
              </div>
            </div>
            <Button variant="ghost" size="sm">
              {isAiExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </Button>
          </div>

          {isAiExpanded && (
              <div
                  ref={aiContainerRef}
                  className="px-4 pb-4 max-h-64 overflow-y-auto"
              >
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border">
                  <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(aiSuggestion.timestamp).toLocaleTimeString()} • {aiSuggestion.trigger === 'save' ? 'Auto-generated' : 'Manual request'}
                </span>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => requestAiSuggestion(content, title, 'manual')}
                        disabled={isProcessingAi}
                        className="text-xs"
                    >
                      <Zap size={12} />
                      Refresh
                    </Button>
                  </div>

                  <div className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                    {aiSuggestion.content || (
                        aiSuggestion.status === 'streaming' ? (
                            <div className="flex items-center gap-2 text-gray-500">
                              <Loader2 size={14} className="animate-spin" />
                              AI is thinking and preparing suggestions...
                            </div>
                        ) : aiSuggestion.status === 'error' ? (
                            <div className="text-red-600 dark:text-red-400">
                              Failed to generate suggestion. Please try again.
                            </div>
                        ) : (
                            <div className="text-gray-500">
                              Waiting for AI response...
                            </div>
                        )
                    )}
                    {aiSuggestion.status === 'streaming' && aiSuggestion.content && (
                        <span className="inline-block w-0.5 h-4 bg-blue-500 ml-1 animate-pulse">|</span>
                    )}
                  </div>
                </div>
              </div>
          )}
        </div>
    );
  };

  if (!currentNote) {
    return (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center p-8">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4 mx-auto">
              <Bot size={32}/>
            </div>
            <h2 className="text-2xl font-semibold mb-2">No Note Selected</h2>
            <p>Select a note from the sidebar or create a new one.</p>
          </div>
        </div>

    );
  }

  return (
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="border-b p-4 flex items-center justify-between shadow-sm">
          <Input
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              onBlur={handleBlur}
              placeholder="Untitled Note"
              className="text-xl font-semibold border-none h-auto px-0 focus-visible:ring-0 bg-transparent"
          />
          <div className="flex items-center gap-2">
            {hasUnsavedChanges && (
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full animate-pulse"></div>
                  <span className="text-sm">Unsaved</span>
                </div>
            )}

            {isProcessingAi && (
                <div className="flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin"/>
                  <span className="text-sm">AI Working...</span>
                </div>
            )}

            <Button
                variant="outline"
                size="sm"
                onClick={() => setPreviewMode(!previewMode)}
            >
              {previewMode ? 'Edit' : 'Preview'}
            </Button>

            <Button
                variant="outline"
                size="sm"
                onClick={() => requestAiSuggestion(content, title, 'manual')}
                disabled={isProcessingAi || content.length < 15}
                title="Get AI Suggestion (Ctrl+Shift+A)"
            >
              <Sparkles size={16}/>
              AI Insight
            </Button>

            <Button
                variant="outline"
                size="icon"
                onClick={() => handleSave(true)}
                title="Save & Get AI Suggestion (Ctrl+S)"
                className={hasUnsavedChanges ? '' : ''}
            >
              <Save size={16}/>
            </Button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-4">
          {previewMode ? (
              renderMarkdown(content)
          ) : (
              <Textarea
                  value={content}
                  onChange={(e) => handleContentChange(e.target.value)}
                  onBlur={handleBlur}
                  placeholder="Start writing your note here...

💡 Tip: Your changes auto-save every 5 seconds
🚀 Press Ctrl+S to save and get AI suggestions
✨ Press Ctrl+Shift+A for instant AI insights"
                  className="min-h-full resize-none border-none focus-visible:ring-0 font-mono text-base leading-relaxed bg-transparent"
              />
          )}
        </div>

        {/* AI Suggestion Panel */}
        <AISuggestionPanel/>
      </div>

  );
};

export default NoteEditor;