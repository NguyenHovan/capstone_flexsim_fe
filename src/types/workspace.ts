export interface Workspace {
  id: string;
  orderId?: string;
  organizationId: string;
  workSpaceName: string;
  numberOfAccount: number;
  imgUrl: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
  deleteAt: string | null;
}

export interface WorkspaceForm {
  orderId?: string;
  organizationId: string;
  workSpaceName: string;      // bắt buộc khi create
  numberOfAccount?: number;
  imgUrl: string;             // bắt buộc khi create
  description: string;        // bắt buộc khi create
  isActive?: boolean;
  updatedAt?: string | null;
}
