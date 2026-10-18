const { createClient } = require('@libsql/client');

const tursoUrl = 'libsql://kkl-muscle-factory-yogareddy107.aws-ap-south-1.turso.io';
const tursoAuthToken = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3OTIzMjk4MTgsImlkIjoiMDFhMTRmMjAtMGIwMS03NjliLWFjMjItNzMwNzMyZWI0NDZhIiwia2lkIjoia2Qwa191STYtSGtpNVA0anhhQ3FqdlRHdi1jZE9GYVltcjlHOFAtWkk4RSIsInJpZCI6IjM4MTM0NDUzLTAwY2QtNDE1Ny1hYjk4LTU1YmY3MTI4MDVlMiJ9.i-pN6FL8Dx2LOsm6ZnaaxDjRnl7gVSlbjHx2iIRAXikXbRS5Q56f-3C-Gjiwf0HoHgNxtI2ba_XKb1N9QjFgAA';

const client = createClient({
  url: tursoUrl,
  authToken: tursoAuthToken
});

async function main() {
  console.log('Connecting to Turso libSQL at:', tursoUrl);

  // 1. Create tables
  await client.execute(`
    CREATE TABLE IF NOT EXISTS gym_settings (
      id TEXT PRIMARY KEY,
      gym_name TEXT NOT NULL,
      tagline TEXT NOT NULL,
      headline TEXT NOT NULL,
      phone TEXT NOT NULL,
      whatsapp_number TEXT NOT NULL,
      email TEXT,
      address TEXT NOT NULL,
      map_url TEXT NOT NULL,
      instagram_url TEXT NOT NULL,
      opening_hours TEXT NOT NULL,
      logo_url TEXT,
      member_portal_enabled INTEGER DEFAULT 1,
      updated_at TEXT
    );
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS membership_plans (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      duration_months INTEGER NOT NULL,
      price REAL NOT NULL,
      description TEXT,
      benefits TEXT NOT NULL, -- JSON array
      is_popular INTEGER DEFAULT 0,
      is_published INTEGER DEFAULT 1,
      display_order INTEGER DEFAULT 1
    );
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS trainers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      specialization TEXT NOT NULL,
      experience TEXT NOT NULL,
      bio TEXT,
      photo_url TEXT,
      certifications TEXT NOT NULL, -- JSON array
      is_active INTEGER DEFAULT 1,
      display_order INTEGER DEFAULT 1
    );
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS members (
      id TEXT PRIMARY KEY,
      member_code TEXT UNIQUE NOT NULL,
      full_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT,
      gender TEXT,
      date_of_birth TEXT,
      emergency_contact TEXT,
      medical_notes TEXT,
      status TEXT DEFAULT 'active',
      join_date TEXT,
      current_plan_name TEXT,
      expiry_date TEXT,
      created_at TEXT
    );
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS attendance_records (
      id TEXT PRIMARY KEY,
      member_id TEXT NOT NULL,
      check_in_date TEXT NOT NULL,
      check_in_time TEXT NOT NULL,
      session_type TEXT NOT NULL,
      created_at TEXT
    );
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS workout_plans (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      difficulty TEXT NOT NULL,
      days_per_week INTEGER DEFAULT 4,
      is_published INTEGER DEFAULT 1,
      exercises TEXT NOT NULL -- JSON array
    );
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS diet_plans (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      goal TEXT NOT NULL,
      calories_target INTEGER,
      protein_grams INTEGER,
      carbs_grams INTEGER,
      fats_grams INTEGER,
      document_url TEXT,
      photo_url TEXT,
      description TEXT,
      meals TEXT NOT NULL -- JSON array
    );
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS gallery_items (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      media_type TEXT NOT NULL,
      url TEXT NOT NULL,
      created_at TEXT
    );
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS enquiries (
      id TEXT PRIMARY KEY,
      full_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT,
      interested_plan TEXT,
      message TEXT,
      status TEXT DEFAULT 'new',
      created_at TEXT
    );
  `);

  console.log('Tables created successfully in Turso.');

  // 2. Seed Initial Gym Settings
  await client.execute({
    sql: `INSERT OR REPLACE INTO gym_settings (
      id, gym_name, tagline, headline, phone, whatsapp_number, email, 
      address, map_url, instagram_url, opening_hours, logo_url, member_portal_enabled, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
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
      1,
      new Date().toISOString()
    ]
  });

  // Seed Membership Plans
  const plans = [
    {
      id: 'plan-1',
      name: '1 Month Starter',
      duration_months: 1,
      price: 1200,
      description: 'Ideal introduction to powerlifting and bodybuilding equipment.',
      benefits: JSON.stringify(['Full Gym Access (All Hours)', 'General Trainer Guidance', 'Locker & Changing Area', 'Free Water & Cardio Deck']),
      is_popular: 0,
      is_published: 1,
      display_order: 1
    },
    {
      id: 'plan-2',
      name: '3 Months Strength',
      duration_months: 3,
      price: 3200,
      description: 'Most popular for building consistent strength and progressive overload.',
      benefits: JSON.stringify(['Full Gym Access (All Hours)', 'Customized Workout Routine', 'Body Composition Tracking', 'Nutrition Guidelines', 'Locker Access']),
      is_popular: 1,
      is_published: 1,
      display_order: 2
    },
    {
      id: 'plan-3',
      name: '6 Months Transformation',
      duration_months: 6,
      price: 5800,
      description: 'Dedicated period for serious hypertrophy or radical body recomposition.',
      benefits: JSON.stringify(['Full Gym Access (All Hours)', 'Personalized Workout Plan', 'Tailored Diet Schedule', 'Monthly Progress Reviews', 'WhatsApp Coach Support']),
      is_popular: 0,
      is_published: 1,
      display_order: 3
    },
    {
      id: 'plan-4',
      name: '1 Year Elite VIP',
      duration_months: 12,
      price: 9999,
      description: 'Complete annual commitment with maximum savings and priority coaching.',
      benefits: JSON.stringify(['Unlimited Gym Access 365 Days', 'Dedicated Diet & Workout Plan', 'Periodic 1-on-1 Form Check', 'VIP Locker & Free Gym Kit Bag', 'Diet Plan WhatsApp Support']),
      is_popular: 0,
      is_published: 1,
      display_order: 4
    }
  ];

  for (const p of plans) {
    await client.execute({
      sql: `INSERT OR REPLACE INTO membership_plans (id, name, duration_months, price, description, benefits, is_popular, is_published, display_order)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [p.id, p.name, p.duration_months, p.price, p.description, p.benefits, p.is_popular, p.is_published, p.display_order]
    });
  }

  // Seed Trainers
  const trainers = [
    {
      id: 'trainer-1',
      name: 'Ramesh Kumar',
      specialization: 'Head Coach & Bodybuilding Specialist',
      experience: '10+ Years',
      bio: 'Specializes in competition prep, progressive overload, powerlifting, and muscle hypertrophy for all levels.',
      photo_url: '/images/trainer-male.jpg',
      certifications: JSON.stringify(['Certified Strength Coach', 'Advanced Hypertrophy Specialist', 'First Aid & CPR Certified']),
      is_active: 1,
      display_order: 1
    },
    {
      id: 'trainer-2',
      name: 'Pooja Reddy',
      specialization: 'Strength & Functional Fitness Specialist',
      experience: '6+ Years',
      bio: 'Passionate about helping athletes build lean strength, posture correction, and metabolic conditioning.',
      photo_url: '/images/trainer-female.jpg',
      certifications: JSON.stringify(['ACE Certified Personal Trainer', 'Functional Movement Specialist']),
      is_active: 1,
      display_order: 2
    }
  ];

  for (const t of trainers) {
    await client.execute({
      sql: `INSERT OR REPLACE INTO trainers (id, name, specialization, experience, bio, photo_url, certifications, is_active, display_order)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [t.id, t.name, t.specialization, t.experience, t.bio, t.photo_url, t.certifications, t.is_active, t.display_order]
    });
  }

  // Seed Members
  const members = [
    {
      id: 'mem-101',
      member_code: 'KKL-1001',
      full_name: 'Suresh Varma',
      phone: '9876543210',
      email: 'suresh@example.com',
      gender: 'Male',
      date_of_birth: '1996-05-14',
      emergency_contact: '9876543299',
      medical_notes: 'None. Cleared for heavy powerlifting.',
      status: 'active',
      join_date: '2025-01-15',
      current_plan_name: '3 Months Strength',
      expiry_date: '2026-11-20',
      created_at: new Date().toISOString()
    },
    {
      id: 'mem-102',
      member_code: 'KKL-1002',
      full_name: 'Kiran Patel',
      phone: '9876543211',
      email: 'kiran@example.com',
      gender: 'Male',
      date_of_birth: '1998-09-22',
      emergency_contact: '9876543288',
      medical_notes: 'None',
      status: 'active',
      join_date: '2025-02-01',
      current_plan_name: '6 Months Transformation',
      expiry_date: '2026-12-15',
      created_at: new Date().toISOString()
    },
    {
      id: 'mem-103',
      member_code: 'KKL-1003',
      full_name: 'Anitha Devi',
      phone: '9876543212',
      email: 'anitha@example.com',
      gender: 'Female',
      date_of_birth: '2000-03-10',
      emergency_contact: '9876543277',
      medical_notes: 'None',
      status: 'active',
      join_date: '2025-03-01',
      current_plan_name: '1 Month Starter',
      expiry_date: '2026-10-31',
      created_at: new Date().toISOString()
    }
  ];

  for (const m of members) {
    await client.execute({
      sql: `INSERT OR REPLACE INTO members (id, member_code, full_name, phone, email, gender, date_of_birth, emergency_contact, medical_notes, status, join_date, current_plan_name, expiry_date, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [m.id, m.member_code, m.full_name, m.phone, m.email, m.gender, m.date_of_birth, m.emergency_contact, m.medical_notes, m.status, m.join_date, m.current_plan_name, m.expiry_date, m.created_at]
    });
  }

  // Seed Workout Plans
  const workout1 = {
    id: 'workout-1',
    title: 'Hypertrophy 4-Day Muscle Builder',
    description: 'Designed to maximize muscle size and strength using high intensity compound and isolation movements.',
    difficulty: 'Intermediate',
    days_per_week: 4,
    is_published: 1,
    exercises: JSON.stringify([
      {
        id: 'ex-1',
        plan_id: 'workout-1',
        day_name: 'Day 1: Chest & Triceps',
        exercise_name: 'Flat Barbell Bench Press',
        sets: 4,
        reps: '8-10',
        rest_seconds: 90,
        instructions: 'Retract scapula, lower bar with control to mid-chest, press upwards explosively.',
        demo_url: 'https://www.youtube.com/watch?v=rT7DgCr-3pg',
        display_order: 1
      },
      {
        id: 'ex-2',
        plan_id: 'workout-1',
        day_name: 'Day 1: Chest & Triceps',
        exercise_name: 'Incline Dumbbell Press',
        sets: 3,
        reps: '10-12',
        rest_seconds: 75,
        instructions: 'Bench angle 30-45 degrees. Focus on upper chest stretch and contraction.',
        display_order: 2
      },
      {
        id: 'ex-3',
        plan_id: 'workout-1',
        day_name: 'Day 2: Back & Biceps',
        exercise_name: 'Conventional Deadlift',
        sets: 4,
        reps: '5-6',
        rest_seconds: 120,
        instructions: 'Keep back flat, brace core, drive through heels and lock out hips.',
        display_order: 3
      }
    ])
  };

  await client.execute({
    sql: `INSERT OR REPLACE INTO workout_plans (id, title, description, difficulty, days_per_week, is_published, exercises)
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
    args: [workout1.id, workout1.title, workout1.description, workout1.difficulty, workout1.days_per_week, workout1.is_published, workout1.exercises]
  });

  // Seed Diet Plans
  const diet1 = {
    id: 'diet-1',
    title: 'High Protein Muscle Gain Protocol',
    goal: 'Hypertrophy & Clean Bulking',
    calories_target: 2800,
    protein_grams: 175,
    carbs_grams: 320,
    fats_grams: 65,
    document_url: '',
    photo_url: '',
    description: 'Calculated nutritional strategy designed to support intense weightlifting sessions, optimize glycogen stores, and promote rapid muscle repair without excessive body fat accumulation.',
    meals: JSON.stringify([
      {
        id: 'meal-1',
        diet_plan_id: 'diet-1',
        meal_name: 'Meal 1 - Pre-Workout Energy (7:00 AM)',
        timing: '7:00 AM',
        foods: '6 egg whites + 2 whole boiled eggs, 80g rolled oats with 1 chopped banana, 15 almonds, black coffee or green tea.',
        calories: 620,
        protein_g: 42,
        carbs_g: 78,
        fats_g: 14,
        notes: 'Eat 60-90 minutes before your morning workout.'
      },
      {
        id: 'meal-2',
        diet_plan_id: 'diet-1',
        meal_name: 'Meal 2 - Post-Workout Recovery (10:00 AM)',
        timing: '10:00 AM',
        foods: '1 scoop Whey Protein in 250ml water, 2 slices whole wheat bread with 1 tbsp peanut butter.',
        calories: 380,
        protein_g: 34,
        carbs_g: 38,
        fats_g: 10,
        notes: 'Consume within 30 minutes of finishing training.'
      },
      {
        id: 'meal-3',
        diet_plan_id: 'diet-1',
        meal_name: 'Meal 3 - High Power Lunch (1:30 PM)',
        timing: '1:30 PM',
        foods: '200g grilled chicken breast (or 200g paneer/tofu), 1.5 cups brown or white rice, 1 bowl dal, mixed vegetable green salad.',
        calories: 780,
        protein_g: 54,
        carbs_g: 92,
        fats_g: 18,
        notes: 'Drink plenty of water with your meal.'
      }
    ])
  };

  await client.execute({
    sql: `INSERT OR REPLACE INTO diet_plans (id, title, goal, calories_target, protein_grams, carbs_grams, fats_grams, document_url, photo_url, description, meals)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [diet1.id, diet1.title, diet1.goal, diet1.calories_target, diet1.protein_grams, diet1.carbs_grams, diet1.fats_grams, diet1.document_url, diet1.photo_url, diet1.description, diet1.meals]
  });

  // Seed Gallery Items
  const gallery = [
    {
      id: 'gal-1',
      title: 'Heavy Dumbbell Strength Deck',
      category: 'equipment',
      media_type: 'photo',
      url: '/images/facility-dumbbells.jpg',
      created_at: new Date().toISOString()
    },
    {
      id: 'gal-2',
      title: 'Biomechanic Machine Circuit',
      category: 'equipment',
      media_type: 'photo',
      url: '/images/facility-machines.jpg',
      created_at: new Date().toISOString()
    },
    {
      id: 'gal-3',
      title: 'Iron Powerlifting Arena',
      category: 'gym',
      media_type: 'photo',
      url: '/images/hero-bg.jpg',
      created_at: new Date().toISOString()
    }
  ];

  for (const g of gallery) {
    await client.execute({
      sql: `INSERT OR REPLACE INTO gallery_items (id, title, category, media_type, url, created_at)
            VALUES (?, ?, ?, ?, ?, ?)`,
      args: [g.id, g.title, g.category, g.media_type, g.url, g.created_at]
    });
  }

  console.log('Turso Database has been initialized and seeded with all KKL Muscle Factory data!');

  const tables = await client.execute("SELECT name FROM sqlite_schema WHERE type='table'");
  console.log('Active tables in Turso:', tables.rows.map(r => r.name));
}

main().catch(err => {
  console.error('Turso setup error:', err);
  process.exit(1);
});
