import { 
  GymSettings, Member, MembershipPlan, Membership, Trainer, 
  AttendanceRecord, WorkoutPlan, DietPlan, Enquiry, GalleryItem, DietAssignment, WorkoutAssignment 
} from '@/types';
import { 
  initialGymSettings, initialPlans, initialTrainers, initialMembers, 
  initialMemberships, initialAttendance, initialWorkoutPlans, 
  initialDietPlans, initialEnquiries, initialGallery 
} from './initialData';
import { supabase, isSupabaseConfigured } from './supabase';

const STORAGE_KEY_PREFIX = 'kkl_muscle_factory_';

function getLocal<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = localStorage.getItem(STORAGE_KEY_PREFIX + key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function setLocal<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save to localStorage', e);
  }
}

// -----------------------------------------------------------------------------
// TURSO SYNC HELPERS (Edge libSQL API bridge)
// -----------------------------------------------------------------------------
async function fetchFromTurso<T>(entity: string): Promise<T | null> {
  if (typeof window === 'undefined') return null;
  try {
    const res = await fetch(`/api/turso?entity=${entity}`);
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        return json.data as T;
      }
    }
  } catch {
    // Network or server offline; graceful fallback
  }
  return null;
}

async function saveToTurso(entity: string, data: any): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    await fetch('/api/turso', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entity, data }),
    });
  } catch (e) {
    console.warn(`[Turso Sync] Failed to save ${entity}`, e);
  }
}

