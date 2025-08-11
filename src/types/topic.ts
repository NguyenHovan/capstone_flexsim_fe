
export interface Topic {
  id: string;
  courseId: string;
  topicName: string;
  orderIndex: number;
  imgUrl: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
  deleteAt: string | null;
  course?: any | null;
  lessons?: any[];
  scenarios?: any[];
}
