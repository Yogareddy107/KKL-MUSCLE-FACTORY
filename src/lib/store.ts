import { 
  GymSettings, Member, MembershipPlan, Membership, Trainer, 
  AttendanceRecord, WorkoutPlan, DietPlan, Enquiry, GalleryItem, DietAssignment, WorkoutAssignment, SpecialOffer 
} from '@/types';
import { 
  initialGymSettings, initialPlans, initialTrainers, initialMembers, 
  initialAttendance, initialWorkoutPlans, 
  initialDietPlans, initialEnquiries, initialGallery, initialSpecialOffer 
} from './initialData';
import { supabase, isSupabaseConfigured } from './supabase';

// -----------------------------------------------------------------------------
// PURE SUPABASE CLOUD BACKEND (Zero LocalStorage, 100% Realtime Supabase Database)
// Dual-Layer Engine: Direct Supabase Client + Same-Origin /api/sync Fallback
// -----------------------------------------------------------------------------
export interface CloudSyncResult {
  success: boolean;
  error?: string;
}

/**
 * Universal Cloud Upsert:
 * 1. Attempts direct Supabase write
 * 2. If blocked by adblockers, client tokens, or network, falls back to server-side /api/sync
 */
async function cloudUpsert(table: string, payload: any): Promise<CloudSyncResult> {
  // Layer 1: Direct Supabase Client
  if (isSupabaseConfigured() && supabase) {
    try {
      const { error } = await supabase.from(table).upsert(payload);
      if (!error) {
        return { success: true };
      }
      console.warn(`[Supabase client] direct upsert on ${table} error (${error.message}). Trying server /api/sync fallback...`);
    } catch (e: any) {
      console.warn(`[Supabase client] direct upsert exception on ${table}:`, e);
    }
  }

  // Layer 2: Server-side Next.js route /api/sync (pristine Node.js environment, no CORS, no stale browser tokens)
  if (typeof window !== 'undefined') {
    try {
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table, action: 'upsert', payload }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        return { success: true };
      }
      return { success: false, error: data.error || 'Cloud sync failed' };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Network sync failed' };
    }
  }

  return { success: false, error: 'Database connection failed' };
}

/**
 * Universal Cloud Delete
 */
async function cloudDelete(table: string, id: string): Promise<CloudSyncResult> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (!error) {
        return { success: true };
      }
      console.warn(`[Supabase client] direct delete on ${table} error (${error.message}). Trying server fallback...`);
    } catch (e: any) {
      console.warn(`[Supabase client] direct delete exception on ${table}:`, e);
    }
  }

  if (typeof window !== 'undefined') {
    try {
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table, action: 'delete', id }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        return { success: true };
      }
      return { success: false, error: data.error || 'Cloud delete failed' };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Network delete failed' };
    }
  }

  return { success: false, error: 'Database connection failed' };
}

/**
 * Universal Cloud Select
 */
async function cloudSelect<T>(table: string, orderCol?: string, ascending: boolean = false): Promise<T[] | null> {
  if (isSupabaseConfigured() && supabase) {
    try {
      let q = supabase.from(table).select('*');
      if (orderCol) {
        q = q.order(orderCol, { ascending });
      }
      const { data, error } = await q;
      if (!error && data && data.length > 0) {
        return data as T[];
      }
    } catch (e) {
      console.warn(`[Supabase client] select on ${table} error:`, e);
    }
  }

  if (typeof window !== 'undefined') {
    try {
      const res = await fetch(`/api/sync?table=${table}`);
      const json = await res.json();
      if (res.ok && json.success && Array.isArray(json.data) && json.data.length > 0) {
        return json.data as T[];
      }
    } catch {
      // Fallback
    }
  }

  return null;
}

// -----------------------------------------------------------------------------
// GYM SETTINGS
// -----------------------------------------------------------------------------
export async function getGymSettings(): Promise<GymSettings> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('gym_settings')
        .select('*')
        .eq('id', 'default')
        .single();
      if (!error && data) {
        return data as GymSettings;
      }
    } catch (e) {
      console.warn('[Supabase] getGymSettings error:', e);
    }
  }

  if (typeof window !== 'undefined') {
    try {
      const res = await fetch('/api/sync?table=gym_settings&id=default');
      const json = await res.json();
      if (res.ok && json.success && json.data) {
        return json.data as GymSettings;
      }
    } catch {
      // Fallback
    }
  }

  return initialGymSettings;
}

