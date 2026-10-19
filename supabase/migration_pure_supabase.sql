-- ==============================================================================
-- KKL MUSCLE FACTORY - COMPLETE PURE SUPABASE REALTIME BACKEND MIGRATION
-- Run this script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/ongheyduancudpzoopxa/sql/new
-- ==============================================================================

-- 1. GYM SETTINGS
CREATE TABLE IF NOT EXISTS public.gym_settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    gym_name TEXT NOT NULL DEFAULT 'KKL Muscle Factory',
    tagline TEXT NOT NULL DEFAULT 'Gym and Fitness Center',
    headline TEXT NOT NULL DEFAULT 'Build Strength. Build Discipline.',
    phone TEXT NOT NULL DEFAULT '9490862006',
    whatsapp_number TEXT NOT NULL DEFAULT '919490862006',
    email TEXT DEFAULT 'kklmusclefactory@gmail.com',
    address TEXT NOT NULL DEFAULT 'petrol Bunk Back side, Bus stand, R.K, Main Rd, Koilkuntla, Andhra Pradesh 518134',
    map_url TEXT NOT NULL DEFAULT 'https://www.google.com/maps/place/kkl+muscle+factory/data=!4m2!3m1!1s0x3bb447843490dd71:0xb933f80596f77482?sa=X&ved=1t:242&ictx=111',
    instagram_url TEXT NOT NULL DEFAULT 'https://www.instagram.com/muscle_factory_fitness_center/',
    opening_hours TEXT NOT NULL DEFAULT 'Mon-Sat: 5:30 AM - 10:30 AM & 5:00 PM - 9:30 PM | Sun: 6:00 AM - 10:00 AM',
    logo_url TEXT DEFAULT '/logo.png',
    member_portal_enabled BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Insert Default Settings if not exists
INSERT INTO public.gym_settings (id, gym_name, phone, whatsapp_number, address)
VALUES ('default', 'KKL Muscle Factory', '9490862006', '919490862006', 'petrol Bunk Back side, Bus stand, R.K, Main Rd, Koilkuntla, Andhra Pradesh 518134')
ON CONFLICT (id) DO NOTHING;

