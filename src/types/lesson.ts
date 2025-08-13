export interface Lesson {
  id: string;
  topicId: string;
  lessonName: string;
  title: string;
  description: string;
  status: number; // 1 = active, 0 = inactive
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
  deleteAt: string | null;
  lessonProgresses: any[]; 
  quizzes: any[];
  statusNavigation: any;
  topic: any;
}
