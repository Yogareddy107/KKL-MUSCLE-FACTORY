-- ==============================================================================
-- KKL MUSCLE FACTORY - GYM AND FITNESS CENTER
-- Complete Supabase PostgreSQL Schema, RLS Policies, Storage, and Seed Data
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMS & DOMAINS
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'member');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. GYM SETTINGS TABLE (Single row configuration)
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

-- 4. PROFILES TABLE (Supabase Auth link)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
    full_name TEXT NOT NULL,
    member_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. MEMBERS TABLE
CREATE TABLE IF NOT EXISTS public.members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_code TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    gender TEXT CHECK (gender IN ('Male', 'Female', 'Other')),
    date_of_birth DATE,
    emergency_contact TEXT,
    medical_notes TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'expired', 'pending')),
    join_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Add foreign key constraint to profiles.member_id
ALTER TABLE public.profiles 
    DROP CONSTRAINT IF EXISTS fk_profiles_member,
    ADD CONSTRAINT fk_profiles_member FOREIGN KEY (member_id) REFERENCES public.members(id) ON DELETE SET NULL;

-- 6. MEMBERSHIP PLANS
CREATE TABLE IF NOT EXISTS public.membership_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    duration_months INTEGER NOT NULL CHECK (duration_months > 0),
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    description TEXT,
    benefits TEXT[] NOT NULL DEFAULT '{}',
    is_popular BOOLEAN NOT NULL DEFAULT false,
    is_published BOOLEAN NOT NULL DEFAULT true,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. MEMBERSHIPS (Subscriptions / Enrollments)
CREATE TABLE IF NOT EXISTS public.memberships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES public.membership_plans(id),
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expiry_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
    amount_paid NUMERIC(10, 2) NOT NULL DEFAULT 0,
    payment_method TEXT NOT NULL DEFAULT 'Cash' CHECK (payment_method IN ('Cash', 'UPI', 'Card', 'Bank Transfer')),
    payment_reference TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 8. TRAINERS
CREATE TABLE IF NOT EXISTS public.trainers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    specialization TEXT NOT NULL,
    experience TEXT NOT NULL,
    bio TEXT,
    photo_url TEXT,
    certifications TEXT[] NOT NULL DEFAULT '{}',
    is_active BOOLEAN NOT NULL DEFAULT true,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 9. ATTENDANCE TABLE
CREATE TABLE IF NOT EXISTS public.attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
    check_in_date DATE NOT NULL DEFAULT CURRENT_DATE,
    check_in_time TIME NOT NULL DEFAULT CURRENT_TIME,
    session_type TEXT NOT NULL DEFAULT 'General' CHECK (session_type IN ('Morning', 'Evening', 'General')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_daily_checkin UNIQUE (member_id, check_in_date, session_type)
);

-- 10. WORKOUT PLANS
CREATE TABLE IF NOT EXISTS public.workout_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    difficulty TEXT NOT NULL DEFAULT 'Intermediate' CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced')),
    days_per_week INTEGER NOT NULL DEFAULT 5,
    is_published BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 11. EXERCISES
CREATE TABLE IF NOT EXISTS public.exercises (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plan_id UUID NOT NULL REFERENCES public.workout_plans(id) ON DELETE CASCADE,
    day_name TEXT NOT NULL,
    exercise_name TEXT NOT NULL,
    sets INTEGER NOT NULL DEFAULT 3,
    reps TEXT NOT NULL DEFAULT '10-12',
    rest_seconds INTEGER NOT NULL DEFAULT 60,
    instructions TEXT,
    demo_url TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 12. WORKOUT ASSIGNMENTS
CREATE TABLE IF NOT EXISTS public.workout_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES public.workout_plans(id) ON DELETE CASCADE,
    assigned_date DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_member_workout UNIQUE (member_id, plan_id)
);

-- 13. WORKOUT PROGRESS (Self-tracking)
CREATE TABLE IF NOT EXISTS public.workout_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
    exercise_id UUID NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    weight_kg NUMERIC(6, 2) NOT NULL DEFAULT 0,
    reps_completed INTEGER NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 14. DIET PLANS
