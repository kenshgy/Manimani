import { Profile } from './profile';
import { Hashtag } from './hashtag';

export interface Tweet {
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
} 