-- 2. MEMBERSHIP PLANS
DROP TABLE IF EXISTS public.memberships CASCADE;
DROP TABLE IF EXISTS public.membership_plans CASCADE;
CREATE TABLE public.membership_plans (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    duration_months INTEGER NOT NULL,
    price NUMERIC NOT NULL,
    description TEXT,
    benefits JSONB DEFAULT '[]'::jsonb,
    is_popular BOOLEAN NOT NULL DEFAULT false,
    is_published BOOLEAN NOT NULL DEFAULT true,
    display_order INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Seed Plans
INSERT INTO public.membership_plans (id, name, duration_months, price, description, benefits, is_popular, is_published, display_order)
VALUES 
('plan-1', '1 Month Fitness Starter', 1, 1200, 'Ideal for beginners starting their fitness discipline.', '["Full Gym Access", "General Floor Trainer Guidance", "Locker & Shower Access", "Free Fitness Assessment"]'::jsonb, false, true, 1),
('plan-2', '3 Months Muscle Builder', 3, 3200, 'Our most popular plan for visible muscular gains and fat loss.', '["Full Gym & Cardio Floor Access", "Personalized Workout Protocol", "Nutrition & Diet Consultation", "Weekly Progress Tracking", "Free Gym Shaker Bottle"]'::jsonb, true, true, 2),
('plan-3', '6 Months Body Transformation', 6, 5800, 'Serious commitment program designed for complete athletic transformation.', '["All Free Weights & Machine Zones", "Advanced Periodized Training Plan", "Custom Diet Chart & Macro Guidance", "Monthly Body Fat Analysis", "1-on-1 Trainer Technique Sessions"]'::jsonb, false, true, 3),
('plan-4', '1 Year Elite Beast Tier', 12, 10000, 'Ultimate VIP gym access with maximum priority benefits and merchandise.', '["365-Day Unlimited All-Access", "Exclusive VIP Locker Access", "Dedicated Senior Trainer Support", "Quarterly Diet Plan Updates", "Official KKL Muscle Factory T-Shirt"]'::jsonb, false, true, 4)
ON CONFLICT (id) DO UPDATE SET name = excluded.name, price = excluded.price, benefits = excluded.benefits;

-- 3. TRAINERS
DROP TABLE IF EXISTS public.trainers CASCADE;
CREATE TABLE public.trainers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    specialization TEXT NOT NULL,
    experience TEXT NOT NULL,
    bio TEXT,
    photo_url TEXT,
    certifications JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT true,
    display_order INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Seed Trainers
INSERT INTO public.trainers (id, name, specialization, experience, bio, photo_url, certifications, is_active, display_order)
VALUES
('trainer-1', 'Ramesh Kumar', 'Head Coach & Bodybuilding Specialist', '10+ Years', 'Specializes in competition prep, progressive overload, powerlifting, and muscle hypertrophy for all levels.', '/images/trainer-male.jpg', '["Certified Strength Coach", "Advanced Hypertrophy Specialist", "First Aid & CPR Certified"]'::jsonb, true, 1),
('trainer-2', 'Pooja Reddy', 'Strength & Functional Fitness Specialist', '6+ Years', 'Passionate about helping women and men build lean strength, posture correction, and metabolic conditioning.', '/images/trainer-female.jpg', '["ACE Certified Personal Trainer", "Functional Movement Specialist"]'::jsonb, true, 2)
ON CONFLICT (id) DO UPDATE SET name = excluded.name, specialization = excluded.specialization, photo_url = excluded.photo_url;

-- 4. MEMBERS
DROP TABLE IF EXISTS public.attendance CASCADE;
DROP TABLE IF EXISTS public.workout_assignments CASCADE;
DROP TABLE IF EXISTS public.diet_assignments CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.members CASCADE;
CREATE TABLE public.members (
    id TEXT PRIMARY KEY,
    member_code TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    gender TEXT DEFAULT 'Male',
    date_of_birth TEXT,
    emergency_contact TEXT,
    medical_notes TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    join_date TEXT NOT NULL,
    current_plan_name TEXT,
    expiry_date TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Seed Members
INSERT INTO public.members (id, member_code, full_name, phone, status, join_date, current_plan_name, expiry_date)
VALUES
('mem-101', 'KKL-1001', 'Suresh Varma', '9876543210', 'active', '2025-01-10', '3 Months Strength', '2026-10-10'),
('mem-102', 'KKL-1002', 'Kiran Patel', '9876543211', 'active', '2025-02-01', '6 Months Transformation', '2026-08-01'),
('mem-103', 'KKL-1003', 'Anitha Devi', '9876543212', 'active', '2025-03-15', '1 Year Elite Beast', '2027-03-15')
ON CONFLICT (id) DO UPDATE SET full_name = excluded.full_name, phone = excluded.phone;

-- 5. ATTENDANCE
CREATE TABLE public.attendance (
    id TEXT PRIMARY KEY,
    member_id TEXT NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
    check_in_date TEXT NOT NULL,
    check_in_time TEXT NOT NULL,
    session_type TEXT NOT NULL DEFAULT 'General',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. WORKOUT PLANS
DROP TABLE IF EXISTS public.exercises CASCADE;
DROP TABLE IF EXISTS public.workout_plans CASCADE;
CREATE TABLE public.workout_plans (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    difficulty TEXT NOT NULL DEFAULT 'Intermediate',
    days_per_week INTEGER NOT NULL DEFAULT 4,
    is_published BOOLEAN NOT NULL DEFAULT true,
    exercises JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Seed Workout Plans
INSERT INTO public.workout_plans (id, title, description, difficulty, days_per_week, is_published, exercises)
VALUES
('workout-1', 'Hypertrophy 4-Day Muscle Builder', 'Designed to maximize muscle size and strength using high intensity compound and isolation movements.', 'Intermediate', 4, true, '[
  {"id":"ex-1","plan_id":"workout-1","day_name":"Day 1: Chest & Triceps","exercise_name":"Flat Barbell Bench Press","sets":4,"reps":"8-10","rest_seconds":90,"instructions":"Retract scapula, lower bar with control to mid-chest, press upwards explosively.","demo_url":"https://www.youtube.com/watch?v=rT7DgCr-3pg","display_order":1},
  {"id":"ex-2","plan_id":"workout-1","day_name":"Day 1: Chest & Triceps","exercise_name":"Incline Dumbbell Press","sets":3,"reps":"10-12","rest_seconds":75,"instructions":"Set bench at 30 degrees, press dumbbells keeping elbows tucked at 45 degrees.","demo_url":"https://www.youtube.com/watch?v=8iPEnn-ltC8","display_order":2},
  {"id":"ex-3","plan_id":"workout-1","day_name":"Day 2: Back & Biceps","exercise_name":"Barbell Deadlift","sets":4,"reps":"5-6","rest_seconds":120,"instructions":"Brace core, neutral spine, drive through heels and lock hips at top.","demo_url":"https://www.youtube.com/watch?v=op9kVnSso6Q","display_order":3}
]'::jsonb)
ON CONFLICT (id) DO UPDATE SET title = excluded.title, exercises = excluded.exercises;

-- 7. DIET PLANS
DROP TABLE IF EXISTS public.diet_plans CASCADE;
CREATE TABLE public.diet_plans (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    goal TEXT NOT NULL DEFAULT 'Muscle Gain',
    dietary_preference TEXT NOT NULL DEFAULT 'Non-Vegetarian',
    description TEXT,
    calories_est INTEGER,
    protein_g INTEGER,
    carbs_g INTEGER,
    fats_g INTEGER,
    meals JSONB DEFAULT '[]'::jsonb,
    document_url TEXT,
    photo_url TEXT,
    is_published BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Seed Diet Plans
INSERT INTO public.diet_plans (id, title, goal, dietary_preference, description, calories_est, protein_g, carbs_g, fats_g, meals, is_published)
VALUES
('diet-1', 'High Protein Lean Bulk Diet', 'Bulking', 'Non-Vegetarian', 'Engineered for natural athletes looking to pack on dense muscle mass while keeping body fat low.', 2800, 175, 340, 65, '[
  {"name":"Meal 1: Power Breakfast","time":"7:30 AM","items":"4 Boiled Eggs (3 whites, 1 whole) + 80g Rolled Oats with 1 scoop Whey Protein & Banana","portions":"1 bowl oats + 4 eggs","notes":"Drink 500ml water upon waking."},
  {"name":"Meal 2: Anabolic Lunch","time":"1:30 PM","items":"150g Grilled Chicken Breast + 1.5 cups Rice + Yellow Dal & Fresh Salad","portions":"150g protein + 200g rice + 1 bowl dal","notes":"Avoid heavy oils in gravy."},
  {"name":"Meal 3: Recovery Dinner","time":"9:15 PM","items":"150g Fish / Chicken + 2 Multigrain Rotis + Steamed Broccoli & Mixed Veggies","portions":"150g meat + 2 rotis + veggies","notes":"Eat 1.5h before sleep."}
]'::jsonb, true)
ON CONFLICT (id) DO UPDATE SET title = excluded.title, meals = excluded.meals;

-- 8. ASSIGNMENTS
CREATE TABLE public.workout_assignments (
    id TEXT PRIMARY KEY,
    member_id TEXT NOT NULL,
    plan_id TEXT NOT NULL,
    assigned_date TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE public.diet_assignments (
    id TEXT PRIMARY KEY,
    member_id TEXT NOT NULL,
    plan_id TEXT NOT NULL,
    assigned_date TEXT,
    special_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 9. GALLERY
DROP TABLE IF EXISTS public.gallery_items CASCADE;
CREATE TABLE public.gallery_items (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'Equipment',
    image_url TEXT NOT NULL,
    media_type TEXT NOT NULL DEFAULT 'photo',
    display_order INTEGER NOT NULL DEFAULT 1,
    is_published BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

INSERT INTO public.gallery_items (id, title, category, image_url, display_order, is_published)
VALUES
('gal-1', 'Heavy Free-Weight Zone & Dumbbell Rack', 'Equipment', '/images/facility-dumbbells.jpg', 1, true),
('gal-2', 'Plate-Loaded Strength & Cable Section', 'Equipment', '/images/facility-machines.jpg', 2, true),
('gal-3', 'Olympic Lifting Platform & Deadlift Station', 'Gym Floor', '/images/hero-bg.jpg', 3, true),
('gal-4', 'Professional Trainer 1-on-1 Coaching', 'Training', '/images/trainer-male.jpg', 4, true)
ON CONFLICT (id) DO NOTHING;

-- 10. ENQUIRIES
DROP TABLE IF EXISTS public.enquiries CASCADE;
CREATE TABLE public.enquiries (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    plan_interest TEXT,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'new',
    admin_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 11. SPECIAL OFFERS
DROP TABLE IF EXISTS public.special_offers CASCADE;
CREATE TABLE public.special_offers (
    id TEXT PRIMARY KEY DEFAULT 'active-offer',
    title TEXT NOT NULL,
    badge TEXT NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT,
    cta_text TEXT NOT NULL,
    cta_link TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

INSERT INTO public.special_offers (id, title, badge, description, image_url, cta_text, cta_link, is_active)
VALUES
('active-offer', 'Grand Fitness Transformation Offer!', 'SPECIAL PROMOTION • FLAT 20% OFF', 'Join any 6-Month or Annual Gym Membership and get 1 Month FREE + 1-on-1 Personalized Diet Protocol included! Limited registration slots available this month.', '/images/hero-bg.jpg', 'Claim Offer on WhatsApp', 'https://wa.me/919963625470?text=Hi%20KKL%20Muscle%20Factory!%20I%20want%20to%20claim%20the%20Special%20Transformation%20Offer.', true)
ON CONFLICT (id) DO NOTHING;

-- 12. DISABLE ROW LEVEL SECURITY (RLS) SO ALL DEVICES & PROFILES SYNC IN REALTIME DIRECTLY WITH SUPABASE!
ALTER TABLE public.gym_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.members DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.membership_plans DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.trainers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_plans DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.diet_plans DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_assignments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.diet_assignments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquiries DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.special_offers DISABLE ROW LEVEL SECURITY;

-- 13. ENABLE SUPABASE REALTIME REPLICATION!
DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.gym_settings;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.members;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.membership_plans;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.trainers;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.attendance;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.workout_plans;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.diet_plans;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.gallery_items;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.enquiries;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.special_offers;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;
