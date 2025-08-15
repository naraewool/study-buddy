export interface User {
  id: string;
  email: string;
  name: string;
  role: 'parent' | 'student';
  parentId?: string;
}

export interface StudyPlan {
  _id: string;
  title: string;
  description: string;
  studentId: string;
  parentId: string;
  dueDate: string;
  subject: string;
  estimatedDuration: number;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress' | 'completed';
  createdAt: string;
  completedAt?: string;
}

export interface StudyRecord {
  _id: string;
  planId: string;
  studentId: string;
  startTime: string;
  endTime?: string;
  actualDuration?: number;
  summary?: string;
  images: string[];
  difficulty?: 'easy' | 'medium' | 'hard';
  satisfaction?: number;
  createdAt: string;
}

export interface Notification {
  _id: string;
  userId: string;
  planId?: string;
  type: 'study_reminder' | 'completion_notice' | 'daily_summary';
  title: string;
  message: string;
  isRead: boolean;
  scheduledTime?: string;
  sentAt?: string;
  createdAt: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}