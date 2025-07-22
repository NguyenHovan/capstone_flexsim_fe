export interface Account {
  id: string;
  roleId: number; // 1-Admin, 2-OrgAdmin, 3-Instructor, 4-Student
  organizationId: string;
  userName: string;
  fullName: string;
  email: string;
  password?: string;
  phone: string;
  gender: number; // 0: Male, 1: Female, 2: Other
  address?: string;
  avtUrl?: string;
  isEmailVerify: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
  deleteAt: string | null;
}

export type AccountForm = Omit<Account, 'id' | 'createdAt' | 'updatedAt' | 'deleteAt' | 'isEmailVerify' | 'isActive' | 'avtUrl'> & {
  password: string;
  isActive: boolean;
};

export interface CreateUserForm {
  userName: string;
  password: string;
}

export interface ChangePassword {
  oldPassword: string;
  newPassword: string;
}

export interface ForgotPassword {
  email: string;
}

export interface Login {
  userName: string;
  password: string;
}

export interface Register {
  userName: string;
  password: string;
  email: string;
  fullName: string;
}
