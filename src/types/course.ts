export interface Course {
  key: string;
  name: string;
  category: number;
  workspace: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUpdateCourse {
  categoryId: string;
  workSpaceId: string;
  courseName: string;
  description: string;
  ratingAverage: number;
  imgUrl: string;
}
