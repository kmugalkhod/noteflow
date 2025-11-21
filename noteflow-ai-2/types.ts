export interface Note {
  id: string;
  title: string;
  content: string;
  folderId: string;
  isFavorite: boolean;
  createdAt: Date;
  updatedAt: Date;
  coverImage?: string;
}

export interface Folder {
  id: string;
  name: string;
  type: 'system' | 'user';
  icon?: string;
  count?: number;
}

export enum ViewMode {
  Card = 'card',
  Compact = 'compact'
}

export enum SortOption {
  DateDesc = 'Newest',
  DateAsc = 'Oldest',
  Title = 'Title'
}
