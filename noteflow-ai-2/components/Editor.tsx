import React, { useState, useEffect } from 'react';
import { Note } from '../types';
import { generateNoteContent, generateTitle } from '../services/geminiService';
import { 
  MoreHorizontal, 
  Share2, 
  Download, 
  Clock, 
  Sparkles, 
  Image as ImageIcon,
  Loader2
} from 'lucide-react';

interface EditorProps {
  note: Note | undefined;
  onUpdateNote: (id: string, updates: Partial<Note>) => void;
}

export const Editor: React.FC<EditorProps> = ({ note, onUpdateNote }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [showAiInput, setShowAiInput] = useState(false);

  if (!note) {
    return (
      <div className="flex-1 bg-editor flex items-center justify-center text-neutral-600 flex-col gap-4">
        <div className="w-16 h-16 rounded-2xl bg-neutral-800/50 flex items-center justify-center">
            <Sparkles className="text-neutral-700" size={32} />
        </div>
        <p>Select a note or create a new one</p>
      </div>
    );
  }

  const handleAiAction = async (actionType: 'summarize' | 'continue' | 'custom') => {
    setIsGenerating(true);
    let prompt = '';
    
    if (actionType === 'summarize') prompt = "Summarize the above content in bullet points.";
    else if (actionType === 'continue') prompt = "Continue writing the next paragraph based on the context.";
    else prompt = aiPrompt;

    try {
      const newContent = await generateNoteContent(prompt, note.content);
      // Append if continue, replace/append logic can be refined. 
      // For this demo, we append unless it's empty, then we replace.
      const updatedContent = note.content + '\n\n' + newContent;
      
      onUpdateNote(note.id, { 
        content: updatedContent,
        updatedAt: new Date() 
      });

      // Auto-update title if it's generic
      if (note.title === "Untitled" || note.title === "New Note") {
        const newTitle = await generateTitle(updatedContent);
        onUpdateNote(note.id, { title: newTitle });
      }

    } catch (e) {
      alert("AI Service unavailable. Check API Key.");
    } finally {
      setIsGenerating(false);
      setShowAiInput(false);
      setAiPrompt('');
    }
  };

  return (
    <main className="flex-1 bg-editor flex flex-col h-full relative">
      
      {/* Editor Header */}
      <header className="h-16 px-8 border-b border-neutral-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3 text-xs text-neutral-500">
            <Clock size={14} />
            <span>Last edited {new Date(note.updatedAt).toLocaleString()}</span>
            <span className="bg-neutral-800 px-2 py-0.5 rounded text-[10px] text-neutral-400">
                {note.content.split(/\s+/).filter(n => n).length} words
            </span>
        </div>
        <div className="flex items-center gap-4 text-neutral-400">
          <button className="hover:text-neutral-200 flex items-center gap-2 text-sm">
            <Share2 size={16} />
            <span className="hidden sm:inline">Share</span>
          </button>
          <button className="hover:text-neutral-200 flex items-center gap-2 text-sm">
            <Download size={16} />
            <span className="hidden sm:inline">Export</span>
          </button>
          <button className="hover:text-neutral-200">
            <MoreHorizontal size={18} />
          </button>
        </div>
      </header>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="max-w-3xl mx-auto py-10 px-8">
            
            {/* Cover Image Placeholder (Clickable) */}
            <div className="w-full h-40 mb-8 rounded-xl border-2 border-dashed border-neutral-800 hover:border-neutral-700 bg-neutral-900/30 flex flex-col items-center justify-center text-neutral-600 transition-colors cursor-pointer group">
                {note.coverImage ? (
                    <img src={note.coverImage} alt="Cover" className="w-full h-full object-cover rounded-xl" />
                ) : (
                    <>
                        <ImageIcon size={24} className="mb-2 group-hover:text-indigo-400 transition-colors" />
                        <span className="text-sm">Add a cover image</span>
                    </>
                )}
            </div>

            {/* Title Input */}
            <input
                type="text"
                value={note.title}
                onChange={(e) => onUpdateNote(note.id, { title: e.target.value, updatedAt: new Date() })}
                placeholder="Untitled Note"
                className="w-full bg-transparent text-4xl font-bold text-neutral-100 placeholder-neutral-700 border-none focus:ring-0 focus:outline-none mb-6"
            />

            {/* AI Toolbar (Floating or Inline) */}
            <div className="flex items-center gap-2 mb-6">
                <button 
                    onClick={() => setShowAiInput(!showAiInput)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600/10 text-indigo-400 hover:bg-indigo-600/20 rounded-full text-xs font-medium transition-colors border border-indigo-600/20"
                >
                    <Sparkles size={12} />
                    Ask AI
                </button>
                <button 
                    onClick={() => handleAiAction('continue')}
                    disabled={isGenerating}
                    className="text-xs text-neutral-500 hover:text-neutral-300 px-2 py-1"
                >
                    Continue writing...
                </button>
                <button 
                     onClick={() => handleAiAction('summarize')}
                     disabled={isGenerating}
                     className="text-xs text-neutral-500 hover:text-neutral-300 px-2 py-1"
                >
                    Summarize
                </button>
            </div>

            {/* AI Input Box */}
            {showAiInput && (
                <div className="mb-6 bg-neutral-800/50 p-3 rounded-lg border border-neutral-700 animate-fade-in">
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            value={aiPrompt}
                            onChange={(e) => setAiPrompt(e.target.value)}
                            placeholder="Ask Gemini to edit, research, or format..."
                            className="flex-1 bg-neutral-900 border-neutral-800 rounded px-3 py-2 text-sm text-neutral-200 focus:ring-1 focus:ring-indigo-500 outline-none"
                            onKeyDown={(e) => e.key === 'Enter' && handleAiAction('custom')}
                        />
                        <button 
                            onClick={() => handleAiAction('custom')}
                            disabled={isGenerating || !aiPrompt.trim()}
                            className="bg-indigo-600 text-white p-2 rounded hover:bg-indigo-700 disabled:opacity-50"
                        >
                            {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                        </button>
                    </div>
                </div>
            )}

            {/* Main Content Textarea */}
            <textarea
                value={note.content}
                onChange={(e) => onUpdateNote(note.id, { content: e.target.value, updatedAt: new Date() })}
                placeholder="Start writing, or ask AI to help..."
                className="w-full h-[60vh] bg-transparent text-neutral-300 resize-none border-none focus:ring-0 focus:outline-none leading-relaxed text-lg font-light placeholder-neutral-700"
            />
        </div>
      </div>
    </main>
  );
};
