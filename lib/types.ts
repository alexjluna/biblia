export interface Book {
  number: number;
  name: string;
  abbrev: string;
  testament: "AT" | "NT";
  category: string;
  chapters_count: number;
}

export interface Verse {
  id: number;
  book_number: number;
  chapter: number;
  verse: number;
  text: string;
}

export interface Favorite {
  id: number;
  verse_id: number;
  created_at: string;
  book_name: string;
  book_number: number;
  chapter: number;
  verse: number;
  text: string;
}

export interface SearchResult {
  id: number;
  book_number: number;
  book_name: string;
  chapter: number;
  verse: number;
  text: string;
}

// Reading progress types

export interface ReadingProgress {
  bookNumber: number;
  readChapters: number[];
}

export interface BookProgress {
  bookNumber: number;
  bookName: string;
  chaptersCount: number;
  chaptersRead: number;
  completed: boolean;
}

export interface OverallProgress {
  totalChapters: number;
  chaptersRead: number;
  percentage: number;
  bookProgress: BookProgress[];
}

export interface ReadingPosition {
  bookNumber: number;
  bookName: string;
  chapter: number;
  verse: number;
  updatedAt: string;
}
