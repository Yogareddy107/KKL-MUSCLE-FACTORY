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
// PURE SUPABASE CLOUD BACKEND (Zero LocalStorage, 100% Cloud Realtime Database)
// -----------------------------------------------------------------------------
export interface CloudSyncResult {
  success: boolean;
  error?: string;
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
  return initialGymSettings;
}

export async function updateGymSettings(settings: Partial<GymSettings>): Promise<GymSettings> {
  const current = await getGymSettings();
  const updated: GymSettings = { ...current, ...settings, updated_at: new Date().toISOString() };

  let cloudSuccess = false;
  let cloudError = '';

  if (isSupabaseConfigured() && supabase) {
    try {
      const { error } = await supabase.from('gym_settings').upsert(updated);
      if (!error) {
        cloudSuccess = true;
      } else {
        cloudError = error.message;
        console.error('[Supabase] updateGymSettings error:', error);
      }
    } catch (e: any) {
      cloudError = e?.message || 'Network error';
      console.error('[Supabase] updateGymSettings exception:', e);
    }
  } else {
    cloudError = 'Supabase client not configured';
  }

  Object.assign(updated, { cloudSynced: cloudSuccess, error: cloudError });
  return updated;
}

// -----------------------------------------------------------------------------
// MEMBERSHIP PLANS
// -----------------------------------------------------------------------------
export async function getMembershipPlans(): Promise<MembershipPlan[]> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('membership_plans')
        .select('*')
        .order('display_order', { ascending: true });
      if (!error && data && data.length > 0) {
        return data as MembershipPlan[];
      }
    } catch (e) {
      console.warn('[Supabase] getMembershipPlans error:', e);
    }
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

  let cloudSuccess = false;
  let cloudError = '';

  if (isSupabaseConfigured() && supabase) {
    try {
      const { error } = await supabase.from('membership_plans').upsert(plan);
      if (!error) {
        cloudSuccess = true;
      } else {
        cloudError = error.message;
        console.error('[Supabase] saveMembershipPlan error:', error);
      }
    } catch (e: any) {
      cloudError = e?.message || 'Network error';
    }
  }

  Object.assign(updated, { cloudSynced: cloudSuccess, error: cloudError });
  return updated;
}

export async function deleteMembershipPlan(id: string): Promise<MembershipPlan[]> {
  const current = await getMembershipPlans();
  const updated = current.filter(p => p.id !== id);

  let cloudSuccess = false;
  let cloudError = '';

  if (isSupabaseConfigured() && supabase) {
    try {
      const { error } = await supabase.from('membership_plans').delete().eq('id', id);
      if (!error) {
        cloudSuccess = true;
      } else {
        cloudError = error.message;
      }
    } catch (e: any) {
      cloudError = e?.message || 'Network error';
    }
  }

  Object.assign(updated, { cloudSynced: cloudSuccess, error: cloudError });
  return updated;
}

// -----------------------------------------------------------------------------
// MEMBERS
// -----------------------------------------------------------------------------
export async function getMembers(): Promise<Member[]> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        return data as Member[];
      }
    } catch (e) {
      console.warn('[Supabase] getMembers error:', e);
    }
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

  let cloudSuccess = false;
  let cloudError = '';

  if (isSupabaseConfigured() && supabase) {
    try {
      const { error } = await supabase.from('members').upsert({
        ...member,
        updated_at: new Date().toISOString(),
      });
      if (!error) {
        cloudSuccess = true;
      } else {
        cloudError = error.message;
        console.error('[Supabase] saveMember error:', error);
      }
    } catch (e: any) {
      cloudError = e?.message || 'Network error';
    }
  } else {
    cloudError = 'Supabase not configured';
  }

  Object.assign(updated, { cloudSynced: cloudSuccess, error: cloudError });
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

  let cloudSuccess = false;
  let cloudError = '';

  if (modified && isSupabaseConfigured() && supabase) {
    try {
      const { error } = await supabase.from('members').update({ status: modified.status }).eq('id', id);
      if (!error) {
        cloudSuccess = true;
      } else {
        cloudError = error.message;
      }
    } catch (e: any) {
      cloudError = e?.message || 'Network error';
    }
  }

  Object.assign(updated, { cloudSynced: cloudSuccess, error: cloudError });
  return updated;
}

