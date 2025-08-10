export interface ClassItem {
  id: string;
  organizationId?: string | null;
  instructorId: string | null;
  courseId: string;
  className: string;
  description: string | null;
  numberOfStudent: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
  deleteAt: string | null;

  accountOfCourses?: any[];
  course?: any | null;
  instructor?: any | null;
}

export interface ClassForm {
  organizationId?: string;        
  instructorId?: string | null;
  courseId: string;
  className: string;
  description?: string | null;
  numberOfStudent?: number;
  isActive?: boolean;
}
