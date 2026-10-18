import { createClient } from '@libsql/client';
import { 
  GymSettings, MembershipPlan, Trainer, Member, 
  WorkoutPlan, DietPlan, GalleryItem, Enquiry, SpecialOffer 
} from '@/types';

const defaultTursoUrl = 'libsql://kkl-muscle-factory-yogareddy107.aws-ap-south-1.turso.io';
const defaultTursoAuthToken = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3OTIzMjk4MTgsImlkIjoiMDFhMTRmMjAtMGIwMS03NjliLWFjMjItNzMwNzMyZWI0NDZhIiwia2lkIjoia2Qwa191STYtSGtpNVA0anhhQ3FqdlRHdi1jZE9GYVltcjlHOFAtWkk4RSIsInJpZCI6IjM4MTM0NDUzLTAwY2QtNDE1Ny1hYjk4LTU1YmY3MTI4MDVlMiJ9.i-pN6FL8Dx2LOsm6ZnaaxDjRnl7gVSlbjHx2iIRAXikXbRS5Q56f-3C-Gjiwf0HoHgNxtI2ba_XKb1N9QjFgAA';

const tursoUrl = process.env.TURSO_DATABASE_URL || defaultTursoUrl;
const tursoAuthToken = process.env.TURSO_AUTH_TOKEN || defaultTursoAuthToken;

export const isTursoConfigured = (): boolean => {
  return Boolean(
    tursoUrl && 
    tursoAuthToken && 
    !tursoUrl.includes('your-db')
  );
};

export const tursoClient = isTursoConfigured()
  ? createClient({
      url: tursoUrl,
      authToken: tursoAuthToken,
    })
  : null;


// ============================================================================
// GYM SETTINGS
// ============================================================================
export async function getTursoGymSettings(): Promise<GymSettings | null> {
  if (!tursoClient) return null;
  try {
    const res = await tursoClient.execute("SELECT * FROM gym_settings WHERE id = 'default' LIMIT 1");
    if (!res.rows || res.rows.length === 0) return null;
    const r = res.rows[0];
    return {
      id: String(r.id),
      gym_name: String(r.gym_name),
      tagline: String(r.tagline),
      headline: String(r.headline),
      phone: String(r.phone),
      whatsapp_number: String(r.whatsapp_number),
      email: r.email ? String(r.email) : '',
      address: String(r.address),
      map_url: String(r.map_url),
      instagram_url: String(r.instagram_url),
      opening_hours: String(r.opening_hours),
      logo_url: r.logo_url ? String(r.logo_url) : '/logo.png',
      member_portal_enabled: Boolean(r.member_portal_enabled),
    };
  } catch (err) {
    console.warn('[Turso] getTursoGymSettings error:', err);
    return null;
  }
}

export async function saveTursoGymSettings(settings: Partial<GymSettings>): Promise<boolean> {
  if (!tursoClient) return false;
  try {
    await tursoClient.execute({
      sql: `UPDATE gym_settings SET 
        gym_name = COALESCE(?, gym_name),
        tagline = COALESCE(?, tagline),
        headline = COALESCE(?, headline),
        phone = COALESCE(?, phone),
        whatsapp_number = COALESCE(?, whatsapp_number),
        email = COALESCE(?, email),
        address = COALESCE(?, address),
        map_url = COALESCE(?, map_url),
        instagram_url = COALESCE(?, instagram_url),
        opening_hours = COALESCE(?, opening_hours),
        logo_url = COALESCE(?, logo_url),
        updated_at = ?
      WHERE id = 'default'`,
      args: [
        settings.gym_name || null,
        settings.tagline || null,
        settings.headline || null,
        settings.phone || null,
        settings.whatsapp_number || null,
        settings.email || null,
        settings.address || null,
        settings.map_url || null,
        settings.instagram_url || null,
        settings.opening_hours || null,
        settings.logo_url || null,
        new Date().toISOString()
      ]
    });
    return true;
  } catch (err) {
    console.warn('[Turso] saveTursoGymSettings error:', err);
    return false;
  }
}

