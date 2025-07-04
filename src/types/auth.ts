export interface Register {
  userName: string;
  fullName: string;
  email: string;
  phone: string;
  password: string;
}

export interface Login {
  email: string;
  password: string;
}

export interface ForgotPassword {
  email: string;
}
