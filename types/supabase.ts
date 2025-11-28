export type Member = {
  id: string;
  created_at: string;
  first_name: string;
  last_name: string;
  birth_date: string | null;
  jersey_number: number | null;
  role: 'admin' | 'board' | 'member' | 'coach';
  joined_at: string | null;
  active: boolean;
  email: string | null;
  city_of_residence?: string | null;
  phone?: string | null;
  status?: 'active' | 'passive' | null;
  is_hidden?: boolean;
  
  stats_goals: number;
  stats_games: number;
  stats_attendance_count: number;
};

export type AppEvent = {
  id: string;
  title: string;
  start_time: string;
  end_time?: string;
  // NEU: Erweiterte Kategorien
  category: 'training' | 'match' | 'party' | 'general' | 'jhv' | 'schafkopf' | 'trip';
  location?: string;
  description?: string;
  
  recurrence_type?: 'weekly' | 'monthly' | 'once' | null;
  recurrence_exceptions?: string[] | null; 
  is_recurring?: boolean | null;
};