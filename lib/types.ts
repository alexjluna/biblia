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

// Ranking types

export interface RankingEntry {
  rank: number;
  userId: string;
  name: string;
  image: string | null;
  chaptersRead: number;
  percentage: number;
}

// Discussion types

export interface Discussion {
  id: number;
  verseId: number;
  createdBy: string;
  creatorName: string | null;
  messageCount: number;
  lastMessageAt: string | null;
  createdAt: string;
}

export interface DiscussionSummary {
  verseId: number;
  discussionId: number;
  messageCount: number;
}

export interface DiscussionMessage {
  id: number;
  discussionId: number;
  authorId: string;
  authorName: string | null;
  authorImage: string | null;
  content: string;
  parentId: number | null;
  parentPreview: string | null;
  parentAuthorName: string | null;
  likeCount: number;
  isLiked: boolean;
  isOwn: boolean;
  createdAt: string;
  editedAt: string | null;
}

export interface Notification {
  id: number;
  type: "reply" | "like" | "new_message";
  discussionId: number;
  messageId: number | null;
  fromUserName: string | null;
  fromUserImage: string | null;
  bookNumber: number;
  bookName: string;
  chapter: number;
  verse: number;
  isRead: boolean;
  createdAt: string;
}
