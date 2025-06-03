export interface SignUpFormData {
  name: string;
  email: string;
  password: string;
  passwordConfirm: string;
  terms: boolean;
  prefecture: string;
  city: string;
  street: string;
  postal_code: string;
}

export interface LoginFormData {
  email: string;
  password: string;
} 