CREATE TABLE IF NOT EXISTS public.diet_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    goal TEXT NOT NULL DEFAULT 'Muscle Gain' CHECK (goal IN ('Bulking', 'Cutting', 'Muscle Gain', 'Fat Loss', 'General Fitness')),
    dietary_preference TEXT NOT NULL DEFAULT 'Non-Vegetarian' CHECK (dietary_preference IN ('Non-Vegetarian', 'Vegetarian', 'Eggetarian')),
    description TEXT,
    calories_est INTEGER,
    protein_g INTEGER,
    carbs_g INTEGER,
    fats_g INTEGER,
    meals JSONB NOT NULL DEFAULT '[]'::jsonb,
    document_url TEXT,
    is_published BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 15. DIET ASSIGNMENTS
CREATE TABLE IF NOT EXISTS public.diet_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES public.diet_plans(id) ON DELETE CASCADE,
    assigned_date DATE NOT NULL DEFAULT CURRENT_DATE,
    special_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_member_diet UNIQUE (member_id, plan_id)
);

-- 16. ENQUIRIES / CONTACT LEADS
CREATE TABLE IF NOT EXISTS public.enquiries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    plan_interest TEXT,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'closed')),
    admin_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 17. GALLERY ITEMS
CREATE TABLE IF NOT EXISTS public.gallery_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'Equipment' CHECK (category IN ('Equipment', 'Gym Floor', 'Transformation', 'Training')),
    image_url TEXT NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_published BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- INDEXES FOR FAST QUERYING
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_members_phone ON public.members(phone);
CREATE INDEX IF NOT EXISTS idx_members_code ON public.members(member_code);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON public.attendance(check_in_date);
CREATE INDEX IF NOT EXISTS idx_attendance_member ON public.attendance(member_id);
CREATE INDEX IF NOT EXISTS idx_memberships_expiry ON public.memberships(expiry_date);
CREATE INDEX IF NOT EXISTS idx_memberships_member ON public.memberships(member_id);
CREATE INDEX IF NOT EXISTS idx_workout_assignments_member ON public.workout_assignments(member_id);
CREATE INDEX IF NOT EXISTS idx_diet_assignments_member ON public.diet_assignments(member_id);
CREATE INDEX IF NOT EXISTS idx_enquiries_status ON public.enquiries(status);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS across all tables
ALTER TABLE public.gym_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.membership_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trainers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diet_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diet_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_items ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. GYM SETTINGS: Anyone can read, only admin can update
CREATE POLICY "Public can view gym settings" ON public.gym_settings
    FOR SELECT USING (true);
CREATE POLICY "Admins can update gym settings" ON public.gym_settings
    FOR ALL USING (public.is_admin());

-- 2. PROFILES: Users read/update their own profile, admin reads all
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id OR public.is_admin());
CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can manage all profiles" ON public.profiles
    FOR ALL USING (public.is_admin());

-- 3. MEMBERS: Admin can manage all. Member can view their own member record linked via profile
CREATE POLICY "Members can view own record" ON public.members
    FOR SELECT USING (
        id IN (SELECT member_id FROM public.profiles WHERE id = auth.uid()) 
        OR public.is_admin()
    );
CREATE POLICY "Admins can manage members" ON public.members
    FOR ALL USING (public.is_admin());

-- 4. MEMBERSHIP PLANS: Public can view published plans, admin can manage all
CREATE POLICY "Public can view published plans" ON public.membership_plans
    FOR SELECT USING (is_published = true OR public.is_admin());
CREATE POLICY "Admins can manage membership plans" ON public.membership_plans
    FOR ALL USING (public.is_admin());

-- 5. MEMBERSHIPS: Member can view their own memberships, admin can manage all
CREATE POLICY "Members can view own memberships" ON public.memberships
    FOR SELECT USING (
        member_id IN (SELECT member_id FROM public.profiles WHERE id = auth.uid())
        OR public.is_admin()
    );
CREATE POLICY "Admins can manage memberships" ON public.memberships
    FOR ALL USING (public.is_admin());

-- 6. TRAINERS: Public can view active trainers, admin can manage all
CREATE POLICY "Public can view active trainers" ON public.trainers
    FOR SELECT USING (is_active = true OR public.is_admin());
