export interface Register {
  userName: string;
  fullName: string;
  email: string;
  phone: string;
  password: string;
}

export interface Login {
  userName: string;
  password: string;
}

export interface ForgotPassword {
  email: string;
}

export interface ChangePassword {
  currentPassword: string;
  newPassword: string;
}