// ============================================================================
// MEMBERSHIP PLANS
// ============================================================================
export async function getTursoPlans(): Promise<MembershipPlan[] | null> {
  if (!tursoClient) return null;
  try {
    const res = await tursoClient.execute("SELECT * FROM membership_plans ORDER BY display_order ASC");
    if (!res.rows) return null;
    return res.rows.map(r => ({
      id: String(r.id),
      name: String(r.name),
      duration_months: Number(r.duration_months),
      price: Number(r.price),
      description: r.description ? String(r.description) : '',
      benefits: typeof r.benefits === 'string' ? JSON.parse(r.benefits) : [],
      is_popular: Boolean(r.is_popular),
      is_published: Boolean(r.is_published),
      display_order: Number(r.display_order),
    }));
  } catch (err) {
    console.warn('[Turso] getTursoPlans error:', err);
    return null;
  }
}

export async function saveTursoPlan(plan: MembershipPlan): Promise<boolean> {
  if (!tursoClient) return false;
  try {
    await tursoClient.execute({
      sql: `INSERT OR REPLACE INTO membership_plans (id, name, duration_months, price, description, benefits, is_popular, is_published, display_order)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        plan.id, plan.name, plan.duration_months, plan.price, 
        plan.description || '', JSON.stringify(plan.benefits || []), 
        plan.is_popular ? 1 : 0, plan.is_published ? 1 : 0, plan.display_order || 1
      ]
    });
    return true;
  } catch (err) {
    console.warn('[Turso] saveTursoPlan error:', err);
    return false;
  }
}

export async function deleteTursoPlan(id: string): Promise<boolean> {
  if (!tursoClient) return false;
  try {
    await tursoClient.execute({ sql: "DELETE FROM membership_plans WHERE id = ?", args: [id] });
    return true;
  } catch (err) {
    console.warn('[Turso] deleteTursoPlan error:', err);
    return false;
  }
}

// ============================================================================
// TRAINERS
// ============================================================================
export async function getTursoTrainers(): Promise<Trainer[] | null> {
  if (!tursoClient) return null;
  try {
    const res = await tursoClient.execute("SELECT * FROM trainers ORDER BY display_order ASC");
    if (!res.rows) return null;
    return res.rows.map(r => ({
      id: String(r.id),
      name: String(r.name),
      specialization: String(r.specialization),
      experience: String(r.experience),
      bio: r.bio ? String(r.bio) : '',
      photo_url: r.photo_url ? String(r.photo_url) : '',
      certifications: typeof r.certifications === 'string' ? JSON.parse(r.certifications) : [],
      is_active: Boolean(r.is_active),
      display_order: Number(r.display_order),
    }));
  } catch (err) {
    console.warn('[Turso] getTursoTrainers error:', err);
    return null;
  }
}

export async function saveTursoTrainer(trainer: Trainer): Promise<boolean> {
  if (!tursoClient) return false;
  try {
    await tursoClient.execute({
      sql: `INSERT OR REPLACE INTO trainers (id, name, specialization, experience, bio, photo_url, certifications, is_active, display_order)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        trainer.id, trainer.name, trainer.specialization, trainer.experience,
        trainer.bio || '', trainer.photo_url || '', JSON.stringify(trainer.certifications || []),
        trainer.is_active ? 1 : 0, trainer.display_order || 1
      ]
    });
    return true;
  } catch (err) {
    console.warn('[Turso] saveTursoTrainer error:', err);
    return false;
  }
}

export async function deleteTursoTrainer(id: string): Promise<boolean> {
  if (!tursoClient) return false;
  try {
    await tursoClient.execute({ sql: "DELETE FROM trainers WHERE id = ?", args: [id] });
    return true;
  } catch (err) {
    console.warn('[Turso] deleteTursoTrainer error:', err);
    return false;
  }
}