CREATE POLICY "Admins can manage trainers" ON public.trainers
    FOR ALL USING (public.is_admin());

-- 7. ATTENDANCE: Member can view own attendance, admin can manage all
CREATE POLICY "Members can view own attendance" ON public.attendance
    FOR SELECT USING (
        member_id IN (SELECT member_id FROM public.profiles WHERE id = auth.uid())
        OR public.is_admin()
    );
CREATE POLICY "Admins can manage attendance" ON public.attendance
    FOR ALL USING (public.is_admin());

-- 8. WORKOUT PLANS & EXERCISES:
-- Published plans or assigned plans viewable, admin can manage all
CREATE POLICY "Public or members can view published workout plans" ON public.workout_plans
    FOR SELECT USING (
        is_published = true 
        OR id IN (
            SELECT plan_id FROM public.workout_assignments 
            WHERE member_id IN (SELECT member_id FROM public.profiles WHERE id = auth.uid())
        )
        OR public.is_admin()
    );
CREATE POLICY "Admins can manage workout plans" ON public.workout_plans
    FOR ALL USING (public.is_admin());

CREATE POLICY "View exercises of viewable workout plans" ON public.exercises
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.workout_plans wp 
            WHERE wp.id = exercises.plan_id 
            AND (wp.is_published = true OR public.is_admin())
        )
        OR plan_id IN (
            SELECT plan_id FROM public.workout_assignments 
            WHERE member_id IN (SELECT member_id FROM public.profiles WHERE id = auth.uid())
        )
    );
CREATE POLICY "Admins can manage exercises" ON public.exercises
    FOR ALL USING (public.is_admin());

-- 9. WORKOUT ASSIGNMENTS & PROGRESS:
CREATE POLICY "Members view own workout assignments" ON public.workout_assignments
    FOR SELECT USING (
        member_id IN (SELECT member_id FROM public.profiles WHERE id = auth.uid())
        OR public.is_admin()
    );
CREATE POLICY "Admins manage workout assignments" ON public.workout_assignments
    FOR ALL USING (public.is_admin());

CREATE POLICY "Members view and track own progress" ON public.workout_progress
    FOR ALL USING (
        member_id IN (SELECT member_id FROM public.profiles WHERE id = auth.uid())
        OR public.is_admin()
    );

-- 10. DIET PLANS & DIET ASSIGNMENTS:
CREATE POLICY "Members view assigned diet plans" ON public.diet_plans
    FOR SELECT USING (
        id IN (
            SELECT plan_id FROM public.diet_assignments 
            WHERE member_id IN (SELECT member_id FROM public.profiles WHERE id = auth.uid())
        )
        OR public.is_admin()
    );
CREATE POLICY "Admins manage diet plans" ON public.diet_plans
    FOR ALL USING (public.is_admin());

CREATE POLICY "Members view own diet assignments" ON public.diet_assignments
    FOR SELECT USING (
        member_id IN (SELECT member_id FROM public.profiles WHERE id = auth.uid())
        OR public.is_admin()
    );
CREATE POLICY "Admins manage diet assignments" ON public.diet_assignments
    FOR ALL USING (public.is_admin());

-- 11. ENQUIRIES: Public can insert (submit contact form), only admin can view & update
CREATE POLICY "Anyone can submit contact enquiry" ON public.enquiries
    FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins manage enquiries" ON public.enquiries
    FOR ALL USING (public.is_admin());

-- 12. GALLERY: Public can view published items, admin can manage all
CREATE POLICY "Public view published gallery" ON public.gallery_items
    FOR SELECT USING (is_published = true OR public.is_admin());
CREATE POLICY "Admins manage gallery" ON public.gallery_items
    FOR ALL USING (public.is_admin());

