export type UserRole = 'admin' | 'member';

export interface GymSettings {
  id: string;
  gym_name: string;
  tagline: string;
  headline: string;
  phone: string;
  whatsapp_number: string;
  email: string;
  address: string;
  map_url: string;
  instagram_url: string;
  opening_hours: string;
  logo_url: string;
  member_portal_enabled: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Member {
  id: string;
  member_code: string;
  full_name: string;
  phone: string;
  email?: string;
  gender: 'Male' | 'Female' | 'Other';
  date_of_birth?: string;
  emergency_contact?: string;
  medical_notes?: string;
  status: 'active' | 'inactive' | 'expired' | 'pending';
  join_date: string;
  created_at?: string;
  current_plan_name?: string;
  expiry_date?: string;
}

export interface MembershipPlan {
  id: string;
  name: string;
  duration_months: number;
  price: number;
  description: string;
  benefits: string[];
  is_popular: boolean;
  is_published: boolean;
  display_order: number;
  created_at?: string;
}

export interface Membership {
  id: string;
  member_id: string;
  plan_id: string;
  start_date: string;
  expiry_date: string;
  status: 'active' | 'expired' | 'cancelled';
  amount_paid: number;
  payment_method: 'Cash' | 'UPI' | 'Card' | 'Bank Transfer';
  payment_reference?: string;
  notes?: string;
  created_at?: string;
  plan?: MembershipPlan;
  member?: Member;
}

export interface Trainer {
  id: string;
  name: string;
  specialization: string;
  experience: string;
  bio: string;
  photo_url: string;
  certifications: string[];
  is_active: boolean;
  display_order: number;
  created_at?: string;
}

export interface AttendanceRecord {
  id: string;
  member_id: string;
  check_in_date: string;
  check_in_time: string;
  session_type: 'Morning' | 'Evening' | 'General';
  notes?: string;
  created_at?: string;
  member?: Member;
}

export interface Exercise {
  id: string;
  plan_id: string;
  day_name: string;
  exercise_name: string;
  sets: number;
  reps: string;
  rest_seconds: number;
  instructions: string;
  demo_url?: string;
  display_order: number;
}

export interface WorkoutPlan {
  id: string;
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  days_per_week: number;
  is_published: boolean;
  exercises?: Exercise[];
  created_at?: string;
}

export interface WorkoutAssignment {
  id: string;
  member_id: string;
  plan_id: string;
  assigned_date: string;
  notes?: string;
  plan?: WorkoutPlan;
}

export interface WorkoutProgress {
  id: string;
  member_id: string;
  exercise_id: string;
  date: string;
  weight_kg: number;
  reps_completed: number;
  notes?: string;
}

export interface DietMeal {
  name: string;
  time: string;
  items: string;
  portions: string;
  notes?: string;
}

export interface DietPlan {
  id: string;
  title: string;
  goal: 'Bulking' | 'Cutting' | 'Muscle Gain' | 'Fat Loss' | 'General Fitness';
  dietary_preference: 'Non-Vegetarian' | 'Vegetarian' | 'Eggetarian';
  description: string;
  calories_est?: number;
  protein_g?: number;
  carbs_g?: number;
  fats_g?: number;
  meals: DietMeal[];
  document_url?: string;
  is_published: boolean;
  created_at?: string;
}

export interface DietAssignment {
  id: string;
  member_id: string;
  plan_id: string;
  assigned_date: string;
  special_notes?: string;
  plan?: DietPlan;
}

export interface Enquiry {
  id: string;
  name: string;
  phone: string;
  email?: string;
  plan_interest?: string;
  message: string;
  status: 'new' | 'contacted' | 'closed';
  admin_notes?: string;
  created_at: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: 'Equipment' | 'Gym Floor' | 'Transformation' | 'Training';
  image_url: string;
  display_order: number;
  is_published: boolean;
}