// ============================================================================
// MEMBERS
// ============================================================================
export async function getTursoMembers(): Promise<Member[] | null> {
  if (!tursoClient) return null;
  try {
    const res = await tursoClient.execute("SELECT * FROM members ORDER BY created_at DESC");
    if (!res.rows) return null;
    return res.rows.map(r => ({
      id: String(r.id),
      member_code: String(r.member_code),
      full_name: String(r.full_name),
      phone: String(r.phone),
      email: r.email ? String(r.email) : undefined,
      gender: (String(r.gender || 'Male') as 'Male' | 'Female' | 'Other'),
      date_of_birth: r.date_of_birth ? String(r.date_of_birth) : undefined,
      emergency_contact: r.emergency_contact ? String(r.emergency_contact) : undefined,
      medical_notes: r.medical_notes ? String(r.medical_notes) : undefined,
      status: (String(r.status || 'active') as 'active' | 'inactive' | 'expired' | 'pending'),
      join_date: String(r.join_date || new Date().toISOString().split('T')[0]),
      current_plan_name: r.current_plan_name ? String(r.current_plan_name) : undefined,
      expiry_date: r.expiry_date ? String(r.expiry_date) : undefined,
    }));
  } catch (err) {
    console.warn('[Turso] getTursoMembers error:', err);
    return null;
  }
}

export async function saveTursoMember(member: Member): Promise<boolean> {
  if (!tursoClient) return false;
  try {
    await tursoClient.execute({
      sql: `INSERT OR REPLACE INTO members (
        id, member_code, full_name, phone, email, gender, date_of_birth, 
        emergency_contact, medical_notes, status, join_date, current_plan_name, expiry_date, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        member.id, member.member_code, member.full_name, member.phone,
        member.email || null, member.gender || 'Male', member.date_of_birth || null,
        member.emergency_contact || null, member.medical_notes || null,
        member.status || 'active', member.join_date || new Date().toISOString().split('T')[0],
        member.current_plan_name || null, member.expiry_date || null,
        new Date().toISOString()
      ]
    });
    return true;
  } catch (err) {
    console.warn('[Turso] saveTursoMember error:', err);
    return false;
  }
}

export async function deleteTursoMember(id: string): Promise<boolean> {
  if (!tursoClient) return false;
  try {
    await tursoClient.execute({ sql: "DELETE FROM members WHERE id = ?", args: [id] });
    return true;
  } catch (err) {
    console.warn('[Turso] deleteTursoMember error:', err);
    return false;
  }
}

// ============================================================================
// WORKOUT PLANS
// ============================================================================
export async function getTursoWorkouts(): Promise<WorkoutPlan[] | null> {
  if (!tursoClient) return null;
  try {
    const res = await tursoClient.execute("SELECT * FROM workout_plans");
    if (!res.rows) return null;
    return res.rows.map(r => ({
      id: String(r.id),
      title: String(r.title),
      description: r.description ? String(r.description) : '',
      difficulty: String(r.difficulty) as 'Beginner' | 'Intermediate' | 'Advanced',
      days_per_week: Number(r.days_per_week),
      is_published: Boolean(r.is_published),
      exercises: typeof r.exercises === 'string' ? JSON.parse(r.exercises) : [],
    }));
  } catch (err) {
    console.warn('[Turso] getTursoWorkouts error:', err);
    return null;
  }
}

export async function saveTursoWorkout(workout: WorkoutPlan): Promise<boolean> {
  if (!tursoClient) return false;
  try {
    await tursoClient.execute({
      sql: `INSERT OR REPLACE INTO workout_plans (id, title, description, difficulty, days_per_week, is_published, exercises)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [
        workout.id, workout.title, workout.description || '', workout.difficulty,
        workout.days_per_week, workout.is_published ? 1 : 0, JSON.stringify(workout.exercises || [])
      ]
    });
    return true;
  } catch (err) {
    console.warn('[Turso] saveTursoWorkout error:', err);
    return false;
  }
}

