import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { NoteList } from './components/NoteList';
import { Editor } from './components/Editor';
import { Note, Folder } from './types';
import { v4 as uuidv4 } from 'uuid'; // Since we don't have external libs, we'll mock ID gen

// Mock ID generator
const generateId = () => Math.random().toString(36).substring(2, 9);

const App: React.FC = () => {
  // --- State ---
  const [folders, setFolders] = useState<Folder[]>([
    { id: 'all', name: 'All Notes', type: 'system', count: 15 },
    { id: 'favorites', name: 'Favorites', type: 'system', count: 2 },
    { id: 'trash', name: 'Trash', type: 'system', count: 5 },
    { id: 'drawing', name: 'Drawing', type: 'system' },
    { id: 'folder-1', name: 'First-Note', type: 'user', count: 2 },
    { id: 'folder-2', name: 'Work', type: 'user', count: 8 },
    { id: 'folder-3', name: 'Personal', type: 'user', count: 5 },
  ]);

  const [activeFolderId, setActiveFolderId] = useState<string>('all');
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);

  // Dummy Initial Data
  const [notes, setNotes] = useState<Note[]>([
    {
      id: '1',
      title: 'Project Phoenix Roadmap',
      content: '1. Map District code to city and display on map\n2. Display description of column in Explanation column\n3. Reduce dashboard load time by implementing lazy loading for charts.\n\nNext steps involve discussing with the backend team about API optimization.',
      folderId: 'folder-2',
      isFavorite: true,
      createdAt: new Date('2025-11-21T10:00:00'),
      updatedAt: new Date('2025-11-21T14:30:00'),
    },
    {
      id: '2',
      title: 'Meeting Notes: Design Review',
      content: 'Attendees: Sarah, Mike, Kunal\n\nAction Items:\n- Revise the color palette for the dark mode.\n- Add more contrast to the sidebar buttons.\n\nMike suggested we look at Linear for inspiration.',
      folderId: 'folder-2',
      isFavorite: false,
      createdAt: new Date('2025-11-19T09:00:00'),
      updatedAt: new Date('2025-11-19T11:20:00'),
    },
    {
      id: '3',
      title: 'Grocery List',
      content: '- Milk\n- Eggs\n- Bread\n- Spinach\n- Coffee beans (Ethiopian)',
      folderId: 'folder-3',
      isFavorite: false,
      createdAt: new Date('2025-11-12T18:00:00'),
      updatedAt: new Date('2025-11-12T18:05:00'),
    },
    {
      id: '4',
      title: 'Idea for Blog Post',
      content: 'Topic: The future of AI in note-taking.\n\nKey points:\n- Context awareness\n- Auto-tagging\n- Graph connections between notes.',
      folderId: 'folder-1',
      isFavorite: true,
      createdAt: new Date('2025-11-11T08:00:00'),
      updatedAt: new Date('2025-11-11T08:30:00'),
    },
     {
      id: '5',
      title: 'React Component Structure',
      content: 'Remember to separate container and presentational components. Use hooks for logic.',
      folderId: 'folder-2',
      isFavorite: false,
      createdAt: new Date('2025-10-25T10:00:00'),
      updatedAt: new Date('2025-10-25T12:00:00'),
    },
  ]);

  // --- Handlers ---

  const handleSelectFolder = (id: string) => {
    setActiveFolderId(id);
    setActiveNoteId(null); // Deselect note when changing folder
  };

  const handleSelectNote = (id: string) => {
    setActiveNoteId(id);
  };

  const handleCreateNote = () => {
    const newNote: Note = {
      id: generateId(),
      title: '',
      content: '',
      folderId: activeFolderId === 'all' || activeFolderId === 'favorites' || activeFolderId === 'trash' ? 'folder-1' : activeFolderId,
      isFavorite: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setNotes([newNote, ...notes]);
    setActiveNoteId(newNote.id);
  };

  const handleUpdateNote = (id: string, updates: Partial<Note>) => {
    setNotes(prevNotes => 
      prevNotes.map(note => 
        note.id === id ? { ...note, ...updates } : note
      )
    );
  };

  // --- Derived State ---

  const getFilteredNotes = () => {
    if (activeFolderId === 'all') return notes;
    if (activeFolderId === 'favorites') return notes.filter(n => n.isFavorite);
    if (activeFolderId === 'trash') return []; // Mock empty for now
    return notes.filter(n => n.folderId === activeFolderId);
  };

  const activeFolder = folders.find(f => f.id === activeFolderId);
  const activeNote = notes.find(n => n.id === activeNoteId);

  return (
    <div className="flex h-screen bg-neutral-900 text-neutral-200 font-sans overflow-hidden selection:bg-indigo-500/30 selection:text-indigo-200">
      <Sidebar 
        folders={folders} 
        activeFolderId={activeFolderId} 
        onSelectFolder={handleSelectFolder} 
      />
      
      <NoteList 
        notes={getFilteredNotes()}
        activeNoteId={activeNoteId}
        folderName={activeFolder?.name || 'Notes'}
        onSelectNote={handleSelectNote}
        onCreateNote={handleCreateNote}
      />

      <Editor 
        note={activeNote} 
        onUpdateNote={handleUpdateNote}
      />
    </div>
  );
};

export default App;
