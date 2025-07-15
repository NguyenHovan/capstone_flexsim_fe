export interface Organization {
  id: string;
  organizationName: string;
  email: string;
  phone: string;
  address: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
  deleteAt: string | null;
  accounts?: any[];
  orders?: any[];
}

export interface OrganizationForm {
  organizationName: string;
  email: string;
  phone: string;
  address: string;
  isActive: boolean;
  updatedAt?: string | null | undefined;
  deleteAt?: string | null | undefined;
  createdAt?: string | null | undefined;
  accounts?: any[] | null | undefined; 
  orders?: any[] | null | undefined;  
}