export async function deleteMember(id: string): Promise<Member[]> {
  const current = await getMembers();
  const updated = current.filter(m => m.id !== id);

  let cloudSuccess = false;
  let cloudError = '';

  if (isSupabaseConfigured() && supabase) {
    try {
      const { error } = await supabase.from('members').delete().eq('id', id);
      if (!error) {
        cloudSuccess = true;
      } else {
        cloudError = error.message;
      }
    } catch (e: any) {
      cloudError = e?.message || 'Network error';
    }
  }

  Object.assign(updated, { cloudSynced: cloudSuccess, error: cloudError });
  return updated;
}

// -----------------------------------------------------------------------------
// TRAINERS
// -----------------------------------------------------------------------------
export async function getTrainers(): Promise<Trainer[]> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('trainers')
        .select('*')
        .order('display_order', { ascending: true });
      if (!error && data && data.length > 0) {
        return data as Trainer[];
      }
    } catch (e) {
      console.warn('[Supabase] getTrainers error:', e);
    }
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

  let cloudSuccess = false;
  let cloudError = '';

  if (isSupabaseConfigured() && supabase) {
    try {
      const { error } = await supabase.from('trainers').upsert({
        ...trainer,
        updated_at: new Date().toISOString()
      });
      if (!error) {
        cloudSuccess = true;
      } else {
        cloudError = error.message;
        console.error('[Supabase] saveTrainer error:', error);
      }
    } catch (e: any) {
      cloudError = e?.message || 'Network error';
    }
  }

  Object.assign(updated, { cloudSynced: cloudSuccess, error: cloudError });
  return updated;
}

export async function deleteTrainer(id: string): Promise<Trainer[]> {
  const current = await getTrainers();
  const updated = current.filter(t => t.id !== id);

  let cloudSuccess = false;
  let cloudError = '';

  if (isSupabaseConfigured() && supabase) {
    try {
      const { error } = await supabase.from('trainers').delete().eq('id', id);
      if (!error) {
        cloudSuccess = true;
      } else {
        cloudError = error.message;
      }
    } catch (e: any) {
      cloudError = e?.message || 'Network error';
    }
  }

  Object.assign(updated, { cloudSynced: cloudSuccess, error: cloudError });
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
      if (!error && data && data.length > 0) {
        return data as AttendanceRecord[];
      }
    } catch (e) {
      console.warn('[Supabase] getAttendance error:', e);
    }
  }
  return initialAttendance;
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
    return { success: false, message: 'Member not found in database.' };
  }

  if (member.status !== 'active') {
    return { success: false, message: `Member is currently ${member.status}. Please renew membership.` };
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
        id: newRecord.id,
        member_id: memberId,
        check_in_date: today,
        check_in_time: checkInTime,
        session_type: sessionType,
      });
    } catch (e) {
      console.error('[Supabase] recordAttendance error:', e);
    }
  }

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
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('workout_plans')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        return data as WorkoutPlan[];
      }
    } catch (e) {
      console.warn('[Supabase] getWorkoutPlans error:', e);
    }
  }
  return initialWorkoutPlans;
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

  let cloudSuccess = false;
  let cloudError = '';

  if (isSupabaseConfigured() && supabase) {
    try {
      const { error } = await supabase.from('workout_plans').upsert(plan);
      if (!error) {
        cloudSuccess = true;
      } else {
        cloudError = error.message;
      }
    } catch (e: any) {
      cloudError = e?.message || 'Network error';
    }
  }

  Object.assign(updated, { cloudSynced: cloudSuccess, error: cloudError });
  return updated;
}

export async function deleteWorkoutPlan(id: string): Promise<WorkoutPlan[]> {
  const current = await getWorkoutPlans();
  const updated = current.filter(p => p.id !== id);

  let cloudSuccess = false;
  let cloudError = '';

  if (isSupabaseConfigured() && supabase) {
    try {
      const { error } = await supabase.from('workout_plans').delete().eq('id', id);
      if (!error) {
        cloudSuccess = true;
      } else {
        cloudError = error.message;
      }
    } catch (e: any) {
      cloudError = e?.message || 'Network error';
    }
  }

  Object.assign(updated, { cloudSynced: cloudSuccess, error: cloudError });
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
  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('workout_assignments').upsert({
        id: 'assign-w-' + memberId,
        member_id: memberId,
        plan_id: planId,
        assigned_date: new Date().toISOString().split('T')[0],
        notes,
      });
    } catch (e) {
      console.error('[Supabase] assignWorkoutPlan error:', e);
    }
  }
}