export async function updateGymSettings(settings: Partial<GymSettings>): Promise<GymSettings> {
  const current = await getGymSettings();
  const updated: GymSettings = { ...current, ...settings, updated_at: new Date().toISOString() };

  const syncRes = await cloudUpsert('gym_settings', updated);
  Object.assign(updated, { cloudSynced: syncRes.success, error: syncRes.error });
  return updated;
}

// -----------------------------------------------------------------------------
// MEMBERSHIP PLANS
// -----------------------------------------------------------------------------
export async function getMembershipPlans(): Promise<MembershipPlan[]> {
  const data = await cloudSelect<MembershipPlan>('membership_plans', 'display_order', true);
  if (data && data.length > 0) {
    return data;
  }
  return initialPlans;
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

  const syncRes = await cloudUpsert('membership_plans', plan);
  Object.assign(updated, { cloudSynced: syncRes.success, error: syncRes.error });
  return updated;
}

export async function deleteMembershipPlan(id: string): Promise<MembershipPlan[]> {
  const current = await getMembershipPlans();
  const updated = current.filter(p => p.id !== id);

  const syncRes = await cloudDelete('membership_plans', id);
  Object.assign(updated, { cloudSynced: syncRes.success, error: syncRes.error });
  return updated;
}

// -----------------------------------------------------------------------------
// MEMBERS
// -----------------------------------------------------------------------------
export async function getMembers(): Promise<Member[]> {
  const data = await cloudSelect<Member>('members', 'created_at', false);
  if (data && data.length > 0) {
    return data;
  }
  return initialMembers;
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

  const memberPayload = {
    ...member,
    updated_at: new Date().toISOString(),
  };

  const syncRes = await cloudUpsert('members', memberPayload);
  Object.assign(updated, { cloudSynced: syncRes.success, error: syncRes.error });
  return updated;
}

export async function toggleMemberStatus(id: string): Promise<Member[]> {
  const current = await getMembers();
  const target = current.find(m => m.id === id);
  if (!target) return current;

  const nextStatus = target.status === 'active' ? 'inactive' : 'active';
  const updatedMember = { ...target, status: nextStatus as Member['status'], updated_at: new Date().toISOString() };
  return saveMember(updatedMember);
}

export async function deleteMember(id: string): Promise<Member[]> {
  const current = await getMembers();
  const updated = current.filter(m => m.id !== id);

  const syncRes = await cloudDelete('members', id);
  Object.assign(updated, { cloudSynced: syncRes.success, error: syncRes.error });
  return updated;
}

// -----------------------------------------------------------------------------
// TRAINERS
// -----------------------------------------------------------------------------
export async function getTrainers(): Promise<Trainer[]> {
  const data = await cloudSelect<Trainer>('trainers', 'display_order', true);
  if (data && data.length > 0) {
    return data;
  }
  return initialTrainers;
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

  const trainerPayload = {
    ...trainer,
    updated_at: new Date().toISOString(),
  };

  const syncRes = await cloudUpsert('trainers', trainerPayload);
  Object.assign(updated, { cloudSynced: syncRes.success, error: syncRes.error });
  return updated;
}

export async function deleteTrainer(id: string): Promise<Trainer[]> {
  const current = await getTrainers();
  const updated = current.filter(t => t.id !== id);

  const syncRes = await cloudDelete('trainers', id);
  Object.assign(updated, { cloudSynced: syncRes.success, error: syncRes.error });
  return updated;
}

// -----------------------------------------------------------------------------
// ATTENDANCE
// -----------------------------------------------------------------------------
export async function getAttendance(): Promise<AttendanceRecord[]> {
  const data = await cloudSelect<AttendanceRecord>('attendance', 'check_in_time', false);
  if (data) {
    return data;
  }
  return initialAttendance;
}

