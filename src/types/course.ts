export interface Course {
  id: string;
  instructorId: string | null;
  categoryId: string;
  workSpaceId: string;
  courseName: string;
  description: string;
  ratingAverage: number;
  imgUrl: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
  deleteAt: string | null;
  accountOfCourses: any[];
  category: any | null;
  certificateTempletes: any[];
  certificates: any[];
  classes: any[];
  courseProgresses: any[];
  instructor: any | null;
  reviews: any[];
  topics: any[];
  workSpace: any | null;
  instructorFullName: string;
}

export interface CreateUpdateCourse {
  categoryId: string;
  workSpaceId: string;
  courseName: string;
  description: string;
  ratingAverage: number;
  imgUrl: File;
}
