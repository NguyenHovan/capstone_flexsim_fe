// types/scenario.ts
export interface Scenario {
  id: string;
  sceneId: string;
  instructorId: string;
  scenarioName: string;
  description: string;
  fileUrl?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string | null;
  deleteAt?: string | null;
  scene?: { id: string; sceneName?: string } | null;
  instructor?: { id: string; fullName?: string; userName?: string } | null;
  lessons?: any[];
  objectModels?: any[];
}
export interface ScenarioCreateInput {
  sceneId: string;
  instructorId: string;
  scenarioName: string;
  description: string;
  file?: File | null; 
}

export type ScenarioUpdateInput = ScenarioCreateInput;
