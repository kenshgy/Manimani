// プロフィールの型定義
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

// ハッシュタグの型定義
export interface Hashtag {
  id: string;
  name: string;
  created_at: string;
  memberCount?: number;
}

// ツイートの型定義
export type Tweet = {
  id: string;
  content: string;
  image_url: string | null;
  created_at: string;
  updated_at: string;
  user_id: string;
  profile: Profile;
  hashtags: Hashtag[];
  author_name: string;
  author_username: string;
  author_avatar: string;
  timestamp: string;
};

// フォームデータの型定義
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

// ログインフォームデータの型定義
export interface LoginFormData {
  email: string;
  password: string;
}

export * from './profile';
export * from './hashtag';
export * from './tweet';
export * from './auth'; 