export async function deleteTursoWorkout(id: string): Promise<boolean> {
  if (!tursoClient) return false;
  try {
    await tursoClient.execute({ sql: "DELETE FROM workout_plans WHERE id = ?", args: [id] });
    return true;
  } catch (err) {
    console.warn('[Turso] deleteTursoWorkout error:', err);
    return false;
  }
}

// ============================================================================
// DIET PLANS
// ============================================================================
export async function getTursoDiets(): Promise<DietPlan[] | null> {
  if (!tursoClient) return null;
  try {
    const res = await tursoClient.execute("SELECT * FROM diet_plans");
    if (!res.rows) return null;
    return res.rows.map(r => ({
      id: String(r.id),
      title: String(r.title),
      goal: (String(r.goal || 'Muscle Gain') as any),
      dietary_preference: 'Non-Vegetarian',
      description: r.description ? String(r.description) : '',
      calories_est: r.calories_target ? Number(r.calories_target) : undefined,
      protein_g: r.protein_grams ? Number(r.protein_grams) : undefined,
      carbs_g: r.carbs_grams ? Number(r.carbs_grams) : undefined,
      fats_g: r.fats_grams ? Number(r.fats_grams) : undefined,
      document_url: r.document_url ? String(r.document_url) : undefined,
      photo_url: r.photo_url ? String(r.photo_url) : undefined,
      meals: typeof r.meals === 'string' ? JSON.parse(r.meals) : [],
      is_published: true,
    }));
  } catch (err) {
    console.warn('[Turso] getTursoDiets error:', err);
    return null;
  }
}

