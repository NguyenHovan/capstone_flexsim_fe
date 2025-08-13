export interface Category {
  id: string;
  categoryName: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deleteAt: string;
  courses: string[];
}

export interface CategoryForm {
  categoryName: string;
  isActive: boolean;
}
