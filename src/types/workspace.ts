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
  updatedAt: string;
  deleteAt: string;
}

export interface WorkspaceUpdate {
  isActive?: boolean;
  updatedAt?: string;
}