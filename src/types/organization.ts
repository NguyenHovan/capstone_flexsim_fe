export interface Organization {
  id: string;
  organizationName: string;
  email: string;
  phone: string;
  address: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deleteAt: string;
}
export type OrganizationForm = {
  organizationName: string;
  email: string;
  phone: string;
  address: string;
  isActive: boolean;
};