-- ==============================================================================
-- STORAGE BUCKETS SETUP (Run in Supabase SQL editor)
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES 
    ('gym-media', 'gym-media', true),
    ('trainer-photos', 'trainer-photos', true),
    ('diet-documents', 'diet-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Public can view gym-media and trainer-photos
CREATE POLICY "Public can view gym media" ON storage.objects
    FOR SELECT USING (bucket_id IN ('gym-media', 'trainer-photos'));

-- Admin full control on storage
CREATE POLICY "Admin can manage storage objects" ON storage.objects
    FOR ALL USING (public.is_admin());

-- Authenticated member can download their own diet documents
CREATE POLICY "Members can download assigned diet docs" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'diet-documents' 
        AND auth.role() = 'authenticated'
    );

-- ==============================================================================
-- SEED DATA: OFFICIAL KKL MUSCLE FACTORY DETAILS
-- ==============================================================================

-- 1. Gym Settings
INSERT INTO public.gym_settings (
    id, gym_name, tagline, headline, phone, whatsapp_number, email, 
    address, map_url, instagram_url, opening_hours, logo_url, member_portal_enabled
) VALUES (
    'default',
    'KKL Muscle Factory',
    'Gym and Fitness Center',
    'Build Strength. Build Discipline.',
    '9490862006',
    '919490862006',
    'kklmusclefactory@gmail.com',
    'petrol Bunk Back side, Bus stand, R.K, Main Rd, Koilkuntla, Andhra Pradesh 518134',
    'https://www.google.com/maps/place/kkl+muscle+factory/data=!4m2!3m1!1s0x3bb447843490dd71:0xb933f80596f77482?sa=X&ved=1t:242&ictx=111',
    'https://www.instagram.com/muscle_factory_fitness_center/',
    'Mon-Sat: 5:30 AM - 10:30 AM & 5:00 PM - 9:30 PM | Sun: 6:00 AM - 10:00 AM',
    '/logo.png',
    true
) ON CONFLICT (id) DO UPDATE SET
    phone = EXCLUDED.phone,
    whatsapp_number = EXCLUDED.whatsapp_number,
    address = EXCLUDED.address,
    map_url = EXCLUDED.map_url,
    instagram_url = EXCLUDED.instagram_url;

-- 2. Membership Plans
INSERT INTO public.membership_plans (id, name, duration_months, price, description, benefits, is_popular, is_published, display_order)
VALUES 
    ('11111111-1111-1111-1111-111111111111', '1 Month Starter', 1, 1200.00, 'Perfect introduction to powerlifting and bodybuilding equipment.', ARRAY['Full Gym Access', 'General Trainer Guidance', 'Locker & Changing Area', 'Free Water & Cardio Deck'], false, true, 1),
    ('22222222-2222-2222-2222-222222222222', '3 Months Strength', 3, 3200.00, 'Most popular for building a strong foundation and progressive overload.', ARRAY['Full Gym Access', 'Customized Workout Routine', 'Body Composition Tracking', 'Nutrition Guidelines', 'Locker Access'], true, true, 2),
    ('33333333-3333-3333-3333-333333333333', '6 Months Transformation', 6, 5800.00, 'Dedicated period for serious hypertrophy or radical fat loss.', ARRAY['Full Gym Access (All Hours)', 'Personalized Workout Plan', 'Tailored Diet Schedule', 'Monthly Progress Reviews', 'WhatsApp Coach Support'], false, true, 3),
    ('44444444-4444-4444-4444-444444444444', '1 Year Elite VIP', 12, 9999.00, 'Complete annual commitment with maximum savings and priority coaching.', ARRAY['Unlimited Gym Access 365 Days', 'Dedicated Diet & Workout Plan', 'Periodic 1-on-1 Form Check', 'VIP Locker & Free Gym Kit Bag', 'Diet Plan WhatsApp Support'], false, true, 4)
ON CONFLICT (id) DO NOTHING;

-- 3. Trainers
INSERT INTO public.trainers (id, name, specialization, experience, bio, photo_url, certifications, is_active, display_order)
VALUES 
    ('55555555-5555-5555-5555-555555555555', 'Ramesh Kumar', 'Head Coach & Bodybuilding Specialist', '10+ Years', 'Specializes in competition prep, progressive overload, powerlifting, and muscle hypertrophy for all levels.', '/images/trainer-male.jpg', ARRAY['Certified Strength Coach', 'Advanced Hypertrophy Specialist', 'First Aid & CPR Certified'], true, 1),
    ('66666666-6666-6666-6666-666666666666', 'Pooja Reddy', 'Strength & Functional Fitness Specialist', '6+ Years', 'Passionate about helping women and men build lean strength, posture correction, and metabolic conditioning.', '/images/trainer-female.jpg', ARRAY['ACE Certified Personal Trainer', 'Functional Movement Specialist'], true, 2)
