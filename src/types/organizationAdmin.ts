// types/organizationAdmin.ts
import type { Account } from './account';

export interface OrganizationAdmin extends Omit<Account, 'id' | 'createdAt' | 'updatedAt' | 'deleteAt'> {
  organizationId: string;
  userName: string;
  fullName: string;
  email: string;
  phone: string;
  password: string;
  isEmailVerify: boolean;
  organizationRole?: string; 
  isActive: boolean; // Loại bỏ ? để khớp với Account
}

// Type cho payload khi tạo Organization Admin, khớp với API
export type OrganizationAdminForm = Pick<OrganizationAdmin, 'organizationId' | 'userName' | 'fullName' | 'email' | 'phone' | 'password'>;