async function deleteFromTurso(entity: string, id: string): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    await fetch(`/api/turso?entity=${entity}&id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  } catch (e) {
    console.warn(`[Turso Sync] Failed to delete ${entity}:${id}`, e);
  }
}

// -----------------------------------------------------------------------------
// GYM SETTINGS
// -----------------------------------------------------------------------------
export async function getGymSettings(): Promise<GymSettings> {
  // 1. Try Turso
  const tursoData = await fetchFromTurso<GymSettings>('settings');
  if (tursoData) {
    setLocal('settings', tursoData);
    return tursoData;
  }

  // 2. Try Supabase
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('gym_settings')
        .select('*')
        .eq('id', 'default')
        .single();
      if (!error && data) {
        setLocal('settings', data as GymSettings);
        return data as GymSettings;
      }
    } catch (e) {
      console.warn('Supabase getGymSettings fallback', e);
    }
  }

  // 3. Fallback to LocalStorage / Initial
  return getLocal<GymSettings>('settings', initialGymSettings);
}

export async function updateGymSettings(settings: Partial<GymSettings>): Promise<GymSettings> {
  const current = await getGymSettings();
  const updated: GymSettings = { ...current, ...settings, updated_at: new Date().toISOString() };

  setLocal('settings', updated);
  saveToTurso('settings', updated);

  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('gym_settings').upsert(updated);
    } catch (e) {
      console.error('Supabase updateGymSettings error', e);
    }
  }
  return updated;
}

// -----------------------------------------------------------------------------
// MEMBERSHIP PLANS
// -----------------------------------------------------------------------------
export async function getMembershipPlans(): Promise<MembershipPlan[]> {
  // 1. Try Turso
  const tursoData = await fetchFromTurso<MembershipPlan[]>('plans');
  if (tursoData && tursoData.length > 0) {
    setLocal('plans', tursoData);
    return tursoData;
  }

  // 2. Try Supabase
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('membership_plans')
        .select('*')
        .order('display_order', { ascending: true });
      if (!error && data && data.length > 0) {
        setLocal('plans', data as MembershipPlan[]);
        return data as MembershipPlan[];
      }
    } catch (e) {
      console.warn('Supabase getMembershipPlans fallback', e);
    }
  }

  return getLocal<MembershipPlan[]>('plans', initialPlans);
}

export async function saveMembershipPlan(plan: MembershipPlan): Promise<MembershipPlan[]> {
  const current = await getMembershipPlans();
  const index = current.findIndex(p => p.id === plan.id);
  let updated: MembershipPlan[];
  if (index >= 0) {
    updated = [...current];
    updated[index] = plan;
  } else {
    updated = [...current, plan];
  }

  setLocal('plans', updated);
  saveToTurso('plans', plan);

  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('membership_plans').upsert(plan);
    } catch (e) {
      console.error('Supabase saveMembershipPlan error', e);
    }
  }
  return updated;
}

export async function deleteMembershipPlan(id: string): Promise<MembershipPlan[]> {
  const current = await getMembershipPlans();
  const updated = current.filter(p => p.id !== id);

  setLocal('plans', updated);
  deleteFromTurso('plans', id);

  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('membership_plans').delete().eq('id', id);
    } catch (e) {
      console.error('Supabase deleteMembershipPlan error', e);
    }
  }
  return updated;
}

// -----------------------------------------------------------------------------
// MEMBERS
// -----------------------------------------------------------------------------
export async function getMembers(): Promise<Member[]> {
  // 1. Try Turso
  const tursoData = await fetchFromTurso<Member[]>('members');
  if (tursoData && tursoData.length > 0) {
    setLocal('members', tursoData);
    return tursoData;
  }

  // 2. Try Supabase
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        setLocal('members', data as Member[]);
        return data as Member[];
      }
    } catch (e) {
      console.warn('Supabase getMembers fallback', e);
    }
  }

  return getLocal<Member[]>('members', initialMembers);
}

export async function saveMember(member: Member): Promise<Member[]> {
  const current = await getMembers();
  const index = current.findIndex(m => m.id === member.id);
  let updated: Member[];
  if (index >= 0) {
    updated = [...current];
    updated[index] = member;
  } else {
    updated = [member, ...current];
  }

  setLocal('members', updated);
  saveToTurso('members', member);

  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('members').upsert(member);
    } catch (e) {
      console.error('Supabase saveMember error', e);
    }
  }
  return updated;
}

export async function toggleMemberStatus(id: string): Promise<Member[]> {
  const current = await getMembers();
  const updated = current.map(m => {
    if (m.id === id) {
      const nextStatus = m.status === 'active' ? 'inactive' : 'active';
      return { ...m, status: nextStatus as Member['status'] };
    }
    return m;
  });
  const modified = updated.find(m => m.id === id);
  if (modified) {
    setLocal('members', updated);
    saveToTurso('members', modified);
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('members').update({ status: modified.status }).eq('id', id);
      } catch (e) {
        console.error('Supabase toggleMemberStatus error', e);
      }
    }
  }
  return updated;
}

export async function deleteMember(id: string): Promise<Member[]> {
  const current = await getMembers();
  const updated = current.filter(m => m.id !== id);

  setLocal('members', updated);
  deleteFromTurso('members', id);

  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('members').delete().eq('id', id);
    } catch (e) {
      console.error('Supabase deleteMember error', e);
    }
  }
  return updated;
}

// -----------------------------------------------------------------------------
// TRAINERS
// -----------------------------------------------------------------------------
export async function getTrainers(): Promise<Trainer[]> {
  // 1. Try Turso
  const tursoData = await fetchFromTurso<Trainer[]>('trainers');
  if (tursoData && tursoData.length > 0) {
    setLocal('trainers', tursoData);
    return tursoData;
  }

  // 2. Try Supabase
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('trainers')
        .select('*')
        .order('display_order', { ascending: true });
      if (!error && data && data.length > 0) {
        setLocal('trainers', data as Trainer[]);
        return data as Trainer[];
      }
    } catch (e) {
      console.warn('Supabase getTrainers fallback', e);
    }
  }

  return getLocal<Trainer[]>('trainers', initialTrainers);
}

export async function saveTrainer(trainer: Trainer): Promise<Trainer[]> {
  const current = await getTrainers();
  const index = current.findIndex(t => t.id === trainer.id);
  let updated: Trainer[];
  if (index >= 0) {
    updated = [...current];
    updated[index] = trainer;
  } else {
    updated = [...current, trainer];
  }

  setLocal('trainers', updated);
  saveToTurso('trainers', trainer);

  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('trainers').upsert(trainer);
    } catch (e) {
      console.error('Supabase saveTrainer error', e);
    }
  }
  return updated;
}

export async function deleteTrainer(id: string): Promise<Trainer[]> {
  const current = await getTrainers();
  const updated = current.filter(t => t.id !== id);

  setLocal('trainers', updated);
  deleteFromTurso('trainers', id);

  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('trainers').delete().eq('id', id);
    } catch (e) {
      console.error('Supabase deleteTrainer error', e);
    }
  }
  return updated;
}

// -----------------------------------------------------------------------------
// ATTENDANCE
// -----------------------------------------------------------------------------
export async function getAttendance(): Promise<AttendanceRecord[]> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('attendance')
        .select('*, member:members(*)')
        .order('check_in_date', { ascending: false });
      if (!error && data) return data as AttendanceRecord[];
    } catch (e) {
      console.warn('Supabase getAttendance fallback', e);
    }
  }
  return getLocal<AttendanceRecord[]>('attendance', initialAttendance);
}

export interface CheckInResult {
  success: boolean;
  message: string;
  record?: AttendanceRecord;
}

export async function recordAttendance(
  memberId: string, 
  sessionType: 'Morning' | 'Evening' | 'General' = 'General',
  allowDuplicate: boolean = false
): Promise<CheckInResult> {
  const records = await getAttendance();
  const members = await getMembers();
  const member = members.find(m => m.id === memberId);

  if (!member) {
    return { success: false, message: 'Member not found.' };
  }

  if (member.status !== 'active') {
    return { success: false, message: `Member is currently marked as ${member.status}. Please renew membership.` };
  }

  const today = new Date().toISOString().split('T')[0];
  const existingToday = records.find(r => 
    r.member_id === memberId && 
    r.check_in_date === today &&
    (!allowDuplicate ? true : r.session_type === sessionType)
  );

  if (existingToday && !allowDuplicate) {
    return { 
      success: false, 
      message: `${member.full_name} is already checked in today at ${existingToday.check_in_time} (${existingToday.session_type}).` 
    };
  }

  const now = new Date();
  const checkInTime = now.toTimeString().split(' ')[0];

  const newRecord: AttendanceRecord = {
    id: 'att-' + Date.now(),
    member_id: memberId,
    check_in_date: today,
    check_in_time: checkInTime,
    session_type: sessionType,
    member: member,
  };

  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('attendance').insert({
        member_id: memberId,
        check_in_date: today,
        check_in_time: checkInTime,
        session_type: sessionType,
      });
    } catch (e) {
      console.error('Supabase recordAttendance error', e);
    }
  }

  const updated = [newRecord, ...records];
  setLocal('attendance', updated);

  return { 
    success: true, 
    message: `Attendance recorded for ${member.full_name} (${member.member_code}).`,
    record: newRecord 
  };
}

// -----------------------------------------------------------------------------
// WORKOUT PLANS & ASSIGNMENTS
// -----------------------------------------------------------------------------
export async function getWorkoutPlans(): Promise<WorkoutPlan[]> {
  // 1. Try Turso
  const tursoData = await fetchFromTurso<WorkoutPlan[]>('workouts');
  if (tursoData && tursoData.length > 0) {
    setLocal('workout_plans', tursoData);
    return tursoData;
  }

  // 2. Try Supabase
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('workout_plans')
        .select('*, exercises(*)')
        .order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        setLocal('workout_plans', data as WorkoutPlan[]);
        return data as WorkoutPlan[];
      }
    } catch (e) {
      console.warn('Supabase getWorkoutPlans fallback', e);
    }
  }

  return getLocal<WorkoutPlan[]>('workout_plans', initialWorkoutPlans);
}

export async function saveWorkoutPlan(plan: WorkoutPlan): Promise<WorkoutPlan[]> {
  const current = await getWorkoutPlans();
  const index = current.findIndex(p => p.id === plan.id);
  let updated: WorkoutPlan[];
  if (index >= 0) {
    updated = [...current];
    updated[index] = plan;
  } else {
    updated = [plan, ...current];
  }

  setLocal('workout_plans', updated);
  saveToTurso('workouts', plan);

  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('workout_plans').upsert({
        id: plan.id,
        title: plan.title,
        description: plan.description,
        difficulty: plan.difficulty,
        days_per_week: plan.days_per_week,
        is_published: plan.is_published,
      });
    } catch (e) {
      console.error('Supabase saveWorkoutPlan error', e);
    }
  }

  return updated;
}

export async function deleteWorkoutPlan(id: string): Promise<WorkoutPlan[]> {
  const current = await getWorkoutPlans();
  const updated = current.filter(p => p.id !== id);

  setLocal('workout_plans', updated);
  deleteFromTurso('workouts', id);

  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('workout_plans').delete().eq('id', id);
    } catch (e) {
      console.error('Supabase deleteWorkoutPlan error', e);
    }
  }
  return updated;
}

export async function getMemberWorkoutAssignment(memberId: string): Promise<WorkoutPlan | null> {
  const assignments = getLocal<WorkoutAssignment[]>('workout_assignments', [
    {
      id: 'assign-w-1',
      member_id: 'mem-101',
      plan_id: 'workout-1',
      assigned_date: '2025-01-20',
    }
  ]);
  const userAssign = assignments.find(a => a.member_id === memberId);
  const plans = await getWorkoutPlans();
  if (userAssign) {
    return plans.find(p => p.id === userAssign.plan_id) || plans[0] || null;
  }
  return plans[0] || null;
}

export async function assignWorkoutPlanToMember(memberId: string, planId: string, notes?: string): Promise<void> {
  const assignments = getLocal<WorkoutAssignment[]>('workout_assignments', []);
  const filtered = assignments.filter(a => a.member_id !== memberId);
  filtered.push({
    id: 'assign-w-' + Date.now(),
    member_id: memberId,
    plan_id: planId,
    assigned_date: new Date().toISOString().split('T')[0],
    notes,
  });
  setLocal('workout_assignments', filtered);

  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('workout_assignments').upsert({
        member_id: memberId,
        plan_id: planId,
        assigned_date: new Date().toISOString().split('T')[0],
        notes,
      });
    } catch (e) {
      console.error('Supabase assignWorkoutPlan error', e);
    }
  }
}

// -----------------------------------------------------------------------------
// DIET PLANS & ASSIGNMENTS
// -----------------------------------------------------------------------------
export async function getDietPlans(): Promise<DietPlan[]> {
  // 1. Try Turso
  const tursoData = await fetchFromTurso<DietPlan[]>('diets');
  if (tursoData && tursoData.length > 0) {
    setLocal('diet_plans', tursoData);
    return tursoData;
  }

  // 2. Try Supabase
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('diet_plans')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        setLocal('diet_plans', data as DietPlan[]);
        return data as DietPlan[];
      }
    } catch (e) {
      console.warn('Supabase getDietPlans fallback', e);
    }
  }

  return getLocal<DietPlan[]>('diet_plans', initialDietPlans);
}

export async function saveDietPlan(plan: DietPlan): Promise<DietPlan[]> {
  const current = await getDietPlans();
  const index = current.findIndex(p => p.id === plan.id);
  let updated: DietPlan[];
  if (index >= 0) {
    updated = [...current];
    updated[index] = plan;
  } else {
    updated = [plan, ...current];
  }

  setLocal('diet_plans', updated);
  saveToTurso('diets', plan);

  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('diet_plans').upsert(plan);
    } catch (e) {
      console.error('Supabase saveDietPlan error', e);
    }
  }
  return updated;
}

export async function deleteDietPlan(id: string): Promise<DietPlan[]> {
  const current = await getDietPlans();
  const updated = current.filter(d => d.id !== id);

  setLocal('diet_plans', updated);
  deleteFromTurso('diets', id);

  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('diet_plans').delete().eq('id', id);
    } catch (e) {
      console.error('Supabase deleteDietPlan error', e);
    }
  }
  return updated;
}

export async function getMemberDietAssignment(memberId: string): Promise<DietPlan | null> {
  const assignments = getLocal<DietAssignment[]>('diet_assignments', [
    {
      id: 'assign-d-1',
      member_id: 'mem-101',
      plan_id: 'diet-1',
      assigned_date: '2025-01-20',
      special_notes: 'Hydrate well, target 3.5L water daily.',
    }
  ]);
  const userAssign = assignments.find(a => a.member_id === memberId);
  const plans = await getDietPlans();
  if (userAssign) {
    return plans.find(p => p.id === userAssign.plan_id) || plans[0] || null;
  }
  return plans[0] || null;
}

export async function assignDietPlanToMember(memberId: string, planId: string, notes?: string): Promise<void> {
  const assignments = getLocal<DietAssignment[]>('diet_assignments', []);
  const filtered = assignments.filter(a => a.member_id !== memberId);
  filtered.push({
    id: 'assign-d-' + Date.now(),
    member_id: memberId,
    plan_id: planId,
    assigned_date: new Date().toISOString().split('T')[0],
    special_notes: notes,
  });
  setLocal('diet_assignments', filtered);

  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('diet_assignments').upsert({
        member_id: memberId,
        plan_id: planId,
        assigned_date: new Date().toISOString().split('T')[0],
        special_notes: notes,
      });
    } catch (e) {
      console.error('Supabase assignDietPlan error', e);
    }
  }
}

// -----------------------------------------------------------------------------
// ENQUIRIES
// -----------------------------------------------------------------------------
export async function getEnquiries(): Promise<Enquiry[]> {
  const tursoData = await fetchFromTurso<Enquiry[]>('enquiries');
  if (tursoData && tursoData.length > 0) {
    setLocal('enquiries', tursoData);
    return tursoData;
  }

  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('enquiries')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) {
        setLocal('enquiries', data as Enquiry[]);
        return data as Enquiry[];
      }
    } catch (e) {
      console.warn('Supabase getEnquiries fallback', e);
    }
  }
  return getLocal<Enquiry[]>('enquiries', initialEnquiries);
}

export async function submitEnquiry(enquiry: Omit<Enquiry, 'id' | 'status' | 'created_at'>): Promise<Enquiry> {
  const newEnq: Enquiry = {
    ...enquiry,
    id: 'enq-' + Date.now(),
    status: 'new',
    created_at: new Date().toISOString(),
  };

  const current = await getEnquiries();
  setLocal('enquiries', [newEnq, ...current]);
  saveToTurso('enquiries', newEnq);

  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('enquiries').insert(newEnq);
    } catch (e) {
      console.error('Supabase submitEnquiry error', e);
    }
  }

  return newEnq;
}

export async function updateEnquiryStatus(id: string, status: Enquiry['status'], notes?: string): Promise<Enquiry[]> {
  const current = await getEnquiries();
  const updated = current.map(e => e.id === id ? { ...e, status, admin_notes: notes ?? e.admin_notes } : e);
  const modified = updated.find(e => e.id === id);

  setLocal('enquiries', updated);
  if (modified) {
    saveToTurso('enquiries', modified);
  }

  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('enquiries').update({ status, admin_notes: notes }).eq('id', id);
    } catch (e) {
      console.error('Supabase updateEnquiryStatus error', e);
    }
  }
  return updated;
}

// -----------------------------------------------------------------------------
// GALLERY
// -----------------------------------------------------------------------------
export async function getGalleryItems(): Promise<GalleryItem[]> {
  const tursoData = await fetchFromTurso<GalleryItem[]>('gallery');
  if (tursoData && tursoData.length > 0) {
    setLocal('gallery', tursoData);
    return tursoData;
  }

  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('gallery_items')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        setLocal('gallery', data as GalleryItem[]);
        return data as GalleryItem[];
      }
    } catch (e) {
      console.warn('Supabase getGalleryItems fallback', e);
    }
  }
  return getLocal<GalleryItem[]>('gallery', initialGallery);
}

export async function saveGalleryItem(item: GalleryItem): Promise<GalleryItem[]> {
  const current = await getGalleryItems();
  const index = current.findIndex(g => g.id === item.id);
  let updated: GalleryItem[];
  if (index >= 0) {
    updated = [...current];
    updated[index] = item;
  } else {
    updated = [...current, item];
  }

  setLocal('gallery', updated);
  saveToTurso('gallery', item);

  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('gallery_items').upsert(item);
    } catch (e) {
      console.error('Supabase saveGalleryItem error', e);
    }
  }
  return updated;
}

export async function deleteGalleryItem(id: string): Promise<GalleryItem[]> {
  const current = await getGalleryItems();
  const updated = current.filter(g => g.id !== id);

  setLocal('gallery', updated);
  deleteFromTurso('gallery', id);

  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('gallery_items').delete().eq('id', id);
    } catch (e) {
      console.error('Supabase deleteGalleryItem error', e);
    }
  }
  return updated;
}

// -----------------------------------------------------------------------------
// DASHBOARD METRICS SUMMARY
// -----------------------------------------------------------------------------
export interface DashboardMetrics {
  totalMembers: number;
  activeMemberships: number;
  todayAttendance: number;
  upcomingExpiries: number;
  newEnquiries: number;
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const members = await getMembers();
  const attendance = await getAttendance();
  const enquiries = await getEnquiries();

  const totalMembers = members.length;
  const activeMemberships = members.filter(m => m.status === 'active').length;

  const todayStr = new Date().toISOString().split('T')[0];
  const todayAttendance = attendance.filter(a => a.check_in_date === todayStr).length;

  const now = new Date();
  const fifteenDaysFromNow = new Date();
  fifteenDaysFromNow.setDate(now.getDate() + 15);

  const upcomingExpiries = members.filter(m => {
    if (!m.expiry_date) return false;
    const exp = new Date(m.expiry_date);
    return exp >= now && exp <= fifteenDaysFromNow;
  }).length;

  const newEnquiries = enquiries.filter(e => e.status === 'new').length;

  return {
    totalMembers,
    activeMemberships,
    todayAttendance,
    upcomingExpiries,
    newEnquiries,
  };
}
