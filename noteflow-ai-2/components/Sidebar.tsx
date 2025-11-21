import React from 'react';
import { 
  Folder, 
  Star, 
  Trash2, 
  PenTool, 
  Plus, 
  Settings, 
  Moon,
  Layout,
  Search
} from 'lucide-react';
import { Folder as FolderType } from '../types';

interface SidebarProps {
  folders: FolderType[];
  activeFolderId: string;
  onSelectFolder: (id: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ folders, activeFolderId, onSelectFolder }) => {
  
  const renderIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case 'all notes': return <Layout size={18} />;
      case 'favorites': return <Star size={18} />;
      case 'trash': return <Trash2 size={18} />;
      case 'drawing': return <PenTool size={18} />;
      default: return <Folder size={18} />;
    }
  };

  const systemFolders = folders.filter(f => f.type === 'system');
  const userFolders = folders.filter(f => f.type === 'user');

  return (
    <aside className="w-64 bg-sidebar flex flex-col border-r border-neutral-800 h-full text-neutral-400">
      {/* Header */}
      <div className="p-5 flex items-center justify-between">
        <div className="flex items-center gap-3 text-neutral-100 font-semibold">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <span className="font-bold text-sm">N</span>
          </div>
          <span>Noteflow</span>
        </div>
        <button className="p-1.5 hover:bg-neutral-800 rounded-md transition-colors">
            <Layout size={16} />
        </button>
      </div>

      {/* System Folders */}
      <nav className="flex-1 overflow-y-auto py-2 px-3 space-y-6">
        <div>
          <ul className="space-y-1">
            {systemFolders.map(folder => (
              <li key={folder.id}>
                <button
                  onClick={() => onSelectFolder(folder.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors ${
                    activeFolderId === folder.id 
                      ? 'bg-indigo-600/10 text-indigo-400 font-medium' 
                      : 'hover:bg-neutral-800/50 hover:text-neutral-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {renderIcon(folder.name)}
                    <span>{folder.name}</span>
                  </div>
                  {folder.count !== undefined && folder.count > 0 && (
                    <span className="text-xs opacity-60">{folder.count}</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* User Folders */}
        <div>
          <div className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-500 flex justify-between items-center">
            <span>Folders</span>
            <button className="hover:text-neutral-200 transition-colors">
                <Plus size={14} />
            </button>
          </div>
          <ul className="space-y-1">
            {userFolders.map(folder => (
              <li key={folder.id}>
                <button
                  onClick={() => onSelectFolder(folder.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors ${
                    activeFolderId === folder.id 
                      ? 'bg-indigo-600/10 text-indigo-400 font-medium' 
                      : 'hover:bg-neutral-800/50 hover:text-neutral-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {renderIcon(folder.name)}
                    <span>{folder.name}</span>
                  </div>
                  {folder.count !== undefined && folder.count > 0 && (
                    <span className="text-xs opacity-60">{folder.count}</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Footer/User */}
      <div className="p-4 border-t border-neutral-800">
         <button className="flex items-center gap-3 w-full hover:bg-neutral-800 p-2 rounded-lg transition-colors">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                KM
            </div>
            <div className="flex-1 text-left">
                <p className="text-sm text-neutral-200 font-medium">Kunal M.</p>
                <p className="text-xs text-neutral-500">Pro Plan</p>
            </div>
            <Settings size={16} />
         </button>
      </div>
    </aside>
  );
};
