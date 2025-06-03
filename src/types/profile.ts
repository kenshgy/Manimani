export interface Profile {
  id: string;
  name: string | null;
  username: string;
  email: string | null;
  avatar_url: string | null;
  bio: string | null;
  prefecture: string | null;
  city: string | null;
  street: string | null;
  postal_code: string | null;
  date_of_birth: string | null;
  created_at: string;
  updated_at: string;
} 