export async function saveTursoDiet(diet: DietPlan): Promise<boolean> {
  if (!tursoClient) return false;
  try {
    await tursoClient.execute({
      sql: `INSERT OR REPLACE INTO diet_plans (id, title, goal, calories_target, protein_grams, carbs_grams, fats_grams, document_url, photo_url, description, meals)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        diet.id, diet.title, diet.goal,
        diet.calories_est || null, diet.protein_g || null,
        diet.carbs_g || null, diet.fats_g || null,
        diet.document_url || null, (diet as any).photo_url || null,
        diet.description || '', JSON.stringify(diet.meals || [])
      ]
    });
    return true;
  } catch (err) {
    console.warn('[Turso] saveTursoDiet error:', err);
    return false;
  }
}

export async function deleteTursoDiet(id: string): Promise<boolean> {
  if (!tursoClient) return false;
  try {
    await tursoClient.execute({ sql: "DELETE FROM diet_plans WHERE id = ?", args: [id] });
    return true;
  } catch (err) {
    console.warn('[Turso] deleteTursoDiet error:', err);
    return false;
  }
}

// ============================================================================
// GALLERY ITEMS
// ============================================================================
export async function getTursoGallery(): Promise<GalleryItem[] | null> {
  if (!tursoClient) return null;
  try {
    const res = await tursoClient.execute("SELECT * FROM gallery_items ORDER BY created_at DESC");
    if (!res.rows) return null;
    return res.rows.map(r => ({
      id: String(r.id),
      title: String(r.title),
      category: (String(r.category || 'Equipment') as any),
      image_url: String(r.url || ''),
      media_type: (String(r.media_type || 'photo') as 'photo' | 'video'),
      url: String(r.url || ''),
      display_order: 1,
      is_published: true,
      created_at: String(r.created_at || ''),
    }));
  } catch (err) {
    console.warn('[Turso] getTursoGallery error:', err);
    return null;
  }
}

export async function saveTursoGallery(item: GalleryItem): Promise<boolean> {
  if (!tursoClient) return false;
  try {
    const url = item.image_url || (item as any).url || '';
    const mediaType = (item as any).media_type || 'photo';
    await tursoClient.execute({
      sql: `INSERT OR REPLACE INTO gallery_items (id, title, category, media_type, url, created_at)
            VALUES (?, ?, ?, ?, ?, ?)`,
      args: [item.id, item.title, item.category, mediaType, url, (item as any).created_at || new Date().toISOString()]
    });
    return true;
  } catch (err) {
    console.warn('[Turso] saveTursoGallery error:', err);
    return false;
  }
}

export async function deleteTursoGallery(id: string): Promise<boolean> {
  if (!tursoClient) return false;
  try {
    await tursoClient.execute({ sql: "DELETE FROM gallery_items WHERE id = ?", args: [id] });
    return true;
  } catch (err) {
    console.warn('[Turso] deleteTursoGallery error:', err);
    return false;
  }
}

// ============================================================================
// ENQUIRIES
// ============================================================================
export async function getTursoEnquiries(): Promise<Enquiry[] | null> {
  if (!tursoClient) return null;
  try {
    const res = await tursoClient.execute("SELECT * FROM enquiries ORDER BY created_at DESC");
    if (!res.rows) return null;
    return res.rows.map(r => ({
      id: String(r.id),
      name: String(r.full_name || ''),
      phone: String(r.phone),
      email: r.email ? String(r.email) : undefined,
      plan_interest: r.interested_plan ? String(r.interested_plan) : undefined,
      message: r.message ? String(r.message) : '',
      status: (String(r.status || 'new') as 'new' | 'contacted' | 'closed'),
      admin_notes: (r as any).admin_notes ? String((r as any).admin_notes) : undefined,
      created_at: String(r.created_at || new Date().toISOString()),
    }));
  } catch (err) {
    console.warn('[Turso] getTursoEnquiries error:', err);
    return null;
  }
}

export async function saveTursoEnquiry(enquiry: Enquiry): Promise<boolean> {
  if (!tursoClient) return false;
  try {
    await tursoClient.execute({
      sql: `INSERT OR REPLACE INTO enquiries (id, full_name, phone, email, interested_plan, message, status, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        enquiry.id, enquiry.name, enquiry.phone,
        enquiry.email || null, enquiry.plan_interest || null,
        enquiry.message || '', enquiry.status || 'new',
        enquiry.created_at || new Date().toISOString()
      ]
    });
    return true;
  } catch (err) {
    console.warn('[Turso] saveTursoEnquiry error:', err);
    return false;
  }
}

// ============================================================================
// SPECIAL OFFER
// ============================================================================
export async function getTursoSpecialOffer(): Promise<SpecialOffer | null> {
  if (!tursoClient) return null;
  try {
    const res = await tursoClient.execute("SELECT * FROM special_offers WHERE id = 'active-offer' LIMIT 1");
    if (!res.rows || res.rows.length === 0) return null;
    const r = res.rows[0];
    return {
      id: String(r.id),
      title: String(r.title),
      badge: String(r.badge),
      description: String(r.description),
      image_url: r.image_url ? String(r.image_url) : '',
      cta_text: String(r.cta_text),
      cta_link: String(r.cta_link),
      is_active: Boolean(r.is_active),
      updated_at: r.updated_at ? String(r.updated_at) : undefined,
    };
  } catch (err) {
    console.warn('[Turso] getTursoSpecialOffer error:', err);
    return null;
  }
}

export async function saveTursoSpecialOffer(offer: SpecialOffer): Promise<boolean> {
  if (!tursoClient) return false;
  try {
    await tursoClient.execute({
      sql: `INSERT OR REPLACE INTO special_offers (id, title, badge, description, image_url, cta_text, cta_link, is_active, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        'active-offer',
        offer.title,
        offer.badge,
        offer.description,
        offer.image_url || '',
        offer.cta_text,
        offer.cta_link,
        offer.is_active ? 1 : 0,
        new Date().toISOString()
      ]
    });
    return true;
  } catch (err) {
    console.warn('[Turso] saveTursoSpecialOffer error:', err);
    return false;
  }
}

