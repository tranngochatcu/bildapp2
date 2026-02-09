
export enum AppTab {
  DASHBOARD = 'DASHBOARD',
  CHAT = 'CHAT',
  LESSON_PLANNER = 'LESSON_PLANNER',
  INTERNAL_DOCS = 'INTERNAL_DOCS',
  TRANSLATION = 'TRANSLATION',
  LAB_GUIDE = 'LAB_GUIDE',
  TRAINING_MODULES = 'TRAINING_MODULES',
  SCHEDULE = 'SCHEDULE',
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
  isError?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
}

export interface StudentProgress {
  subject: string;
  score: number;
  progress: number;
  status: 'Weak' | 'Average' | 'Good' | 'Excellent';
}

export enum UserRole {
  STUDENT = 'Sinh viên',
  LECTURER = 'Giảng viên',
  ENGINEER = 'Kỹ sư',
}

export type AttachmentType = 'video' | 'document' | 'none';

export interface Lesson {
  id: string;
  title: string;
  content: string; // Markdown description
  duration: string;
  lastUpdated: string;
  attachmentUrl?: string;
  attachmentType?: AttachmentType;
  attachmentName?: string;
}

export interface Module {
  id: string;
  code: string;
  name: string;
  description: string;
  lessons: Lesson[];
}

export interface DocItem {
  id: string;
  name: string;
  type: 'PDF' | 'DOCX' | 'PPTX' | 'LAB' | 'OTHER';
  date: string;
  size: string;
  aiStatus: 'Synced' | 'Processing' | 'Pending';
  category: 'Giáo trình' | 'Slide Bài giảng' | 'Tài liệu Lab' | 'Tham khảo';
  fileUrl?: string; // URL for downloading the file (blob URL for uploads)
}
