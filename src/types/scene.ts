// types/scene.ts
export interface Scene {
  id: string;
  sceneName: string;
  description: string;
  instructorId: string | null;   
  isActive: boolean;
  createdAt: string;            
  updatedAt?: string | null;
  deleteAt?: string | null;
  instructor?: InstructorLite | null;
  scenarios?: ScenarioLite[];
}

export interface SceneInput {
  instructorId: string;
  sceneName: string;
  description: string;
}

export type SceneUpdateInput = SceneInput;

export interface InstructorLite {
  id: string;
  userName?: string;
  fullName?: string;
  email?: string;
}

export interface ScenarioLite {
  id: string;
  scenarioName?: string;
  description?: string;
}
