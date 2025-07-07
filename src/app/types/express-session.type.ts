export type TGuest = {
  _id: string;
  session_id: string;
  ip_address?: string;
  user_agent?: string;
  fingerprint?: string;
  preferences: {
    theme?: 'light' | 'dark' | 'system';
    timezone?: string;
    language?: string;
  };
  created_at: Date;
  updated_at?: Date;
};
