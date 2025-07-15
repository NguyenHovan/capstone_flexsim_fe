export interface Account {
  id: string;
  organizationId: string;
  systemMode: boolean;
  organizationRole?: string; // Có thể không bắt buộc
  userName: string;
  password?: string; // Có thể không bắt buộc, tùy thuộc vào việc lưu trữ
  isEmailVerify: boolean;
  fullName: string;
  email: string;
  phone: string;
  gender: 'Male' | 'Female' | 'Other';
  address?: string; // Có thể không bắt buộc
  avtUrl?: string; // Có thể không bắt buộc
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null; // Có thể null nếu chưa cập nhật
  deleteAt: string | null; // Có thể null nếu chưa xóa
}
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