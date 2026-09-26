import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  FileText,
  Plus,
  Trash2,
  Pin,
  PinOff,
  Search,
  Download,
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Code,
  Quote,
  Link as LinkIcon,
  Table,
  Eye,
  Edit3,
  Columns,
  Sparkles,
  CheckCircle2,
  Clock,
  Tag,
} from 'lucide-react';
import { marked } from 'marked';
import { Note } from '../types';
import { formatDisplayDate } from '../utils/storage';

interface NotesPageProps {
  notes: Note[];
  onUpdateNotes: (notes: Note[]) => void;
}

// Configure marked options
marked.setOptions({
  gfm: true,
  breaks: true,
});

export const NotesPage: React.FC<NotesPageProps> = ({ notes, onUpdateNotes }) => {
  const [selectedNoteId, setSelectedNoteId] = useState<string>(
    notes.length > 0 ? notes[0].id : ''
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'split' | 'edit' | 'preview'>('split');
  const [lastSavedTime, setLastSavedTime] = useState<string>('Just now');
  const [isSavedIndicatorVisible, setIsSavedIndicatorVisible] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Currently active note
  const activeNote = useMemo(() => {
    return notes.find((n) => n.id === selectedNoteId) || notes[0] || null;
  }, [notes, selectedNoteId]);

  // Make sure selectedNoteId is valid
  useEffect(() => {
    if (!selectedNoteId && notes.length > 0) {
      setSelectedNoteId(notes[0].id);
    }
  }, [notes, selectedNoteId]);

  // Render markdown to HTML safely
  const renderedHtml = useMemo(() => {
    if (!activeNote || !activeNote.content) return '';
    try {
      return marked.parse(activeNote.content) as string;
    } catch (e) {
      console.error('Markdown parse error:', e);
      return '<p class="text-rose-400">Error rendering markdown.</p>';
    }
  }, [activeNote]);

  // Update note field and save to local storage
  const handleUpdateNoteField = (fields: Partial<Note>) => {
    if (!activeNote) return;
    const now = new Date();
    const updated = notes.map((n) =>
      n.id === activeNote.id
        ? {
            ...n,
            ...fields,
            updatedAt: now.toISOString(),
          }
        : n
    );
    onUpdateNotes(updated);

    // Trigger save indicator
    setLastSavedTime(
      now.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit', second: '2-digit' })
    );
    setIsSavedIndicatorVisible(true);
  };

  // Create new note
  const handleCreateNote = () => {
    const newNote: Note = {
      id: `note-${Date.now()}`,
      title: 'Untitled Note',
      content: `# New Note

Start writing markdown here...
- Tasks
- Ideas
- Meeting points
`,
      tags: ['General'],
      isPinned: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onUpdateNotes([newNote, ...notes]);
    setSelectedNoteId(newNote.id);
  };

  // Delete note
  const handleDeleteNote = (noteId: string) => {
    if (notes.length <= 1) {
      // Clear content instead of removing sole note
      handleUpdateNoteField({ title: 'Untitled Note', content: '' });
      return;
    }
    const updated = notes.filter((n) => n.id !== noteId);
    onUpdateNotes(updated);
    if (selectedNoteId === noteId) {
      setSelectedNoteId(updated[0]?.id || '');
    }
  };

  // Toggle pin
  const handleTogglePin = (noteId: string) => {
    const updated = notes.map((n) => (n.id === noteId ? { ...n, isPinned: !n.isPinned } : n));
    onUpdateNotes(updated);
  };

  // Toolbar action: insert markdown syntax at cursor position
  const insertMarkdown = (prefix: string, suffix = '', defaultText = '') => {
    const textarea = textareaRef.current;
    if (!textarea || !activeNote) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = activeNote.content;
    const selection = text.substring(start, end) || defaultText;

    const replacement = `${prefix}${selection}${suffix}`;
    const newContent = text.substring(0, start) + replacement + text.substring(end);

    handleUpdateNoteField({ content: newContent });

    // Reset cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selection.length);
    }, 0);
  };

  // Download note as .md file
  const handleExportMarkdownFile = () => {
    if (!activeNote) return;
    const element = document.createElement('a');
    const file = new Blob([activeNote.content], { type: 'text/markdown' });
    element.href = URL.createObjectURL(file);
    element.download = `${(activeNote.title || 'note').replace(/\s+/g, '_')}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Filtered notes list (pinned first, then by date)
  const filteredNotes = useMemo(() => {
    return notes
      .filter((n) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          n.title.toLowerCase().includes(q) ||
          n.content.toLowerCase().includes(q) ||
          n.tags.some((t) => t.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
  }, [notes, searchQuery]);

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-indigo-400" />
            Markdown Notes & Scratchpad
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            Write rich notes in Markdown with real-time preview, saved continuously to local storage.
          </p>
        </div>

        {/* View Mode Switcher & Download */}
        <div className="flex items-center gap-2">
          {/* Saved Status Indicator */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-400">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Saved: {lastSavedTime}</span>
          </div>

          <div className="flex items-center bg-zinc-900 p-1 rounded-xl border border-zinc-800">
            <button
              onClick={() => setViewMode('split')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                viewMode === 'split' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'
              }`}
              title="Split View (Editor & Formatted Preview)"
            >
              <Columns className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('edit')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                viewMode === 'edit' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'
              }`}
              title="Edit Markdown Only"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('preview')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                viewMode === 'preview' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'
              }`}
              title="Formatted Preview Only"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleExportMarkdownFile}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-xs font-medium text-zinc-300 transition-colors"
            title="Download .md file"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export .md</span>
          </button>
        </div>
      </div>

      {/* Main Container: Sidebar + Editor */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 min-h-[680px]">
        {/* Left Column: Notes List Sidebar (4 cols) */}
        <div className="md:col-span-4 bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 flex flex-col space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Notes ({notes.length})
            </h3>
            <button
              onClick={handleCreateNote}
              className="flex items-center gap-1 px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Note</span>
            </button>
          </div>

          {/* Search box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Notes items list */}
          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 max-h-[580px]">
            {filteredNotes.length === 0 ? (
              <p className="text-xs text-zinc-500 text-center py-6">No matching notes found.</p>
            ) : (
              filteredNotes.map((note) => {
                const isSelected = activeNote?.id === note.id;
                const snippet = note.content
                  .replace(/^[#\-*`>]+\s*/gm, '')
                  .slice(0, 80)
                  .trim();

                return (
                  <div
                    key={note.id}
                    onClick={() => setSelectedNoteId(note.id)}
                    className={`group p-3 rounded-xl border transition-all cursor-pointer relative ${
                      isSelected
                        ? 'bg-zinc-800/90 border-indigo-500/50 shadow-md'
                        : 'bg-zinc-950/60 border-zinc-850 hover:bg-zinc-850/60 hover:border-zinc-700/60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1 mb-1">
                      <h4
                        className={`text-xs font-bold truncate flex-1 ${
                          isSelected ? 'text-white' : 'text-zinc-300'
                        }`}
                      >
                        {note.title || 'Untitled Note'}
                      </h4>

                      <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTogglePin(note.id);
                          }}
                          className={`p-1 rounded text-zinc-500 hover:text-amber-400 ${
                            note.isPinned ? 'text-amber-400' : ''
                          }`}
                          title={note.isPinned ? 'Unpin note' : 'Pin note'}
                        >
                          {note.isPinned ? (
                            <Pin className="w-3 h-3 fill-amber-400" />
                          ) : (
                            <Pin className="w-3 h-3" />
                          )}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteNote(note.id);
                          }}
                          className="p-1 rounded text-zinc-600 hover:text-rose-400 transition-colors"
                          title="Delete note"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <p className="text-[11px] text-zinc-500 line-clamp-2 leading-relaxed mb-2">
                      {snippet || 'Empty note...'}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-zinc-500">
                      <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
                      {note.tags.length > 0 && (
                        <span className="px-1.5 py-0.2 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
                          {note.tags[0]}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Markdown Editor & Formatted Preview (8 cols) */}
        <div className="md:col-span-8 bg-zinc-900/80 border border-zinc-800 rounded-2xl flex flex-col overflow-hidden shadow-xl">
          {activeNote ? (
            <>
              {/* Note Header: Title & Tags */}
              <div className="p-4 border-b border-zinc-800 bg-zinc-900/50 space-y-3">
                <input
                  type="text"
                  value={activeNote.title}
                  onChange={(e) => handleUpdateNoteField({ title: e.target.value })}
                  placeholder="Note Title"
                  className="w-full text-lg font-bold text-white bg-transparent border-0 focus:outline-none placeholder-zinc-600 tracking-tight"
                />

                {/* Markdown Toolbar */}
                <div className="flex flex-wrap items-center gap-1 pt-1 border-t border-zinc-800/80">
                  <button
                    onClick={() => insertMarkdown('**', '**', 'bold text')}
                    className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
                    title="Bold (**text**)"
                  >
                    <Bold className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => insertMarkdown('*', '*', 'italic text')}
                    className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
                    title="Italic (*text*)"
                  >
                    <Italic className="w-3.5 h-3.5" />
                  </button>
                  <div className="w-px h-4 bg-zinc-800 mx-1" />
                  <button
                    onClick={() => insertMarkdown('# ', '', 'Heading 1')}
                    className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
                    title="Heading 1 (# Heading)"
                  >
                    <Heading1 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => insertMarkdown('## ', '', 'Heading 2')}
                    className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
                    title="Heading 2 (## Heading)"
                  >
                    <Heading2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => insertMarkdown('### ', '', 'Heading 3')}
                    className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
                    title="Heading 3 (### Heading)"
                  >
                    <Heading3 className="w-3.5 h-3.5" />
                  </button>
                  <div className="w-px h-4 bg-zinc-800 mx-1" />
                  <button
                    onClick={() => insertMarkdown('- ', '', 'List item')}
                    className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
                    title="Bulleted list (- item)"
                  >
                    <List className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => insertMarkdown('1. ', '', 'Numbered item')}
                    className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
                    title="Numbered list (1. item)"
                  >
                    <ListOrdered className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => insertMarkdown('- [ ] ', '', 'Task item')}
                    className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
                    title="Checklist task (- [ ] task)"
                  >
                    <CheckSquare className="w-3.5 h-3.5" />
                  </button>
                  <div className="w-px h-4 bg-zinc-800 mx-1" />
                  <button
                    onClick={() => insertMarkdown('`', '`', 'code')}
                    className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
                    title="Inline Code (`code`)"
                  >
                    <Code className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => insertMarkdown('> ', '', 'Quote text')}
                    className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
                    title="Blockquote (> quote)"
                  >
                    <Quote className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => insertMarkdown('[', '](https://example.com)', 'Link text')}
                    className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
                    title="Link ([text](url))"
                  >
                    <LinkIcon className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() =>
                      insertMarkdown(
                        '\n| Column 1 | Column 2 |\n|---|---|\n| Item 1 | Item 2 |\n'
                      )
                    }
                    className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
                    title="Insert Table"
                  >
                    <Table className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Editor / Preview Workspaces */}
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-zinc-800 min-h-[480px]">
                {/* Editor Pane (shown if split or edit mode) */}
                {(viewMode === 'split' || viewMode === 'edit') && (
                  <div className={`p-4 flex flex-col ${viewMode === 'edit' ? 'md:col-span-2' : ''}`}>
                    <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-500 mb-2 uppercase tracking-wider">
                      <span>Markdown Source</span>
                      <span>{activeNote.content.length} characters</span>
                    </div>
                    <textarea
                      ref={textareaRef}
                      value={activeNote.content}
                      onChange={(e) => handleUpdateNoteField({ content: e.target.value })}
                      placeholder="Write your note in Markdown..."
                      className="w-full flex-1 min-h-[440px] bg-transparent font-mono text-xs sm:text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none resize-none leading-relaxed"
                    />
                  </div>
                )}

                {/* Formatted Preview Pane (shown if split or preview mode) */}
                {(viewMode === 'split' || viewMode === 'preview') && (
                  <div
                    className={`p-5 flex flex-col bg-zinc-950/40 overflow-y-auto ${
                      viewMode === 'preview' ? 'md:col-span-2' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-500 mb-3 uppercase tracking-wider">
                      <span>Formatted Preview</span>
                      <span className="text-indigo-400 font-medium">Live Render</span>
                    </div>
                    <div
                      className="markdown-body flex-1 overflow-y-auto pr-2"
                      dangerouslySetInnerHTML={{ __html: renderedHtml }}
                    />
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
              <FileText className="w-12 h-12 text-zinc-600 mb-3" />
              <h3 className="text-sm font-semibold text-zinc-300 mb-1">No note selected</h3>
              <p className="text-xs text-zinc-500 mb-4">Select a note from the left or create a new one.</p>
              <button
                onClick={handleCreateNote}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold"
              >
                Create Note
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