// -----------------------------------------------------------------------------
// DIET PLANS & ASSIGNMENTS
// -----------------------------------------------------------------------------
export async function getDietPlans(): Promise<DietPlan[]> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('diet_plans')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        return data as DietPlan[];
      }
    } catch (e) {
      console.warn('[Supabase] getDietPlans error:', e);
    }
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

  let cloudSuccess = false;
  let cloudError = '';

  if (isSupabaseConfigured() && supabase) {
    try {
      const { error } = await supabase.from('diet_plans').upsert(plan);
      if (!error) {
        cloudSuccess = true;
      } else {
        cloudError = error.message;
      }
    } catch (e: any) {
      cloudError = e?.message || 'Network error';
    }
  }

  Object.assign(updated, { cloudSynced: cloudSuccess, error: cloudError });
  return updated;
}

export async function deleteDietPlan(id: string): Promise<DietPlan[]> {
  const current = await getDietPlans();
  const updated = current.filter(d => d.id !== id);

  let cloudSuccess = false;
  let cloudError = '';

  if (isSupabaseConfigured() && supabase) {
    try {
      const { error } = await supabase.from('diet_plans').delete().eq('id', id);
      if (!error) {
        cloudSuccess = true;
      } else {
        cloudError = error.message;
      }
    } catch (e: any) {
      cloudError = e?.message || 'Network error';
    }
  }

  Object.assign(updated, { cloudSynced: cloudSuccess, error: cloudError });
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
  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('diet_assignments').upsert({
        id: 'assign-d-' + memberId,
        member_id: memberId,
        plan_id: planId,
        assigned_date: new Date().toISOString().split('T')[0],
        special_notes: notes,
      });
    } catch (e) {
      console.error('[Supabase] assignDietPlan error:', e);
    }
  }
}

// -----------------------------------------------------------------------------
// ENQUIRIES
// -----------------------------------------------------------------------------
export async function getEnquiries(): Promise<Enquiry[]> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('enquiries')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) {
        return data as Enquiry[];
      }
    } catch (e) {
      console.warn('[Supabase] getEnquiries error:', e);
    }
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

  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('enquiries').insert(newEnq);
    } catch (e) {
      console.error('[Supabase] submitEnquiry error:', e);
    }
  }

  return newEnq;
}

export async function updateEnquiryStatus(id: string, status: Enquiry['status'], notes?: string): Promise<Enquiry[]> {
  const current = await getEnquiries();
  const updated = current.map(e => e.id === id ? { ...e, status, admin_notes: notes ?? e.admin_notes } : e);

  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('enquiries').update({ status, admin_notes: notes }).eq('id', id);
    } catch (e) {
      console.error('[Supabase] updateEnquiryStatus error:', e);
    }
  }
  return updated;
}

// -----------------------------------------------------------------------------
// GALLERY
// -----------------------------------------------------------------------------
export async function getGalleryItems(): Promise<GalleryItem[]> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('gallery_items')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        return data as GalleryItem[];
      }
    } catch (e) {
      console.warn('[Supabase] getGalleryItems error:', e);
    }
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

  let cloudSuccess = false;
  let cloudError = '';

  if (isSupabaseConfigured() && supabase) {
    try {
      const { error } = await supabase.from('gallery_items').upsert(item);
      if (!error) {
        cloudSuccess = true;
      } else {
        cloudError = error.message;
      }
    } catch (e: any) {
      cloudError = e?.message || 'Network error';
    }
  }

  Object.assign(updated, { cloudSynced: cloudSuccess, error: cloudError });
  return updated;
}

export async function deleteGalleryItem(id: string): Promise<GalleryItem[]> {
  const current = await getGalleryItems();
  const updated = current.filter(g => g.id !== id);

  let cloudSuccess = false;
  let cloudError = '';

  if (isSupabaseConfigured() && supabase) {
    try {
      const { error } = await supabase.from('gallery_items').delete().eq('id', id);
      if (!error) {
        cloudSuccess = true;
      } else {
        cloudError = error.message;
      }
    } catch (e: any) {
      cloudError = e?.message || 'Network error';
    }
  }

  Object.assign(updated, { cloudSynced: cloudSuccess, error: cloudError });
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
  return initialSpecialOffer;
}

export async function saveSpecialOffer(offer: SpecialOffer): Promise<SpecialOffer> {
  const updated: SpecialOffer = {
    ...offer,
    updated_at: new Date().toISOString(),
  };

  let cloudSuccess = false;
  let cloudError = '';

  if (isSupabaseConfigured() && supabase) {
    try {
      const { error } = await supabase.from('special_offers').upsert(updated);
      if (!error) {
        cloudSuccess = true;
      } else {
        cloudError = error.message;
      }
    } catch (e: any) {
      cloudError = e?.message || 'Network error';
    }
  }

  Object.assign(updated, { cloudSynced: cloudSuccess, error: cloudError });
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