export async function recordAttendance(
  memberId: string, 
  sessionType: 'Morning' | 'Evening' | 'General' = 'General',
  allowDuplicate: boolean = false
): Promise<{ success: boolean; message: string; record?: AttendanceRecord }> {
  const members = await getMembers();
  const member = members.find(m => m.id === memberId);

  if (!member) {
    return { success: false, message: 'Member not found.' };
  }

  if (member.status !== 'active') {
    return { success: false, message: `Member is currently marked as ${member.status}. Please renew membership.` };
  }

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

  const record: AttendanceRecord = {
    id: `att-${Date.now()}`,
    member_id: memberId,
    check_in_date: todayStr,
    check_in_time: timeStr,
    session_type: sessionType,
    notes: `${member.full_name} (${member.member_code})`,
  };


  const syncRes = await cloudUpsert('attendance', record);
  if (syncRes.success) {
    return { 
      success: true, 
      message: `Check-in recorded for ${member.full_name} (${member.member_code})`, 
      record 
    };
  }
  return { success: false, message: syncRes.error || 'Attendance check-in sync failed' };
}

export const markAttendance = recordAttendance;



// -----------------------------------------------------------------------------
// WORKOUT PLANS & ASSIGNMENTS
// -----------------------------------------------------------------------------
export async function getWorkoutPlans(): Promise<WorkoutPlan[]> {
  const data = await cloudSelect<WorkoutPlan>('workout_plans', 'created_at', false);
  if (data && data.length > 0) {
    return data;
  }
  return initialWorkoutPlans;
}

export async function saveWorkoutPlan(plan: WorkoutPlan): Promise<WorkoutPlan[]> {
  const current = await getWorkoutPlans();
  const index = current.findIndex(w => w.id === plan.id);
  let updated: WorkoutPlan[];
  if (index >= 0) {
    updated = [...current];
    updated[index] = plan;
  } else {
    updated = [plan, ...current];
  }

  const syncRes = await cloudUpsert('workout_plans', plan);
  Object.assign(updated, { cloudSynced: syncRes.success, error: syncRes.error });
  return updated;
}

export async function deleteWorkoutPlan(id: string): Promise<WorkoutPlan[]> {
  const current = await getWorkoutPlans();
  const updated = current.filter(w => w.id !== id);

  const syncRes = await cloudDelete('workout_plans', id);
  Object.assign(updated, { cloudSynced: syncRes.success, error: syncRes.error });
  return updated;
}

export async function getMemberWorkoutAssignment(memberId: string): Promise<WorkoutPlan | null> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data } = await supabase
        .from('workout_assignments')
        .select('*')
        .eq('member_id', memberId)
        .single();
      if (data) {
        const plans = await getWorkoutPlans();
        return plans.find(p => p.id === data.plan_id) || plans[0] || null;
      }
    } catch (e) {
      console.warn('[Supabase] getMemberWorkoutAssignment error:', e);
    }
  }
  const plans = await getWorkoutPlans();
  return plans[0] || null;
}

export async function assignWorkoutPlanToMember(memberId: string, planId: string, notes?: string): Promise<void> {
  await cloudUpsert('workout_assignments', {
    id: 'assign-w-' + memberId,
    member_id: memberId,
    plan_id: planId,
    assigned_date: new Date().toISOString().split('T')[0],
    notes,
  });
}

// -----------------------------------------------------------------------------
// DIET PLANS & ASSIGNMENTS
// -----------------------------------------------------------------------------
export async function getDietPlans(): Promise<DietPlan[]> {
  const data = await cloudSelect<DietPlan>('diet_plans', 'created_at', false);
  if (data && data.length > 0) {
    return data;
  }
  return initialDietPlans;
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

  const syncRes = await cloudUpsert('diet_plans', plan);
  Object.assign(updated, { cloudSynced: syncRes.success, error: syncRes.error });
  return updated;
}

export async function deleteDietPlan(id: string): Promise<DietPlan[]> {
  const current = await getDietPlans();
  const updated = current.filter(d => d.id !== id);

  const syncRes = await cloudDelete('diet_plans', id);
  Object.assign(updated, { cloudSynced: syncRes.success, error: syncRes.error });
  return updated;
}

