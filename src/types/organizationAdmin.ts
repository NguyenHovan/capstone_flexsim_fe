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
  isActive: boolean; 
}


export type OrganizationAdminForm = Pick<OrganizationAdmin, 'organizationId' | 'userName' | 'fullName' | 'email' | 'phone' | 'password'>;