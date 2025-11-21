import React, { useState } from 'react';
import { Note, ViewMode, SortOption } from '../types';
import { Search, Plus, SortDesc, LayoutList, LayoutGrid, Calendar, Star } from 'lucide-react';

interface NoteListProps {
  notes: Note[];
  activeNoteId: string | null;
  onSelectNote: (id: string) => void;
  onCreateNote: () => void;
  folderName: string;
}

export const NoteList: React.FC<NoteListProps> = ({ 
  notes, 
  activeNoteId, 
  onSelectNote, 
  onCreateNote,
  folderName 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Card);
  const [sortOption, setSortOption] = useState<SortOption>(SortOption.DateDesc);

  // Filter and Sort Logic
  const filteredNotes = notes
    .filter(note => 
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      note.content.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortOption === SortOption.DateDesc) return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      if (sortOption === SortOption.DateAsc) return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      return a.title.localeCompare(b.title);
    });

  // Helper for formatted date relative to today
  const getRelativeDateLabel = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return "Previous 7 Days";
    return "Older";
  };

  return (
    <div className="w-80 bg-list border-r border-neutral-800 flex flex-col h-full">
      
      {/* Header & Tools */}
      <div className="p-4 space-y-4 border-b border-neutral-800/50 bg-list z-10">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-neutral-100">{folderName}</h2>
          <div className="flex gap-1">
             <button 
              onClick={() => setViewMode(viewMode === ViewMode.Card ? ViewMode.Compact : ViewMode.Card)}
              className="p-2 hover:bg-neutral-800 rounded text-neutral-400 hover:text-white transition-colors"
              title="Toggle View"
            >
                {viewMode === ViewMode.Card ? <LayoutList size={18} /> : <LayoutGrid size={18} />}
            </button>
            <button 
                onClick={onCreateNote}
                className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded shadow-sm transition-colors"
            >
                <Plus size={18} />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative group">
          <Search className="absolute left-3 top-2.5 text-neutral-500 group-focus-within:text-indigo-400 transition-colors" size={16} />
          <input 
            type="text" 
            placeholder="Search notes..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-neutral-900 border border-neutral-800 text-sm text-neutral-200 rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-neutral-600"
          />
        </div>

        {/* Stats & Sort */}
        <div className="flex items-center justify-between text-xs text-neutral-500">
          <span>{filteredNotes.length} notes</span>
          <button className="flex items-center gap-1 hover:text-neutral-300">
            <span>{sortOption}</span>
            <SortDesc size={12} />
          </button>
        </div>
      </div>

      {/* Scrollable List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {filteredNotes.length === 0 ? (
            <div className="p-8 text-center text-neutral-600">
                <p>No notes found</p>
            </div>
        ) : (
            <div className="p-3 space-y-2">
            {filteredNotes.map((note) => (
                <div 
                key={note.id}
                onClick={() => onSelectNote(note.id)}
                className={`
                    group relative rounded-lg transition-all duration-200 cursor-pointer border border-transparent
                    ${activeNoteId === note.id 
                    ? 'bg-neutral-800/80 border-neutral-700 shadow-sm' 
                    : 'hover:bg-neutral-800/40 hover:border-neutral-800'}
                    ${viewMode === ViewMode.Compact ? 'p-3' : 'p-4'}
                `}
                >
                <div className="flex justify-between items-start mb-1">
                    <h3 className={`font-medium text-neutral-200 truncate pr-4 ${activeNoteId === note.id ? 'text-indigo-400' : ''}`}>
                    {note.title || 'Untitled Note'}
                    </h3>
                    {note.isFavorite && <Star size={12} className="text-yellow-500 fill-yellow-500 shrink-0" />}
                </div>

                {viewMode === ViewMode.Card && (
                    <p className="text-xs text-neutral-500 line-clamp-2 mb-3 leading-relaxed">
                    {note.content || 'No content'}
                    </p>
                )}

                <div className="flex items-center gap-2 text-[10px] text-neutral-600 font-medium">
                    <span className={activeNoteId === note.id ? 'text-neutral-400' : ''}>
                        {getRelativeDateLabel(note.updatedAt)}
                    </span>
                    {viewMode === ViewMode.Card && (
                        <>
                            <span>•</span>
                            <span>{new Date(note.updatedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        </>
                    )}
                </div>
                </div>
            ))}
            </div>
        )}
      </div>
    </div>
  );
};