export async function getMemberDietAssignment(memberId: string): Promise<DietPlan | null> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data } = await supabase
        .from('diet_assignments')
        .select('*')
        .eq('member_id', memberId)
        .single();
      if (data) {
        const plans = await getDietPlans();
        return plans.find(p => p.id === data.plan_id) || plans[0] || null;
      }
    } catch (e) {
      console.warn('[Supabase] getMemberDietAssignment error:', e);
    }
  }
  const plans = await getDietPlans();
  return plans[0] || null;
}

export async function assignDietPlanToMember(memberId: string, planId: string, notes?: string): Promise<void> {
  await cloudUpsert('diet_assignments', {
    id: 'assign-d-' + memberId,
    member_id: memberId,
    plan_id: planId,
    assigned_date: new Date().toISOString().split('T')[0],
    special_notes: notes,
  });
}

// -----------------------------------------------------------------------------
// ENQUIRIES
// -----------------------------------------------------------------------------
export async function getEnquiries(): Promise<Enquiry[]> {
  const data = await cloudSelect<Enquiry>('enquiries', 'created_at', false);
  if (data) {
    return data;
  }
  return initialEnquiries;
}

export async function submitEnquiry(enquiry: Omit<Enquiry, 'id' | 'status' | 'created_at'>): Promise<Enquiry> {
  const newEnq: Enquiry = {
    ...enquiry,
    id: 'enq-' + Date.now(),
    status: 'new',
    created_at: new Date().toISOString(),
  };

  await cloudUpsert('enquiries', newEnq);
  return newEnq;
}

export async function updateEnquiryStatus(id: string, status: Enquiry['status'], notes?: string): Promise<Enquiry[]> {
  const current = await getEnquiries();
  const updated = current.map(e => e.id === id ? { ...e, status, admin_notes: notes ?? e.admin_notes } : e);

  await cloudUpsert('enquiries', { id, status, admin_notes: notes });
  return updated;
}

// -----------------------------------------------------------------------------
// GALLERY
// -----------------------------------------------------------------------------
export async function getGalleryItems(): Promise<GalleryItem[]> {
  const data = await cloudSelect<GalleryItem>('gallery_items', 'created_at', false);
  if (data && data.length > 0) {
    return data;
  }
  return initialGallery;
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

  const syncRes = await cloudUpsert('gallery_items', item);
  Object.assign(updated, { cloudSynced: syncRes.success, error: syncRes.error });
  return updated;
}

export async function deleteGalleryItem(id: string): Promise<GalleryItem[]> {
  const current = await getGalleryItems();
  const updated = current.filter(g => g.id !== id);

  const syncRes = await cloudDelete('gallery_items', id);
  Object.assign(updated, { cloudSynced: syncRes.success, error: syncRes.error });
  return updated;
}

// -----------------------------------------------------------------------------
// SPECIAL OFFER & PROMO POPUP
// -----------------------------------------------------------------------------
export async function getSpecialOffer(): Promise<SpecialOffer> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('special_offers')
        .select('*')
        .eq('id', 'active-offer')
        .single();
      if (!error && data) {
        return data as SpecialOffer;
      }
    } catch (e) {
      console.warn('[Supabase] getSpecialOffer error:', e);
    }
  }

  if (typeof window !== 'undefined') {
    try {
      const res = await fetch('/api/sync?table=special_offers&id=active-offer');
      const json = await res.json();
      if (res.ok && json.success && json.data) {
        return json.data as SpecialOffer;
      }
    } catch {
      // Fallback
    }
  }

  return initialSpecialOffer;
}

export async function saveSpecialOffer(offer: SpecialOffer): Promise<SpecialOffer> {
  const updated: SpecialOffer = {
    ...offer,
    updated_at: new Date().toISOString(),
  };

  const syncRes = await cloudUpsert('special_offers', updated);
  Object.assign(updated, { cloudSynced: syncRes.success, error: syncRes.error });
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
