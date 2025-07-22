// src/types/workspace.ts
export interface Workspace {
  id: string;
  orderId: string;
  organizationId: string;
  workSpaceName: string;
  numberOfAccount: number;
  imgUrl: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
  deleteAt: string | null;
  accountOfWorkSpaces: string[];
  courses: Course[];
  orders: string[];
  packages: string[];
  sceneOfWorkSpaces: SceneOfWorkspace[];
}

export interface Course {
  id: string;
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
  category: Category;
  classes: string[];
  enrollmentRequests: string[];
  reviews: string[];
  topics: Topic[];
  workSpace: string;
}

export interface Category {
  id: string;
  categoryName: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
  deleteAt: string | null;
  courses: string[];
}

export interface Topic {
  id: string;
  sceneId: string;
  courseId: string;
  topicName: string;
  imgUrl: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
  deleteAt: string | null;
  course: string;
  lessons: Lesson[];
  scene: Scene;
}

export interface Lesson {
  id: string;
  topicId: string;
  lessonName: string;
  title: string;
  description: string;
  statusId: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
  deleteAt: string | null;
  quizzes: string[];
  status: Status;
  topic: string;
}

export interface Status {
  id: number;
  name: string;
  lessons: string[];
}

export interface Scene {
  id: string;
  sceneName: string;
  description: string;
  imgUrl: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
  deleteAt: string | null;
  packageOfScenes: string[];
  scenarios: Scenario[];
  sceneOfWorkSpaces: string[];
  topics: string[];
}

export interface Scenario {
  id: string;
  sceneId: string;
  scenarioName: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
  deleteAt: string | null;
  scene: string;
}

export interface SceneOfWorkspace {
  id: string;
  sceneId: string;
  workSpaceId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
  deleteAt: string | null;
  scene: Scene;
  workSpace: string;
}

// Type cho payload tạo hoặc cập nhật workspace
export type WorkspaceForm = Partial<Pick<Workspace, 'workSpaceName' | 'description' | 'isActive'>> & {
  updatedAt?: string | null; // Thêm updatedAt làm tùy chọn
};