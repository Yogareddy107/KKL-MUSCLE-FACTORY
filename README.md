# KKL Muscle Factory - Gym and Fitness Center

> **Tagline:** Gym and Fitness Center  
> **Headline:** Build Strength. Build Discipline.  
> **Location:** Petrol Bunk Back side, Bus stand, R.K, Main Rd, Koilkuntla, Andhra Pradesh 518134  
> **Contact / WhatsApp:** +91 9490862006  
> **Instagram:** [@muscle_factory_fitness_center](https://www.instagram.com/muscle_factory_fitness_center/)  
> **Google Maps:** [KKL Muscle Factory on Google Maps](https://www.google.com/maps/place/kkl+muscle+factory/data=!4m2!3m1!1s0x3bb447843490dd71:0xb933f80596f77482?sa=X&ved=1t:242&ictx=111)

---

## 🏋️‍♂️ Overview

**KKL Muscle Factory** is a complete, production-ready, mobile-first gym management and member fitness platform. Built using Next.js 15 (App Router), TypeScript, Tailwind CSS, Lucide icons, Turso Edge libSQL, and Supabase.

### ✨ Key Features
1. **Public Marketing Website**:
   - Hero banner with official **KKL Muscle Factory** logo badge, bold condensed athletic typography, and atmospheric bodybuilding visuals.
   - Dynamic **Membership Plans & Pricing** managed directly from the Admin desk (1 Month Starter, 3 Months Strength, 6 Months Transformation, 1 Year Elite VIP).
   - **Trainers Showcase** with certified coach bios, specializations, and real fitness photography.
   - **Facilities & Equipment Tour** highlighting heavy rubber-hex dumbbells up to 45kg+, Olympic platforms, and plate-loaded machines.
   - Filterable **Photo & Video Gallery** with modal zoom and category tags.
   - **Contact & Location Section** with verified Koilkuntla address, working contact form with real-time feedback, interactive map, and operating hours.
   - Clean navbar with Member Portal button (Admin button secretly hidden in footer as a subtle Dumbbell icon).
   - Attribution badge: **"Crafted by Intrasphere Labs"** linking to `https://intraspherelabs.vercel.app`.

2. **Admin Dashboard (Desk Suite)**:
   - **Quick PIN Login (`4321`)**: Instant, secure access requested by the gym owner (`ADMIN_PIN=4321`) at `/admin/login`.
   - **Live Overview**: Key metrics (Total Members, Active Memberships, Today's Attendance, Upcoming Expiries, New Enquiries).
   - **Instant Check-in Workflow**: Select active member, choose shift (Morning / Evening), and record attendance with duplicate check-in prevention.
   - **Member Management**: Enroll members with custom **Member IDs** (e.g. `KKL-1004`) and phone numbers. Only these registered IDs/numbers are accepted in the Member Portal!
   - **Trainer Manager**: Add and edit trainers with profile photo file uploads, certifications, and bios.
   - **Workout Routine Builder**: Create and edit routines with dynamic exercise list (sets, reps, rest periods, video demo link).
   - **Diet Management**: Create structured daily meal timelines with portion sizes, caloric/macro estimates, and upload diet sheets/photos.
   - **Media Gallery Manager**: Upload photos and videos directly with category filtering and instant previews.
   - **Enquiry Pipeline**: View submissions, update lead statuses (New, Contacted, Closed), and record follow-up notes.
   - **Gym Settings**: Dynamically update gym name, tagline, phone, address, WhatsApp, and operating hours.

3. **Member Self-Service Portal**:
   - One-click sign-in at `/member/login` using registered Member ID (e.g. `KKL-1001`) or phone number.
   - **My Diet Plan**: Structured daily meal schedule (Breakfast, Mid-Morning, Lunch, Pre-Workout, Post-Workout, Dinner) with food items, portion quantities, and printer-friendly view.
   - **Special Diet Plan via WhatsApp**: Visual "Need a Custom Diet Plan?" card with "Chat with Diet Planner on WhatsApp" button triggering prefilled message:  
     `Hi, I am an active member of KKL Muscle Factory. I would like to discuss a customized diet plan tailored to my fitness goals. Please let me know the next steps.`
   - **My Workout Routine**: Assigned split with sets, reps, rest intervals, and technique links.
   - **Attendance History**: Personal log of all checked-in training sessions.

---

## 🛠️ Hybrid Architecture: Turso Edge + Supabase + Local Resilience

The application implements a division of responsibilities:

### 1. ⚡ Turso libSQL (Edge Cloud Database)
- **Primary Operational Database**:
  - `gym_settings`
  - `membership_plans`
  - `trainers`
  - `members` (only registered IDs & phone numbers can enter Member Portal)
  - `workout_plans`
  - `diet_plans`
  - `gallery_items`
  - `enquiries` (leads captured from public website)
- **Key Advantage**: Sub-10ms query latency, zero cold-starts, high resilience across AWS Asia-Pacific edge.
- **Setup script**: Run `node scripts/setup-turso.js` to create all tables and populate initial seed data.

### 2. 🗄️ Supabase (PostgreSQL & Storage)
- **Primary Media & Asset Storage**:
  - Storage buckets (`gym-media`, `diet-sheets`, `trainer-photos`) for photo/video uploads and custom diet plan PDFs.
- **Authentication & PostgreSQL Sync**:
  - Built-in Supabase Auth and long-term PostgreSQL backups.
  - Schema file: `supabase/schema.sql` (15 tables with RLS policies).

### 3. 💾 Client-Side Resilient Cache (Local Storage)
- Guarantees instant 0ms UI responsiveness and offline continuity so gym administrators and athletes never experience frozen screens or downtime.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Populate `.env.local`:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://ongheyduancudpzoopxa.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Turso Database
TURSO_DATABASE_URL=libsql://kkl-muscle-factory-yogareddy107.aws-ap-south-1.turso.io
TURSO_AUTH_TOKEN=your-turso-token

# Admin PIN
ADMIN_PIN=4321
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Initialize Turso Database
```bash
node scripts/setup-turso.js
```

### 4. Start Development Server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the application.