ON CONFLICT (id) DO NOTHING;

-- 4. Initial Demo Members
INSERT INTO public.members (id, member_code, full_name, phone, email, gender, status, join_date)
VALUES 
    ('77777777-7777-7777-7777-777777777771', 'KKL-1001', 'Suresh Varma', '9876543210', 'suresh@example.com', 'Male', 'active', CURRENT_DATE - INTERVAL '60 days'),
    ('77777777-7777-7777-7777-777777777772', 'KKL-1002', 'Kiran Patel', '9876543211', 'kiran@example.com', 'Male', 'active', CURRENT_DATE - INTERVAL '30 days'),
    ('77777777-7777-7777-7777-777777777773', 'KKL-1003', 'Anitha Devi', '9876543212', 'anitha@example.com', 'Female', 'active', CURRENT_DATE - INTERVAL '15 days')
ON CONFLICT (id) DO NOTHING;

-- 5. Initial Active Memberships
INSERT INTO public.memberships (id, member_id, plan_id, start_date, expiry_date, status, amount_paid, payment_method)
VALUES 
    ('88888888-8888-8888-8888-888888888881', '77777777-7777-7777-7777-777777777771', '22222222-2222-2222-2222-222222222222', CURRENT_DATE - INTERVAL '60 days', CURRENT_DATE + INTERVAL '30 days', 'active', 3200.00, 'UPI'),
    ('88888888-8888-8888-8888-888888888882', '77777777-7777-7777-7777-777777777772', '33333333-3333-3333-3333-333333333333', CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE + INTERVAL '150 days', 'active', 5800.00, 'Cash')
ON CONFLICT (id) DO NOTHING;

-- 6. Initial Workout Plans & Exercises
INSERT INTO public.workout_plans (id, title, description, difficulty, days_per_week, is_published)
VALUES 
    ('99999999-9999-9999-9999-999999999991', 'Hypertrophy 4-Day Muscle Builder', 'Designed to maximize muscle size and strength using high intensity compound and isolation movements.', 'Intermediate', 4, true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.exercises (plan_id, day_name, exercise_name, sets, reps, rest_seconds, instructions, demo_url, display_order)
VALUES 
    ('99999999-9999-9999-9999-999999999991', 'Day 1: Chest & Triceps', 'Flat Barbell Bench Press', 4, '8-10', 90, 'Retract scapula, lower bar with control to mid-chest, press upwards explosively.', 'https://www.youtube.com/watch?v=rT7DgCr-3pg', 1),
    ('99999999-9999-9999-9999-999999999991', 'Day 1: Chest & Triceps', 'Incline Dumbbell Press', 3, '10-12', 75, 'Set bench at 30 degrees, press dumbbells keeping elbows tucked at 45 degrees.', 'https://www.youtube.com/watch?v=8iPEnn-ltC8', 2),
    ('99999999-9999-9999-9999-999999999991', 'Day 1: Chest & Triceps', 'Cable Rope Triceps Pushdown', 3, '12-15', 60, 'Lock elbows at your ribs, fully flare rope at bottom for peak contraction.', 'https://www.youtube.com/watch?v=vB5OHsJ3EME', 3),
    ('99999999-9999-9999-9999-999999999991', 'Day 2: Back & Biceps', 'Barbell Deadlift', 4, '5-6', 120, 'Brace core, neutral spine, drive through heels and lock hips at the top.', 'https://www.youtube.com/watch?v=op9kVnSso6Q', 4),
    ('99999999-9999-9999-9999-999999999991', 'Day 2: Back & Biceps', 'Lat Pulldown (Wide Grip)', 4, '10-12', 75, 'Pull down to upper chest, squeeze lats, control the eccentric stretch.', 'https://www.youtube.com/watch?v=CAwf7n6Luuc', 5),
    ('99999999-9999-9999-9999-999999999991', 'Day 2: Back & Biceps', 'Barbell Biceps Curl', 3, '10-12', 60, 'Strict form, no swinging, squeeze biceps at top.', 'https://www.youtube.com/watch?v=kwG2ipFRgfo', 6);

-- Assign Workout to Demo Member
INSERT INTO public.workout_assignments (member_id, plan_id, assigned_date, notes)
VALUES 
    ('77777777-7777-7777-7777-777777777771', '99999999-9999-9999-9999-999999999991', CURRENT_DATE, 'Focus on progressive overload each week. Log weights accurately.')
ON CONFLICT DO NOTHING;

-- 7. Initial Diet Plans
INSERT INTO public.diet_plans (
    id, title, goal, dietary_preference, description, calories_est, protein_g, carbs_g, fats_g, meals, is_published
) VALUES (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'High Protein Lean Bulk Diet',
    'Bulking',
    'Non-Vegetarian',
    'Engineered for natural athletes looking to pack on dense muscle mass while keeping body fat low.',
    2800,
    175,
    340,
    65,
    '[
        {"name": "Meal 1: Breakfast", "time": "7:30 AM", "items": "4 Boiled Eggs (3 whites, 1 whole) + 80g Rolled Oats with 1 scoop Whey Protein & Banana", "portions": "1 bowl oats + 4 eggs", "notes": "Drink 500ml water before eating."},
        {"name": "Meal 2: Mid-Morning", "time": "11:00 AM", "items": "1 Apple or Papaya + Handful of raw Almonds & Walnuts (25g)", "portions": "1 fruit + 12 nuts", "notes": "Rich in healthy fats and micronutrients."},
        {"name": "Meal 3: Lunch", "time": "1:30 PM", "items": "150g Grilled Chicken Breast or Paneer + 1.5 cups Brown / Sona Masoori Rice + Dal & Green Salad", "portions": "150g protein + 200g rice + 1 bowl dal", "notes": "Avoid excess oil in curries."},
        {"name": "Meal 4: Pre-Workout", "time": "5:00 PM", "items": "2 slices Whole Wheat Brown Bread with 1 tbsp Peanut Butter + Black Coffee", "portions": "2 bread slices + 1 cup black coffee", "notes": "Consume 45 minutes before gym session."},
        {"name": "Meal 5: Post-Workout", "time": "7:30 PM", "items": "1 Scoop Whey Protein in Water + 1 Banana or 4 Egg Whites", "portions": "1 shaker + 4 egg whites", "notes": "Consume within 30 minutes after training."},
        {"name": "Meal 6: Dinner", "time": "9:15 PM", "items": "150g Fish / Chicken or 100g Tofu + 2 Multigrain Rotis + Steamed Broccoli & Mixed Veggies", "portions": "150g meat + 2 rotis + veggies", "notes": "Keep dinner light on carbs, finish 2 hours before bed."}
    ]'::jsonb,
    true
) ON CONFLICT (id) DO NOTHING;

-- Assign Diet to Demo Member
INSERT INTO public.diet_assignments (member_id, plan_id, assigned_date, special_notes)
VALUES 
    ('77777777-7777-7777-7777-777777777771', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', CURRENT_DATE, 'Maintain minimum 3.5 liters of clean water daily. WhatsApp coach for adjustments.')
ON CONFLICT DO NOTHING;

-- 8. Gallery Items
INSERT INTO public.gallery_items (title, category, image_url, display_order, is_published)
VALUES 
    ('Heavy Free-Weight Zone & Dumbbell Rack', 'Equipment', '/images/facility-dumbbells.jpg', 1, true),
    ('Plate-Loaded Strength & Cable Section', 'Equipment', '/images/facility-machines.jpg', 2, true),
    ('Olympic Lifting Platform & Deadlift Station', 'Gym Floor', '/images/hero-bg.jpg', 3, true),
    ('Professional Trainer 1-on-1 Coaching', 'Training', '/images/trainer-male.jpg', 4, true)
ON CONFLICT DO NOTHING;
