'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Users, CalendarCheck, CreditCard, Dumbbell, Apple, 
  MessageSquare, Image as ImageIcon, Settings, LogOut, 
  Search, Plus, Check, X, AlertCircle, Edit, Trash2, 
  ChevronRight, ExternalLink, Shield, RefreshCw, Eye, 
  Phone, UserCheck, Flame, ArrowUpRight, Upload, Video,
  Sparkles, Percent, MessageCircle
} from 'lucide-react';
import { 
  getGymSettings, updateGymSettings, getMembers, saveMember, 
  toggleMemberStatus, getMembershipPlans, saveMembershipPlan, 
  deleteMembershipPlan, getTrainers, saveTrainer, deleteTrainer, 
  getAttendance, recordAttendance, getWorkoutPlans, saveWorkoutPlan, 
  deleteWorkoutPlan, assignWorkoutPlanToMember, getDietPlans, saveDietPlan, 
  deleteDietPlan, assignDietPlanToMember, getEnquiries, updateEnquiryStatus, 
  getGalleryItems, saveGalleryItem, deleteGalleryItem, getDashboardMetrics, 
  getSpecialOffer, saveSpecialOffer,
  DashboardMetrics 
} from '@/lib/store';
import { 
  GymSettings, Member, MembershipPlan, Trainer, 
  AttendanceRecord, WorkoutPlan, DietPlan, Enquiry, GalleryItem, Exercise, DietMeal, SpecialOffer 
} from '@/types';
import { isAdminAuthenticated, adminLogout } from '@/lib/auth';

type AdminTab = 
  | 'overview' 
  | 'members' 
  | 'attendance' 
  | 'plans' 
  | 'trainers' 
  | 'workouts' 
  | 'diets' 
  | 'enquiries' 
  | 'gallery' 
  | 'offer'
  | 'settings';


export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);

  // Core Data States
  const [settings, setSettings] = useState<GymSettings | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [workouts, setWorkouts] = useState<WorkoutPlan[]>([]);
  const [diets, setDiets] = useState<DietPlan[]>([]);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [offer, setOffer] = useState<SpecialOffer | null>(null);
  const [offerImagePreview, setOfferImagePreview] = useState<string>('');

  // Search & Filter States
  const [memberSearch, setMemberSearch] = useState('');
  const [attendanceMemberId, setAttendanceMemberId] = useState('');
  const [attendanceSession, setAttendanceSession] = useState<'Morning' | 'Evening' | 'General'>('General');
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Member Modal States
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);

  // Plan Modal States
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<MembershipPlan | null>(null);

  // Trainer Modal States
  const [showTrainerModal, setShowTrainerModal] = useState(false);
  const [editingTrainer, setEditingTrainer] = useState<Trainer | null>(null);
  const [trainerPhotoPreview, setTrainerPhotoPreview] = useState<string>('');

  // Workout Modal States
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState<WorkoutPlan | null>(null);
  const [workoutExercises, setWorkoutExercises] = useState<Exercise[]>([]);

  // Diet Modal States
  const [showDietModal, setShowDietModal] = useState(false);
  const [editingDiet, setEditingDiet] = useState<DietPlan | null>(null);
  const [dietMeals, setDietMeals] = useState<DietMeal[]>([]);
  const [dietDocPreview, setDietDocPreview] = useState<string>('');

  // Gallery Modal States
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [galleryMediaPreview, setGalleryMediaPreview] = useState<string>('');

  // Assignment Modal States
  const [showDietAssignModal, setShowDietAssignModal] = useState(false);
  const [selectedMemberForDiet, setSelectedMemberForDiet] = useState<Member | null>(null);
  const [selectedDietPlanId, setSelectedDietPlanId] = useState('');
  const [dietAssignNotes, setDietAssignNotes] = useState('');
  const [showWorkoutAssignModal, setShowWorkoutAssignModal] = useState(false);
  const [selectedMemberForWorkout, setSelectedMemberForWorkout] = useState<Member | null>(null);
  const [selectedWorkoutPlanId, setSelectedWorkoutPlanId] = useState('');

  // Authentication Guard
  useEffect(() => {
    if (!isAdminAuthenticated()) {
      router.push('/admin/login');
      return;
    }
    loadAllData(true);

    const handleSync = () => {
      if (document.visibilityState === 'visible') {
        loadAllData(false);
      }
    };
    window.addEventListener('visibilitychange', handleSync);
    window.addEventListener('focus', handleSync);

    // Auto-poll in background every 15s to keep dashboard synchronized across devices
    const interval = setInterval(() => {
      loadAllData(false);
    }, 15000);

    return () => {
      window.removeEventListener('visibilitychange', handleSync);
      window.removeEventListener('focus', handleSync);
      clearInterval(interval);
    };
  }, [router]);

  const loadAllData = async (showLoading: boolean = true) => {
    if (showLoading) setLoading(true);
    try {
      const [
        dashMetrics,
        gymSettings,
        membersList,
        plansList,
        trainersList,
        attendanceList,
        workoutList,
        dietList,
        enquiryList,
        galleryList,
        activeOffer,
      ] = await Promise.all([
        getDashboardMetrics(),
        getGymSettings(),
        getMembers(),
        getMembershipPlans(),
        getTrainers(),
        getAttendance(),
        getWorkoutPlans(),
        getDietPlans(),
        getEnquiries(),
        getGalleryItems(),
        getSpecialOffer(),
      ]);

      setMetrics(dashMetrics);
      setSettings(gymSettings);
      setMembers(membersList);
      setPlans(plansList);
      setTrainers(trainersList);
      setAttendance(attendanceList);
      setWorkouts(workoutList);
      setDiets(dietList);
      setEnquiries(enquiryList);
      setGallery(galleryList);
      setOffer(activeOffer);
      if (activeOffer?.image_url && !offerImagePreview) {
        setOfferImagePreview(activeOffer.image_url);
      }
    } catch (e) {
      console.error('Failed to load dashboard data', e);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const notify = (text: string, type: 'success' | 'error' = 'success') => {
    setActionMessage({ text, type });
    setTimeout(() => setActionMessage(null), 4000);
  };

  const handleLogout = () => {
    adminLogout();
    router.push('/admin/login');
  };

  // Helper for reading uploaded file to data URL with automatic client-side canvas HD compression
  const handleFileUploadToDataURL = (file: File, callback: (url: string) => void) => {
    if (!file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') callback(reader.result);
      };
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new (window as any).Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        const maxDim = 900;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          callback(e.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL('image/jpeg', 0.78);
        callback(compressed);
      };
      img.onerror = () => {
        callback(e.target?.result as string);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };


  // Quick Attendance Check-in
  const handleRecordAttendance = async () => {
    if (!attendanceMemberId) {
      notify('Please select a member to check in.', 'error');
      return;
    }
    const result = await recordAttendance(attendanceMemberId, attendanceSession);
    if (result.success) {
      notify(result.message, 'success');
      const updatedAttendance = await getAttendance();
      const updatedMetrics = await getDashboardMetrics();
      setAttendance(updatedAttendance);
      setMetrics(updatedMetrics);
      setAttendanceMemberId('');
    } else {
      notify(result.message, 'error');
    }
  };

  // Toggle Member Status
  const handleToggleMember = async (id: string) => {
    const updated = await toggleMemberStatus(id);
    setMembers(updated);
    const updatedMetrics = await getDashboardMetrics();
    setMetrics(updatedMetrics);
    notify('Member status updated successfully.');
  };

  // Save/Create Member
  const handleSaveMemberSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const full_name = formData.get('full_name') as string;
    const member_code = (formData.get('member_code') as string) || (editingMember ? editingMember.member_code : `KKL-${1000 + members.length + 1}`);
    const phone = formData.get('phone') as string;
    const email = (formData.get('email') as string) || undefined;
    const gender = formData.get('gender') as Member['gender'];
    const emergency_contact = (formData.get('emergency_contact') as string) || undefined;
    const current_plan_name = formData.get('current_plan_name') as string;
    const expiry_date = formData.get('expiry_date') as string;
    const status = formData.get('status') as Member['status'];

    if (!full_name || !phone) {
      notify('Full name and phone are required.', 'error');
      return;
    }

    const memberToSave: Member = {
      id: editingMember ? editingMember.id : 'mem-' + Date.now(),
      member_code: member_code.trim().toUpperCase(),
      full_name: full_name.trim(),
      phone: phone.trim(),
      email,
      gender: gender || 'Male',
      emergency_contact,
      status: status || 'active',
      join_date: editingMember ? editingMember.join_date : new Date().toISOString().split('T')[0],
      current_plan_name: current_plan_name || '3 Months Strength',
      expiry_date: expiry_date || new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
    };

    const updated = await saveMember(memberToSave);
    setMembers(updated);
    const updatedMetrics = await getDashboardMetrics();
    setMetrics(updatedMetrics);
    setShowMemberModal(false);
    setEditingMember(null);
    if ((updated as any).cloudSynced) {
      notify(`✅ Member ${memberToSave.full_name} (${memberToSave.member_code}) saved & live synced across all devices!`, 'success');
    } else {
      notify(`⚠️ Cloud sync error: ${(updated as any).error || 'offline'}.`, 'error');
    }
  };

  // Save/Create Plan
  const handleSavePlanSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const name = formData.get('name') as string;
    const duration_months = parseInt(formData.get('duration_months') as string, 10);
    const price = parseFloat(formData.get('price') as string);
    const description = formData.get('description') as string;
    const benefitsRaw = formData.get('benefits') as string;
    const is_popular = formData.get('is_popular') === 'on';
    const is_published = formData.get('is_published') === 'on';

    const benefits = benefitsRaw
      ? benefitsRaw.split('\n').map(b => b.trim()).filter(Boolean)
      : ['Full Gym Access', 'General Coaching'];

    const planToSave: MembershipPlan = {
      id: editingPlan ? editingPlan.id : 'plan-' + Date.now(),
      name,
      duration_months: duration_months || 1,
      price: price || 1200,
      description,
      benefits,
      is_popular,
      is_published,
      display_order: editingPlan ? editingPlan.display_order : plans.length + 1,
    };

    const updated = await saveMembershipPlan(planToSave);
    setPlans(updated);
    setShowPlanModal(false);
    setEditingPlan(null);
    if ((updated as any).cloudSynced) {
      notify('✅ Membership plan saved & live synced across all devices!', 'success');
    } else {
      notify(`⚠️ Cloud sync error: ${(updated as any).error || 'offline'}.`, 'error');
    }
  };

  // Save/Create Trainer
  const handleSaveTrainerSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const name = formData.get('name') as string;
    const specialization = formData.get('specialization') as string;
    const experience = formData.get('experience') as string;
    const bio = formData.get('bio') as string;
    const photo_url = trainerPhotoPreview || (formData.get('photo_url') as string) || editingTrainer?.photo_url || '/images/trainer-male.jpg';
    const certificationsRaw = formData.get('certifications') as string;
    const is_active = formData.get('is_active') === 'on';

    const certifications = certificationsRaw
      ? certificationsRaw.split('\n').map(c => c.trim()).filter(Boolean)
      : ['Certified Coach'];

    const trainerToSave: Trainer = {
      id: editingTrainer ? editingTrainer.id : 'trainer-' + Date.now(),
      name,
      specialization,
      experience,
      bio,
      photo_url,
      certifications,
      is_active,
      display_order: editingTrainer ? editingTrainer.display_order : trainers.length + 1,
    };

    const updated = await saveTrainer(trainerToSave);
    setTrainers(updated);
    setShowTrainerModal(false);
    setEditingTrainer(null);
    setTrainerPhotoPreview('');
    if ((updated as any).cloudSynced) {
      notify('✅ Trainer profile saved & live synced across all devices!', 'success');
    } else {
      notify(`⚠️ Cloud sync error: ${(updated as any).error || 'offline'}.`, 'error');
    }
  };

  // Save/Create Workout Plan
  const handleSaveWorkoutSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const title = formData.get('title') as string;
    const difficulty = formData.get('difficulty') as WorkoutPlan['difficulty'];
    const days_per_week = parseInt(formData.get('days_per_week') as string, 10) || 4;
    const description = formData.get('description') as string;

    const planToSave: WorkoutPlan = {
      id: editingWorkout ? editingWorkout.id : 'workout-' + Date.now(),
      title,
      difficulty,
      days_per_week,
      description,
      is_published: true,
      exercises: workoutExercises.length > 0 ? workoutExercises : [
        {
          id: 'ex-' + Date.now(),
          plan_id: editingWorkout ? editingWorkout.id : 'workout-' + Date.now(),
          day_name: 'Day 1: Chest & Triceps',
          exercise_name: 'Flat Barbell Bench Press',
          sets: 4,
          reps: '8-10',
          rest_seconds: 90,
          instructions: 'Retract scapula, lower bar with control to mid-chest, press upwards.',
          demo_url: 'https://www.youtube.com/watch?v=rT7DgCr-3pg',
          display_order: 1,
        }
      ],
    };

    const updated = await saveWorkoutPlan(planToSave);
    setWorkouts(updated);
    setShowWorkoutModal(false);
    setEditingWorkout(null);
    setWorkoutExercises([]);
    if ((updated as any).cloudSynced) {
      notify('✅ Workout routine saved & live synced across all devices!', 'success');
    } else {
      notify(`⚠️ Cloud sync error: ${(updated as any).error || 'offline'}.`, 'error');
    }
  };

  // Save/Create Diet Plan
  const handleSaveDietSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const title = formData.get('title') as string;
    const goal = formData.get('goal') as DietPlan['goal'];
    const dietary_preference = formData.get('dietary_preference') as DietPlan['dietary_preference'];
    const calories_est = parseInt(formData.get('calories_est') as string, 10) || 2500;
    const protein_g = parseInt(formData.get('protein_g') as string, 10) || 160;
    const carbs_g = parseInt(formData.get('carbs_g') as string, 10) || 280;
    const fats_g = parseInt(formData.get('fats_g') as string, 10) || 60;
    const description = formData.get('description') as string;
    const document_url = dietDocPreview || (formData.get('document_url') as string) || editingDiet?.document_url;

    const defaultMeals: DietMeal[] = [
      { name: 'Meal 1: Breakfast', time: '7:30 AM', items: '4 Boiled Eggs + 80g Oats with Banana', portions: '1 bowl oats + 4 eggs', notes: 'Drink 500ml water upon waking.' },
      { name: 'Meal 2: Mid-Morning', time: '11:00 AM', items: '1 Seasonal Fruit + 20g Almonds', portions: '1 fruit + 10 almonds', notes: 'Healthy monounsaturated fats.' },
      { name: 'Meal 3: Lunch', time: '1:30 PM', items: '150g Chicken/Paneer + Rice + Dal & Salad', portions: '150g protein + 1.5 cup rice', notes: 'Avoid heavy oils in curry.' },
      { name: 'Meal 4: Pre-Workout', time: '5:00 PM', items: '2 Brown Bread slices with Peanut Butter + Black Coffee', portions: '2 bread slices + coffee', notes: '45 mins before training.' },
      { name: 'Meal 5: Post-Workout', time: '7:30 PM', items: '1 Scoop Whey Protein + 1 Banana', portions: '1 shake + 1 fruit', notes: 'Immediate protein synthesis.' },
      { name: 'Meal 6: Dinner', time: '9:15 PM', items: '100g Grilled Paneer/Chicken + 2 Rotis + Green Veggies', portions: '100g protein + 2 rotis', notes: 'Finish 1.5h before sleep.' },
    ];

    const planToSave: DietPlan = {
      id: editingDiet ? editingDiet.id : 'diet-' + Date.now(),
      title,
      goal,
      dietary_preference,
      calories_est,
      protein_g,
      carbs_g,
      fats_g,
      description,
      document_url,
      meals: dietMeals.length > 0 ? dietMeals : defaultMeals,
      is_published: true,
    };

    const updated = await saveDietPlan(planToSave);
    setDiets(updated);
    setShowDietModal(false);
    setEditingDiet(null);
    setDietMeals([]);
    setDietDocPreview('');
    if ((updated as any).cloudSynced) {
      notify('✅ Diet plan saved & live synced across all devices!', 'success');
    } else {
      notify(`⚠️ Cloud sync error: ${(updated as any).error || 'offline'}.`, 'error');
    }
  };

  // Save Gallery / Media Item
  const handleSaveGallerySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const title = formData.get('title') as string;
    const category = formData.get('category') as GalleryItem['category'];
    const image_url = galleryMediaPreview || (formData.get('image_url') as string);

    if (!title || !image_url) {
      notify('Please provide a title and media file/URL.', 'error');
      return;
    }

    const itemToSave: GalleryItem = {
      id: 'gal-' + Date.now(),
      title,
      category: category || 'Equipment',
      image_url,
      display_order: gallery.length + 1,
      is_published: true,
    };

    const updated = await saveGalleryItem(itemToSave);
    setGallery(updated);
    setShowGalleryModal(false);
    setGalleryMediaPreview('');
    if ((updated as any).cloudSynced) {
      notify('✅ Media saved & live synced across all devices!', 'success');
    } else {
      notify(`⚠️ Cloud sync error: ${(updated as any).error || 'offline'}.`, 'error');
    }
  };

  // Assign Diet Plan Action
  const handleAssignDiet = async () => {
    if (!selectedMemberForDiet || !selectedDietPlanId) {
      notify('Please select a diet plan.', 'error');
      return;
    }
    await assignDietPlanToMember(selectedMemberForDiet.id, selectedDietPlanId, dietAssignNotes);
    notify(`Diet plan assigned to ${selectedMemberForDiet.full_name}.`);
    setShowDietAssignModal(false);
    setSelectedMemberForDiet(null);
    setSelectedDietPlanId('');
    setDietAssignNotes('');
  };

  // Assign Workout Plan Action
  const handleAssignWorkout = async () => {
    if (!selectedMemberForWorkout || !selectedWorkoutPlanId) {
      notify('Please select a workout plan.', 'error');
      return;
    }
    await assignWorkoutPlanToMember(selectedMemberForWorkout.id, selectedWorkoutPlanId);
    notify(`Workout routine assigned to ${selectedMemberForWorkout.full_name}.`);
    setShowWorkoutAssignModal(false);
    setSelectedMemberForWorkout(null);
    setSelectedWorkoutPlanId('');
  };

  // Save Gym Settings
  const handleSaveSettings = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const updated = await updateGymSettings({
      gym_name: formData.get('gym_name') as string,
      tagline: formData.get('tagline') as string,
      headline: formData.get('headline') as string,
      phone: formData.get('phone') as string,
      whatsapp_number: formData.get('whatsapp_number') as string,
      email: formData.get('email') as string,
      address: formData.get('address') as string,
      map_url: formData.get('map_url') as string,
      instagram_url: formData.get('instagram_url') as string,
      opening_hours: formData.get('opening_hours') as string,
      member_portal_enabled: formData.get('member_portal_enabled') === 'on',
    });

    setSettings(updated);
    if ((updated as any).cloudSynced) {
      notify('✅ Gym settings saved & live synced across all devices!', 'success');
    } else {
      notify(`⚠️ Cloud sync error: ${(updated as any).error || 'offline'}.`, 'error');
    }
  };

  // Save / Update Special Offer Popup
  const handleSaveOfferSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const title = formData.get('title') as string;
    const badge = formData.get('badge') as string;
    const description = formData.get('description') as string;
    const image_url = offerImagePreview || (formData.get('image_url') as string) || '/images/hero-bg.jpg';
    const cta_text = formData.get('cta_text') as string;
    const cta_link = formData.get('cta_link') as string;
    const is_active = formData.get('is_active') === 'on';

    const offerToSave: SpecialOffer = {
      id: 'active-offer',
      title: title.trim(),
      badge: badge.trim(),
      description: description.trim(),
      image_url,
      cta_text: cta_text.trim(),
      cta_link: cta_link.trim(),
      is_active,
    };

    const updated = await saveSpecialOffer(offerToSave);
    setOffer(updated);
    if ((updated as any).cloudSynced) {
      notify('✅ Special Offer popup saved & live synced across all devices!', 'success');
    } else {
      notify(`⚠️ Cloud sync error: ${(updated as any).error || 'offline'}.`, 'error');
    }
  };

  const filteredMembers = members.filter(m => 
    m.full_name.toLowerCase().includes(memberSearch.toLowerCase()) ||
    m.member_code.toLowerCase().includes(memberSearch.toLowerCase()) ||
    m.phone.includes(memberSearch)
  );

  return (
    <div className="min-h-screen bg-brand-dark flex flex-col md:flex-row text-brand-cream">
      {/* Toast Notification */}
      {actionMessage && (
        <div className={`fixed top-5 right-5 z-50 p-4 rounded-xl shadow-2xl flex items-center gap-3 border text-xs font-semibold animate-in fade-in slide-in-from-top-4 ${
          actionMessage.type === 'success' 
            ? 'bg-emerald-950 border-emerald-700 text-emerald-200' 
            : 'bg-red-950 border-red-700 text-red-200'
        }`}>
          {actionMessage.type === 'success' ? <Check className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-red-400" />}
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* DASHBOARD SIDEBAR */}
      <aside className="w-full md:w-64 bg-brand-surface border-r border-brand-border flex flex-col justify-between shrink-0">
        <div>
          {/* Logo Brand Header */}
          <div className="p-5 border-b border-brand-border/70 flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-lg bg-brand-dark p-1 border border-brand-border shrink-0">
              <Image
                src="/logo.png"
                alt="KKL Muscle Factory Logo"
                fill
                priority
                className="object-contain"
              />
            </div>
            <div className="overflow-hidden">
              <h2 className="font-heading text-base font-bold uppercase tracking-wider text-brand-cream truncate">
                KKL MUSCLE FACTORY
              </h2>
              <span className="text-[10px] text-brand-gold font-bold uppercase tracking-widest block">
                Admin Control Desk
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {[
              { id: 'overview', label: 'Overview', icon: Shield },
              { id: 'members', label: 'Members', icon: Users, badge: members.length },
              { id: 'attendance', label: 'Daily Attendance', icon: CalendarCheck, badge: metrics?.todayAttendance },
              { id: 'plans', label: 'Membership Plans', icon: CreditCard },
              { id: 'trainers', label: 'Trainers', icon: UserCheck },
              { id: 'workouts', label: 'Workout Plans', icon: Dumbbell },
              { id: 'diets', label: 'Diet Management', icon: Apple },
              { id: 'enquiries', label: 'Enquiries', icon: MessageSquare, badge: metrics?.newEnquiries },
              { id: 'gallery', label: 'Gallery & Media', icon: ImageIcon },
              { id: 'offer', label: 'Offer Popup', icon: Flame, badge: offer?.is_active ? 'LIVE' : undefined },
              { id: 'settings', label: 'Gym Settings', icon: Settings },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as AdminTab)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                    isActive
                      ? 'bg-gold-gradient text-brand-dark shadow-gold-sm'
                      : 'text-brand-muted hover:text-brand-cream hover:bg-brand-elevated'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{tab.label}</span>
                  </div>
                  {tab.badge !== undefined && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                      isActive ? 'bg-brand-dark text-brand-gold' : 'bg-brand-gold/20 text-brand-gold'
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer CTAs */}
        <div className="p-4 border-t border-brand-border/70 space-y-2">
          <Link
            href="/"
            target="_blank"
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-brand-border bg-brand-elevated hover:border-brand-gold/40 text-xs font-semibold text-brand-cream transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 text-brand-gold" />
            <span>View Public Website</span>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-red-900/40 bg-red-950/20 hover:bg-red-900/40 text-xs font-semibold text-red-300 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* MAIN DASHBOARD CONTENT AREA */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        {/* Top Header Bar */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-brand-border">
          <div>
            <h1 className="font-heading text-2xl sm:text-3xl font-black uppercase tracking-wide text-brand-cream">
              {activeTab === 'overview' && 'Gym Overview & Metrics'}
              {activeTab === 'members' && 'Member Directory & Management'}
              {activeTab === 'attendance' && 'Daily Attendance & Check-in'}
              {activeTab === 'plans' && 'Membership Pricing & Plans'}
              {activeTab === 'trainers' && 'Certified Trainers & Staff'}
              {activeTab === 'workouts' && 'Workout Routines & Exercise Splits'}
              {activeTab === 'diets' && 'Diet Plans & Member Assignments'}
              {activeTab === 'enquiries' && 'Public Enquiries & Lead Pipeline'}
              {activeTab === 'gallery' && 'Photo Gallery & Media Manager'}
              {activeTab === 'offer' && 'Website Offer Popup & Promo Manager'}
              {activeTab === 'settings' && 'Gym Profile & Operational Settings'}
            </h1>
            <p className="text-xs text-brand-muted mt-1">
              KKL Muscle Factory &bull; Full CRUD Administrator Suite
            </p>
          </div>


          <div className="flex items-center gap-3">
            <a
              href="https://intraspherelabs.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-surface border border-brand-gold/30 text-[11px] font-bold text-brand-gold hover:text-brand-cream transition-colors"
            >
              <span>Intrasphere Labs</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            <button
              onClick={() => loadAllData(true)}
              className="p-2.5 rounded-xl border border-brand-border bg-brand-surface hover:border-brand-gold/50 text-brand-muted hover:text-brand-gold transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </header>

        {/* ------------------------------------------------------------------- */}
        {/* TAB 1: OVERVIEW */}
        {/* ------------------------------------------------------------------- */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Quick Attendance Check-in Bar */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-brand-surface via-brand-elevated to-brand-surface border border-brand-border-gold shadow-gold-sm">
              <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-gold-gradient text-brand-dark shrink-0">
                    <CalendarCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-heading text-lg font-bold uppercase text-brand-cream">
                      Instant Member Check-In
                    </h3>
                    <p className="text-xs text-brand-muted">
                      Search active member and log today&apos;s workout session.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <select
                    value={attendanceMemberId}
                    onChange={(e) => setAttendanceMemberId(e.target.value)}
                    className="w-full sm:w-64 px-3.5 py-2.5 rounded-xl bg-brand-dark border border-brand-border text-brand-cream text-xs outline-none focus:border-brand-gold"
                  >
                    <option value="">-- Select Member --</option>
                    {members.filter(m => m.status === 'active').map(m => (
                      <option key={m.id} value={m.id}>
                        {m.member_code} - {m.full_name} ({m.phone})
                      </option>
                    ))}
                  </select>

                  <select
                    value={attendanceSession}
                    onChange={(e) => setAttendanceSession(e.target.value as any)}
                    className="w-full sm:w-36 px-3.5 py-2.5 rounded-xl bg-brand-dark border border-brand-border text-brand-cream text-xs outline-none focus:border-brand-gold"
                  >
                    <option value="Morning">Morning Session</option>
                    <option value="Evening">Evening Session</option>
                    <option value="General">General</option>
                  </select>

                  <button
                    onClick={handleRecordAttendance}
                    id="btn-quick-checkin"
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gold-gradient hover:opacity-95 text-brand-dark font-extrabold text-xs uppercase tracking-wider transition-all whitespace-nowrap shadow-gold-sm"
                  >
                    Check In
                  </button>
                </div>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="p-5 rounded-2xl bg-brand-surface border border-brand-border">
                <span className="text-[11px] font-bold uppercase tracking-wider text-brand-muted block">
                  Total Enrolled
                </span>
                <p className="font-heading text-3xl font-black text-brand-cream mt-2">
                  {metrics?.totalMembers || 0}
                </p>
                <span className="text-[10px] text-brand-gold font-semibold mt-1 block">
                  All-time members
                </span>
              </div>

              <div className="p-5 rounded-2xl bg-brand-surface border border-brand-border">
                <span className="text-[11px] font-bold uppercase tracking-wider text-brand-muted block">
                  Active Memberships
                </span>
                <p className="font-heading text-3xl font-black text-emerald-400 mt-2">
                  {metrics?.activeMemberships || 0}
                </p>
                <span className="text-[10px] text-emerald-400/80 font-semibold mt-1 block">
                  Valid subscription
                </span>
              </div>

              <div className="p-5 rounded-2xl bg-brand-surface border border-brand-border">
                <span className="text-[11px] font-bold uppercase tracking-wider text-brand-muted block">
                  Today&apos;s Attendance
                </span>
                <p className="font-heading text-3xl font-black text-brand-gold mt-2">
                  {metrics?.todayAttendance || 0}
                </p>
                <span className="text-[10px] text-brand-gold/80 font-semibold mt-1 block">
                  Checked in today
                </span>
              </div>

              <div className="p-5 rounded-2xl bg-brand-surface border border-brand-border">
                <span className="text-[11px] font-bold uppercase tracking-wider text-brand-muted block">
                  Upcoming Expiries
                </span>
                <p className="font-heading text-3xl font-black text-amber-400 mt-2">
                  {metrics?.upcomingExpiries || 0}
                </p>
                <span className="text-[10px] text-amber-400/80 font-semibold mt-1 block">
                  Within 15 days
                </span>
              </div>

              <div className="p-5 rounded-2xl bg-brand-surface border border-brand-border col-span-2 lg:col-span-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-brand-muted block">
                  New Enquiries
                </span>
                <p className="font-heading text-3xl font-black text-purple-400 mt-2">
                  {metrics?.newEnquiries || 0}
                </p>
                <span className="text-[10px] text-purple-400/80 font-semibold mt-1 block">
                  Pending contact
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------- */}
        {/* TAB 2: MEMBERS */}
        {/* ------------------------------------------------------------------- */}
        {activeTab === 'members' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Top Toolbar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-brand-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search by name, phone, or member code..."
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-brand-surface border border-brand-border text-xs text-brand-cream outline-none focus:border-brand-gold"
                />
              </div>

              <button
                onClick={() => {
                  setEditingMember(null);
                  setShowMemberModal(true);
                }}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gold-gradient text-brand-dark font-extrabold text-xs uppercase tracking-wider shadow-gold-sm hover:scale-[1.02] active:scale-[0.98]"
              >
                <Plus className="w-4 h-4" />
                <span>Enroll New Member</span>
              </button>
            </div>

            {/* Members Table */}
            <div className="rounded-2xl bg-brand-surface border border-brand-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-brand-elevated text-brand-muted uppercase font-bold tracking-wider border-b border-brand-border">
                    <tr>
                      <th className="py-3.5 px-4">Member Code</th>
                      <th className="py-3.5 px-4">Full Name</th>
                      <th className="py-3.5 px-4">Phone</th>
                      <th className="py-3.5 px-4">Plan</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">Expiry Date</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-border/60">
                    {filteredMembers.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-brand-muted">
                          No members found matching your search.
                        </td>
                      </tr>
                    ) : (
                      filteredMembers.map((member) => (
                        <tr key={member.id} className="hover:bg-brand-elevated/50 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-brand-gold">
                            {member.member_code}
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-brand-cream">
                            {member.full_name}
                          </td>
                          <td className="py-3.5 px-4 text-brand-muted">
                            {member.phone}
                          </td>
                          <td className="py-3.5 px-4 text-brand-cream-dim">
                            {member.current_plan_name || 'Standard'}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              member.status === 'active' 
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' 
                                : 'bg-red-950 text-red-400 border border-red-800'
                            }`}>
                              {member.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-brand-muted">
                            {member.expiry_date || 'N/A'}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {/* Assign Workout */}
                              <button
                                onClick={() => {
                                  setSelectedMemberForWorkout(member);
                                  setSelectedWorkoutPlanId(workouts[0]?.id || '');
                                  setShowWorkoutAssignModal(true);
                                }}
                                className="p-1.5 rounded-lg border border-brand-border text-brand-cream hover:border-brand-gold hover:text-brand-gold"
                                title="Assign Workout Routine"
                              >
                                <Dumbbell className="w-3.5 h-3.5" />
                              </button>

                              {/* Assign Diet */}
                              <button
                                onClick={() => {
                                  setSelectedMemberForDiet(member);
                                  setSelectedDietPlanId(diets[0]?.id || '');
                                  setShowDietAssignModal(true);
                                }}
                                className="p-1.5 rounded-lg border border-brand-border text-brand-cream hover:border-brand-gold hover:text-brand-gold"
                                title="Assign Diet Plan"
                              >
                                <Apple className="w-3.5 h-3.5" />
                              </button>

                              {/* Edit Member */}
                              <button
                                onClick={() => {
                                  setEditingMember(member);
                                  setShowMemberModal(true);
                                }}
                                className="p-1.5 rounded-lg border border-brand-border text-brand-cream hover:border-brand-gold hover:text-brand-gold"
                                title="Edit Member Details"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>

                              {/* Toggle Status */}
                              <button
                                onClick={() => handleToggleMember(member.id)}
                                className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase border ${
                                  member.status === 'active' 
                                    ? 'border-amber-900/50 text-amber-300 hover:bg-amber-950' 
                                    : 'border-emerald-900/50 text-emerald-300 hover:bg-emerald-950'
                                }`}
                              >
                                {member.status === 'active' ? 'Deactivate' : 'Activate'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------- */}
        {/* TAB 3: ATTENDANCE */}
        {/* ------------------------------------------------------------------- */}
        {activeTab === 'attendance' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Record Checkin Card */}
            <div className="p-6 rounded-2xl bg-brand-surface border border-brand-border space-y-4">
              <h3 className="font-heading text-xl font-bold uppercase text-brand-cream">
                Manual Attendance Check-In
              </h3>
              <p className="text-xs text-brand-muted">
                Select an active gym member to record check-in time. Prevents accidental duplicate entries on the same day.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-brand-muted mb-1.5">
                    Member Name / ID
                  </label>
                  <select
                    value={attendanceMemberId}
                    onChange={(e) => setAttendanceMemberId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-brand-elevated border border-brand-border text-brand-cream text-xs outline-none focus:border-brand-gold"
                  >
                    <option value="">-- Choose Member --</option>
                    {members.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.member_code} - {m.full_name} ({m.status})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-brand-muted mb-1.5">
                    Session Shift
                  </label>
                  <select
                    value={attendanceSession}
                    onChange={(e) => setAttendanceSession(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-brand-elevated border border-brand-border text-brand-cream text-xs outline-none focus:border-brand-gold"
                  >
                    <option value="Morning">Morning (5:30 AM - 10:30 AM)</option>
                    <option value="Evening">Evening (5:00 PM - 9:30 PM)</option>
                    <option value="General">General</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={handleRecordAttendance}
                    className="w-full py-2.5 rounded-xl bg-gold-gradient text-brand-dark font-extrabold text-xs uppercase tracking-wider shadow-gold-sm"
                  >
                    Confirm & Record Check-In
                  </button>
                </div>
              </div>
            </div>

            {/* Attendance Logs Table */}
            <div className="rounded-2xl bg-brand-surface border border-brand-border overflow-hidden">
              <div className="p-4 border-b border-brand-border flex items-center justify-between">
                <h4 className="font-heading text-lg font-bold uppercase text-brand-cream">
                  Attendance Records ({attendance.length})
                </h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-brand-elevated text-brand-muted uppercase font-bold tracking-wider border-b border-brand-border">
                    <tr>
                      <th className="py-3.5 px-4">Date</th>
                      <th className="py-3.5 px-4">Time</th>
                      <th className="py-3.5 px-4">Member Code</th>
                      <th className="py-3.5 px-4">Member Name</th>
                      <th className="py-3.5 px-4">Shift</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-border/60">
                    {attendance.map((att) => {
                      const memberObj = members.find(m => m.id === att.member_id) || att.member;
                      return (
                        <tr key={att.id} className="hover:bg-brand-elevated/50">
                          <td className="py-3.5 px-4 font-mono text-brand-cream">
                            {att.check_in_date}
                          </td>
                          <td className="py-3.5 px-4 font-mono font-bold text-brand-gold">
                            {att.check_in_time}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-brand-muted">
                            {memberObj?.member_code || 'KKL-MEMBER'}
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-brand-cream">
                            {memberObj?.full_name || 'Gym Member'}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="px-2 py-0.5 rounded-md bg-brand-elevated border border-brand-border text-[10px] uppercase font-bold text-brand-cream-dim">
                              {att.session_type}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------- */}
        {/* TAB 4: PLANS */}
        {/* ------------------------------------------------------------------- */}
        {activeTab === 'plans' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex justify-between items-center">
              <p className="text-xs text-brand-muted">
                Admin-controlled membership plans displayed on the public website.
              </p>
              <button
                onClick={() => {
                  setEditingPlan(null);
                  setShowPlanModal(true);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gold-gradient text-brand-dark font-extrabold text-xs uppercase tracking-wider shadow-gold-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Plan</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className="rounded-2xl bg-brand-surface border border-brand-border p-5 flex flex-col justify-between space-y-4"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <h4 className="font-heading text-lg font-bold uppercase text-brand-cream">
                        {plan.name}
                      </h4>
                      {plan.is_popular && (
                        <span className="px-2 py-0.5 rounded-full bg-brand-gold text-brand-dark text-[10px] font-black uppercase">
                          Popular
                        </span>
                      )}
                    </div>
                    <p className="font-heading text-3xl font-black text-brand-gold mt-2">
                      ₹{plan.price.toLocaleString('en-IN')}
                    </p>
                    <span className="text-xs text-brand-muted">
                      Duration: {plan.duration_months} Month{plan.duration_months > 1 ? 's' : ''}
                    </span>

                    <ul className="mt-4 space-y-1.5 text-xs text-brand-cream-dim border-t border-brand-border/60 pt-3">
                      {plan.benefits.map((b, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <Check className="w-3 h-3 text-brand-gold shrink-0" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-3 border-t border-brand-border flex items-center justify-between">
                    <span className={`text-[10px] font-bold uppercase ${plan.is_published ? 'text-emerald-400' : 'text-brand-muted'}`}>
                      {plan.is_published ? 'Published' : 'Hidden'}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingPlan(plan);
                          setShowPlanModal(true);
                        }}
                        className="p-1.5 rounded-lg border border-brand-border text-brand-cream hover:text-brand-gold"
                        title="Edit Plan"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={async () => {
                          if (confirm(`Delete plan "${plan.name}"?`)) {
                            const updated = await deleteMembershipPlan(plan.id);
                            setPlans(updated);
                            notify('Plan deleted.');
                          }
                        }}
                        className="p-1.5 rounded-lg border border-red-900/40 text-red-400 hover:bg-red-950"
                        title="Delete Plan"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------- */}
        {/* TAB 5: TRAINERS */}
        {/* ------------------------------------------------------------------- */}
        {activeTab === 'trainers' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex justify-between items-center">
              <p className="text-xs text-brand-muted">
                Manage coach profiles, specialties, certifications, and upload photos.
              </p>
              <button
                onClick={() => {
                  setEditingTrainer(null);
                  setTrainerPhotoPreview('');
                  setShowTrainerModal(true);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gold-gradient text-brand-dark font-extrabold text-xs uppercase tracking-wider shadow-gold-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Trainer Profile</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
              {trainers.map((t) => (
                <div key={t.id} className="rounded-2xl bg-brand-surface border border-brand-border p-6 flex flex-col justify-between space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-brand-dark border border-brand-border shrink-0">
                      <Image
                        src={t.photo_url || '/images/trainer-male.jpg'}
                        alt={t.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-heading text-xl font-bold uppercase text-brand-cream">{t.name}</h4>
                      <p className="text-xs font-semibold text-brand-gold uppercase">{t.specialization}</p>
                      <p className="text-xs text-brand-muted mt-1">{t.experience}</p>
                    </div>
                  </div>
                  <p className="text-xs text-brand-cream-dim leading-relaxed">{t.bio}</p>
                  
                  {/* Certifications tags */}
                  {t.certifications && (
                    <div className="flex flex-wrap gap-1">
                      {t.certifications.map((c, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-brand-elevated border border-brand-border text-[10px] text-brand-muted">
                          {c}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="pt-3 border-t border-brand-border flex items-center justify-between">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase">
                      {t.is_active ? 'Active Coach' : 'Inactive'}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingTrainer(t);
                          setTrainerPhotoPreview(t.photo_url);
                          setShowTrainerModal(true);
                        }}
                        className="p-1.5 rounded-lg border border-brand-border text-brand-cream hover:text-brand-gold"
                        title="Edit Trainer Profile"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={async () => {
                          if (confirm(`Remove trainer ${t.name}?`)) {
                            const updated = await deleteTrainer(t.id);
                            setTrainers(updated);
                            notify('Trainer profile deleted.');
                          }
                        }}
                        className="p-1.5 rounded-lg border border-red-900/40 text-red-400 hover:bg-red-950"
                        title="Delete Trainer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------- */}
        {/* TAB 6: WORKOUTS */}
        {/* ------------------------------------------------------------------- */}
        {activeTab === 'workouts' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex justify-between items-center">
              <p className="text-xs text-brand-muted">
                Create structured routines, configure exercise splits, and assign to members.
              </p>
              <button
                onClick={() => {
                  setEditingWorkout(null);
                  setWorkoutExercises([
                    {
                      id: 'ex-1',
                      plan_id: '',
                      day_name: 'Day 1: Chest & Triceps',
                      exercise_name: 'Flat Barbell Bench Press',
                      sets: 4,
                      reps: '8-10',
                      rest_seconds: 90,
                      instructions: 'Retract scapula, lower bar with control to mid-chest, press upwards.',
                      demo_url: 'https://www.youtube.com/watch?v=rT7DgCr-3pg',
                      display_order: 1,
                    }
                  ]);
                  setShowWorkoutModal(true);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gold-gradient text-brand-dark font-extrabold text-xs uppercase tracking-wider shadow-gold-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Create Workout Routine</span>
              </button>
            </div>

            <div className="space-y-6">
              {workouts.map((plan) => (
                <div key={plan.id} className="rounded-2xl bg-brand-surface border border-brand-border p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-brand-border/60 pb-3">
                    <div>
                      <span className="px-2.5 py-0.5 rounded-full bg-brand-gold/20 text-brand-gold text-[10px] font-black uppercase">
                        {plan.difficulty} &bull; {plan.days_per_week} Days/Week
                      </span>
                      <h3 className="font-heading text-2xl font-bold uppercase text-brand-cream mt-1">
                        {plan.title}
                      </h3>
                      <p className="text-xs text-brand-muted">{plan.description}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingWorkout(plan);
                          setWorkoutExercises(plan.exercises || []);
                          setShowWorkoutModal(true);
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-brand-border hover:border-brand-gold text-xs font-semibold text-brand-cream hover:text-brand-gold"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Edit Routine</span>
                      </button>

                      <button
                        onClick={async () => {
                          if (confirm(`Delete workout routine "${plan.title}"?`)) {
                            const updated = await deleteWorkoutPlan(plan.id);
                            setWorkouts(updated);
                            notify('Workout routine deleted.');
                          }
                        }}
                        className="p-1.5 rounded-lg border border-red-900/40 text-red-400 hover:bg-red-950"
                        title="Delete Routine"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Exercises Table */}
                  <div className="rounded-xl border border-brand-border overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-brand-elevated text-brand-muted uppercase font-bold">
                        <tr>
                          <th className="p-3">Day / Split</th>
                          <th className="p-3">Exercise Name</th>
                          <th className="p-3">Sets & Reps</th>
                          <th className="p-3">Rest</th>
                          <th className="p-3">Demo Link</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-brand-border/60">
                        {plan.exercises?.map((ex) => (
                          <tr key={ex.id} className="hover:bg-brand-elevated/40">
                            <td className="p-3 font-semibold text-brand-gold">{ex.day_name}</td>
                            <td className="p-3 font-bold text-brand-cream">{ex.exercise_name}</td>
                            <td className="p-3 font-mono">{ex.sets} sets &times; {ex.reps}</td>
                            <td className="p-3 font-mono text-brand-muted">{ex.rest_seconds}s</td>
                            <td className="p-3">
                              {ex.demo_url ? (
                                <a
                                  href={ex.demo_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-brand-gold hover:underline inline-flex items-center gap-1"
                                >
                                  <span>Video Demo</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              ) : (
                                <span className="text-brand-muted">N/A</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------- */}
        {/* TAB 7: DIET MANAGEMENT */}
        {/* ------------------------------------------------------------------- */}
        {activeTab === 'diets' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex justify-between items-center">
              <p className="text-xs text-brand-muted">
                Create structured daily meal timelines, upload diet sheets, and assign directly to members.
              </p>
              <button
                onClick={() => {
                  setEditingDiet(null);
                  setDietDocPreview('');
                  setDietMeals([
                    { name: 'Meal 1: Breakfast', time: '7:30 AM', items: '4 Boiled Eggs + 80g Oats with Banana', portions: '1 bowl oats + 4 eggs', notes: 'Drink 500ml water upon waking.' },
                    { name: 'Meal 2: Mid-Morning', time: '11:00 AM', items: '1 Seasonal Fruit + 20g Almonds', portions: '1 fruit + 10 almonds', notes: 'Healthy monounsaturated fats.' },
                    { name: 'Meal 3: Lunch', time: '1:30 PM', items: '150g Chicken/Paneer + Rice + Dal & Salad', portions: '150g protein + 1.5 cup rice', notes: 'Avoid heavy oils in curry.' },
                  ]);
                  setShowDietModal(true);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gold-gradient text-brand-dark font-extrabold text-xs uppercase tracking-wider shadow-gold-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Create Diet Protocol</span>
              </button>
            </div>

            <div className="space-y-6">
              {diets.map((diet) => (
                <div key={diet.id} className="rounded-2xl bg-brand-surface border border-brand-border p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-brand-border/60 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-black uppercase">
                          {diet.goal}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-brand-surface text-brand-gold border border-brand-border text-[10px] font-bold uppercase">
                          {diet.dietary_preference}
                        </span>
                      </div>
                      <h3 className="font-heading text-2xl font-bold uppercase text-brand-cream mt-1.5">
                        {diet.title}
                      </h3>
                      <p className="text-xs text-brand-muted">{diet.description}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Macro pill */}
                      <div className="flex items-center gap-3 p-2.5 rounded-xl bg-brand-elevated border border-brand-border text-center">
                        <div>
                          <p className="font-heading text-base font-bold text-brand-gold">{diet.calories_est}</p>
                          <span className="text-[9px] text-brand-muted uppercase font-semibold">Calories</span>
                        </div>
                        <div className="border-l border-brand-border pl-2.5">
                          <p className="font-heading text-base font-bold text-brand-cream">{diet.protein_g}g</p>
                          <span className="text-[9px] text-brand-muted uppercase font-semibold">Protein</span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setEditingDiet(diet);
                          setDietDocPreview(diet.document_url || '');
                          setDietMeals(diet.meals || []);
                          setShowDietModal(true);
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-brand-border hover:border-brand-gold text-xs font-semibold text-brand-cream hover:text-brand-gold"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={async () => {
                          if (confirm(`Delete diet protocol "${diet.title}"?`)) {
                            const updated = await deleteDietPlan(diet.id);
                            setDiets(updated);
                            notify('Diet protocol deleted.');
                          }
                        }}
                        className="p-1.5 rounded-lg border border-red-900/40 text-red-400 hover:bg-red-950"
                        title="Delete Diet Plan"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Structured Meals Table */}
                  <div className="rounded-xl border border-brand-border overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-brand-elevated text-brand-muted uppercase font-bold">
                        <tr>
                          <th className="p-3">Meal & Timing</th>
                          <th className="p-3">Food Items</th>
                          <th className="p-3">Portion Size</th>
                          <th className="p-3">Nutritional Notes</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-brand-border/60">
                        {diet.meals.map((meal, mIdx) => (
                          <tr key={mIdx} className="hover:bg-brand-elevated/40">
                            <td className="p-3">
                              <p className="font-bold text-brand-gold">{meal.name}</p>
                              <span className="text-[10px] text-brand-muted font-mono">{meal.time}</span>
                            </td>
                            <td className="p-3 text-brand-cream font-medium">{meal.items}</td>
                            <td className="p-3 text-brand-cream-dim">{meal.portions}</td>
                            <td className="p-3 text-brand-muted text-[11px]">{meal.notes || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------- */}
        {/* TAB 8: ENQUIRIES */}
        {/* ------------------------------------------------------------------- */}
        {activeTab === 'enquiries' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="rounded-2xl bg-brand-surface border border-brand-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-brand-elevated text-brand-muted uppercase font-bold border-b border-brand-border">
                    <tr>
                      <th className="p-3.5">Date</th>
                      <th className="p-3.5">Name</th>
                      <th className="p-3.5">Phone</th>
                      <th className="p-3.5">Plan Interest</th>
                      <th className="p-3.5">Message</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-border/60">
                    {enquiries.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-brand-muted">
                          No enquiries in database.
                        </td>
                      </tr>
                    ) : (
                      enquiries.map((enq) => (
                        <tr key={enq.id} className="hover:bg-brand-elevated/50">
                          <td className="p-3.5 font-mono text-brand-muted">
                            {new Date(enq.created_at).toLocaleDateString('en-IN')}
                          </td>
                          <td className="p-3.5 font-bold text-brand-cream">{enq.name}</td>
                          <td className="p-3.5 font-mono text-brand-gold">
                            <a href={`tel:${enq.phone}`} className="hover:underline flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              <span>{enq.phone}</span>
                            </a>
                          </td>
                          <td className="p-3.5 text-brand-cream-dim">{enq.plan_interest}</td>
                          <td className="p-3.5 max-w-xs text-brand-muted truncate" title={enq.message}>
                            {enq.message}
                          </td>
                          <td className="p-3.5">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              enq.status === 'new' 
                                ? 'bg-purple-950 text-purple-300 border border-purple-800' 
                                : enq.status === 'contacted'
                                ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                : 'bg-brand-elevated text-brand-muted'
                            }`}>
                              {enq.status}
                            </span>
                          </td>
                          <td className="p-3.5 text-right">
                            <select
                              value={enq.status}
                              onChange={async (e) => {
                                const updated = await updateEnquiryStatus(enq.id, e.target.value as any);
                                setEnquiries(updated);
                                const upMetrics = await getDashboardMetrics();
                                setMetrics(upMetrics);
                                notify('Enquiry status updated.');
                              }}
                              className="px-2 py-1 rounded bg-brand-elevated border border-brand-border text-brand-cream text-[11px] outline-none"
                            >
                              <option value="new">New</option>
                              <option value="contacted">Contacted</option>
                              <option value="closed">Closed</option>
                            </select>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------- */}
        {/* TAB 9: GALLERY & MEDIA (UPLOAD PHOTOS & VIDEOS) */}
        {/* ------------------------------------------------------------------- */}
        {activeTab === 'gallery' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex justify-between items-center">
              <p className="text-xs text-brand-muted">
                Upload gym photos, equipment shots, and workout videos displayed in the public gallery.
              </p>
              <button
                onClick={() => {
                  setGalleryMediaPreview('');
                  setShowGalleryModal(true);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gold-gradient text-brand-dark font-extrabold text-xs uppercase tracking-wider shadow-gold-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Upload Media Item</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {gallery.map((item) => (
                <div key={item.id} className="rounded-2xl bg-brand-surface border border-brand-border overflow-hidden relative group">
                  <div className="relative h-48 w-full bg-brand-dark">
                    <Image
                      src={item.image_url}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-3.5 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-brand-gold">{item.category}</span>
                      <p className="font-heading text-xs font-bold text-brand-cream truncate max-w-[150px]">{item.title}</p>
                    </div>
                    <button
                      onClick={async () => {
                        if (confirm(`Remove "${item.title}" from gallery?`)) {
                          const updated = await deleteGalleryItem(item.id);
                          setGallery(updated);
                          notify('Gallery item removed.');
                        }
                      }}
                      className="p-1.5 rounded-lg border border-red-900/40 text-red-400 hover:bg-red-950"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------- */}
        {/* TAB 10: GYM SETTINGS */}
        {/* ------------------------------------------------------------------- */}
        {activeTab === 'settings' && settings && (
          <div className="max-w-3xl space-y-6 animate-in fade-in duration-300">
            <form onSubmit={handleSaveSettings} className="p-6 sm:p-8 rounded-2xl bg-brand-surface border border-brand-border space-y-5">
              <h3 className="font-heading text-xl font-bold uppercase text-brand-cream border-b border-brand-border/60 pb-3">
                Official Gym Information
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-brand-muted mb-1.5">Gym Name</label>
                  <input
                    type="text"
                    name="gym_name"
                    defaultValue={settings.gym_name}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-brand-elevated border border-brand-border text-brand-cream text-xs outline-none focus:border-brand-gold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-brand-muted mb-1.5">Tagline</label>
                  <input
                    type="text"
                    name="tagline"
                    defaultValue={settings.tagline}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-brand-elevated border border-brand-border text-brand-cream text-xs outline-none focus:border-brand-gold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-brand-muted mb-1.5">Hero Headline</label>
                <input
                  type="text"
                  name="headline"
                  defaultValue={settings.headline}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-brand-elevated border border-brand-border text-brand-cream text-xs outline-none focus:border-brand-gold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-brand-muted mb-1.5">Phone Number</label>
                  <input
                    type="text"
                    name="phone"
                    defaultValue={settings.phone}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-brand-elevated border border-brand-border text-brand-cream text-xs outline-none focus:border-brand-gold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-brand-muted mb-1.5">WhatsApp Number</label>
                  <input
                    type="text"
                    name="whatsapp_number"
                    defaultValue={settings.whatsapp_number}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-brand-elevated border border-brand-border text-brand-cream text-xs outline-none focus:border-brand-gold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-brand-muted mb-1.5">Full Physical Address</label>
                <textarea
                  rows={2}
                  name="address"
                  defaultValue={settings.address}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-brand-elevated border border-brand-border text-brand-cream text-xs outline-none focus:border-brand-gold resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-brand-muted mb-1.5">Google Maps URL</label>
                <input
                  type="url"
                  name="map_url"
                  defaultValue={settings.map_url}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-brand-elevated border border-brand-border text-brand-cream text-xs outline-none focus:border-brand-gold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-brand-muted mb-1.5">Instagram URL</label>
                <input
                  type="url"
                  name="instagram_url"
                  defaultValue={settings.instagram_url}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-brand-elevated border border-brand-border text-brand-cream text-xs outline-none focus:border-brand-gold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-brand-muted mb-1.5">Operating Hours</label>
                <input
                  type="text"
                  name="opening_hours"
                  defaultValue={settings.opening_hours}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-brand-elevated border border-brand-border text-brand-cream text-xs outline-none focus:border-brand-gold"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="chk-member-portal"
                  name="member_portal_enabled"
                  defaultChecked={settings.member_portal_enabled}
                  className="w-4 h-4 accent-brand-gold rounded"
                />
                <label htmlFor="chk-member-portal" className="text-xs font-bold uppercase text-brand-cream cursor-pointer">
                  Enable Member Self-Service Portal Feature
                </label>
              </div>

              <div className="pt-4 border-t border-brand-border">
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-gold-gradient text-brand-dark font-extrabold text-xs uppercase tracking-wider shadow-gold-sm hover:scale-[1.01]"
                >
                  Save Gym Settings
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ------------------------------------------------------------------- */}
        {/* TAB 10: OFFERS & PROMO POPUP */}
        {/* ------------------------------------------------------------------- */}
        {activeTab === 'offer' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Status overview banner */}
            <div className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
              offer?.is_active 
                ? 'bg-gradient-to-r from-emerald-950/60 via-brand-surface to-brand-surface border-emerald-700/60' 
                : 'bg-gradient-to-r from-zinc-900/60 via-brand-surface to-brand-surface border-brand-border'
            }`}>
              <div className="flex items-center gap-3.5">
                <div className={`p-3 rounded-xl shrink-0 ${
                  offer?.is_active ? 'bg-emerald-500 text-brand-dark' : 'bg-brand-elevated text-brand-muted'
                }`}>
                  <Flame className="w-6 h-6 fill-current" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-heading text-lg font-bold uppercase text-brand-cream">
                      Website Visitor Offer Popup
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      offer?.is_active 
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
                        : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                    }`}>
                      {offer?.is_active ? 'POPUP ACTIVE & SHOWING' : 'POPUP PAUSED'}
                    </span>
                  </div>
                  <p className="text-xs text-brand-muted mt-0.5">
                    When active, a high-converting promotional modal appears automatically when users open the website.
                  </p>
                </div>
              </div>

              {offer && (
                <button
                  type="button"
                  onClick={async () => {
                    const nextStatus = !offer.is_active;
                    const updated = await saveSpecialOffer({ ...offer, is_active: nextStatus });
                    setOffer(updated);
                    if ((updated as any).cloudSynced) {
                      notify(nextStatus ? '✅ Offer popup activated & live across all devices!' : '✅ Offer popup paused across all devices.');
                    } else {
                      notify(`⚠️ Cloud sync error: ${(updated as any).error || 'offline'}.`, 'error');
                    }
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 border shrink-0 ${
                    offer.is_active
                      ? 'bg-red-950/60 hover:bg-red-900/60 border-red-800/80 text-red-200'
                      : 'bg-emerald-950/60 hover:bg-emerald-900/60 border-emerald-800/80 text-emerald-200'
                  }`}
                >
                  {offer.is_active ? 'Pause Popup' : 'Activate Popup'}
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Offer Editor Form */}
              <div className="lg:col-span-7 bg-brand-surface border border-brand-border rounded-2xl p-6">
                <h3 className="font-heading text-lg font-bold uppercase text-brand-cream mb-4 flex items-center gap-2">
                  <Edit className="w-4 h-4 text-brand-gold" />
                  <span>Configure Promotional Popup</span>
                </h3>

                <form onSubmit={handleSaveOfferSubmit} className="space-y-4 text-xs">
                  {/* Active Toggle Switch */}
                  <div className="p-3.5 rounded-xl bg-brand-elevated border border-brand-border flex items-center justify-between">
                    <div>
                      <span className="font-bold uppercase text-brand-cream block">Show Popup To Visitors</span>
                      <span className="text-[11px] text-brand-muted">Turn on to display to visitors when they land on the website</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="is_active"
                        defaultChecked={offer?.is_active ?? true}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-brand-dark peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-gold"></div>
                    </label>
                  </div>

                  {/* Ribbon Badge */}
                  <div>
                    <label className="block font-bold uppercase text-brand-muted mb-1">
                      Discount Ribbon / Top Badge *
                    </label>
                    <input
                      type="text"
                      name="badge"
                      required
                      placeholder="e.g. SPECIAL PROMOTION • FLAT 20% OFF"
                      defaultValue={offer?.badge || 'SPECIAL PROMOTION • FLAT 20% OFF'}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-brand-elevated border border-brand-border text-brand-cream outline-none focus:border-brand-gold font-medium"
                    />
                  </div>

                  {/* Headline */}
                  <div>
                    <label className="block font-bold uppercase text-brand-muted mb-1">
                      Offer Headline / Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      required
                      placeholder="e.g. Grand Fitness Transformation Offer!"
                      defaultValue={offer?.title || 'Grand Fitness Transformation Offer!'}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-brand-elevated border border-brand-border text-brand-cream outline-none focus:border-brand-gold font-bold text-sm"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block font-bold uppercase text-brand-muted mb-1">
                      Offer Details &amp; Perks *
                    </label>
                    <textarea
                      name="description"
                      rows={3}
                      required
                      placeholder="Describe the discount, free personal diet protocol, free months, or limited slots..."
                      defaultValue={offer?.description || 'Join any 6-Month or Annual Gym Membership and get 1 Month FREE + 1-on-1 Personalized Diet Protocol included! Limited registration slots available this month.'}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-brand-elevated border border-brand-border text-brand-cream outline-none focus:border-brand-gold resize-none leading-relaxed"
                    />
                  </div>

                  {/* Poster Image Upload & Preview */}
                  <div>
                    <label className="block font-bold uppercase text-brand-muted mb-1">
                      Promotional Poster Image (Auto-Compressed for HD Quality)
                    </label>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleFileUploadToDataURL(e.target.files[0], (url) => setOfferImagePreview(url));
                          }
                        }}
                        className="text-xs text-brand-muted file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border file:border-brand-border file:bg-brand-elevated file:text-brand-cream file:text-xs file:font-semibold"
                      />
                      <input
                        type="text"
                        name="image_url"
                        placeholder="Or paste image URL (e.g. /images/hero-gym.jpg)"
                        value={offerImagePreview}
                        onChange={(e) => setOfferImagePreview(e.target.value)}
                        className="flex-1 px-3.5 py-2 rounded-xl bg-brand-elevated border border-brand-border text-brand-cream outline-none focus:border-brand-gold text-xs font-mono"
                      />
                    </div>
                  </div>

                  {/* CTA Buttons */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold uppercase text-brand-muted mb-1">
                        Action Button Text *
                      </label>
                      <input
                        type="text"
                        name="cta_text"
                        required
                        placeholder="e.g. Claim Offer on WhatsApp"
                        defaultValue={offer?.cta_text || 'Claim Offer on WhatsApp'}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-brand-elevated border border-brand-border text-brand-cream outline-none focus:border-brand-gold font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block font-bold uppercase text-brand-muted mb-1">
                        Action Link / WhatsApp URL *
                      </label>
                      <input
                        type="text"
                        name="cta_link"
                        required
                        placeholder="e.g. https://wa.me/919490862006?text=..."
                        defaultValue={offer?.cta_link || 'https://wa.me/919490862006?text=Hi%20KKL%20Muscle%20Factory!%20I%20want%20to%20claim%20the%20Special%20Transformation%20Offer.'}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-brand-elevated border border-brand-border text-brand-cream outline-none focus:border-brand-gold font-mono text-xs"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-brand-border/70 flex items-center justify-between">
                    <span className="text-[11px] text-brand-muted flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-brand-gold" />
                      <span>Syncs directly to Turso Edge Database across all devices</span>
                    </span>

                    <button
                      type="submit"
                      id="btn-save-offer"
                      className="px-6 py-2.5 rounded-xl bg-gold-gradient text-brand-dark font-black text-xs uppercase tracking-wider shadow-gold-sm hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                      Save &amp; Publish Offer
                    </button>
                  </div>
                </form>
              </div>

              {/* Real-Time Live Preview */}
              <div className="lg:col-span-5 bg-brand-surface border border-brand-border rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-brand-border pb-3">
                  <h4 className="font-heading text-sm font-bold uppercase text-brand-cream flex items-center gap-1.5">
                    <Eye className="w-4 h-4 text-brand-gold" />
                    <span>Visitor Popup Live Preview</span>
                  </h4>
                  <span className="text-[10px] uppercase font-bold text-brand-gold">Interactive Preview</span>
                </div>

                {/* Exact replica of the popup */}
                <div className="relative rounded-2xl border-2 border-brand-gold/60 bg-brand-dark/95 overflow-hidden shadow-2xl">
                  {offerImagePreview && (
                    <div className="relative w-full h-36 bg-brand-elevated overflow-hidden">
                      <Image
                        src={offerImagePreview}
                        alt="Offer Preview"
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-transparent to-transparent" />
                      <div className="absolute top-2.5 left-2.5 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-black/80 border border-brand-gold text-[9px] font-black uppercase text-brand-gold">
                        <Percent className="w-3 h-3" />
                        <span>{offer?.badge || 'FLAT 20% OFF'}</span>
                      </div>
                    </div>
                  )}

                  <div className="p-4 space-y-2.5">
                    <h5 className="font-heading text-base font-black uppercase text-brand-cream leading-tight">
                      {offer?.title || 'Grand Fitness Transformation Offer!'}
                    </h5>
                    <p className="text-[11px] text-brand-cream-dim leading-relaxed line-clamp-3">
                      {offer?.description || 'Join any 6-Month or Annual Gym Membership and get 1 Month FREE + 1-on-1 Personalized Diet Protocol included!'}
                    </p>

                    <div className="pt-1 flex flex-col gap-2">
                      <div className="w-full py-2 px-3 rounded-lg bg-gold-gradient text-brand-dark font-black text-[11px] uppercase tracking-wider text-center flex items-center justify-center gap-1.5 shadow-gold-sm">
                        <MessageCircle className="w-3.5 h-3.5 fill-current" />
                        <span>{offer?.cta_text || 'Claim Offer on WhatsApp'}</span>
                      </div>
                      <div className="w-full py-1.5 px-3 rounded-lg border border-brand-border bg-brand-elevated text-brand-cream text-[10px] font-bold uppercase tracking-wider text-center">
                        Explore Plans
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-[10px] text-brand-muted text-center italic">
                  This popup will appear with a smooth animation when visitors open KKL Muscle Factory on mobile or desktop.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ------------------------------------------------------------------- */}
      {/* MODAL: ADD / EDIT MEMBER (Custom Code & Phone for Member Portal) */}
      {/* ------------------------------------------------------------------- */}
      {showMemberModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-brand-surface border border-brand-border rounded-2xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowMemberModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg border border-brand-border text-brand-muted hover:text-brand-cream"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-heading text-xl font-bold uppercase text-brand-cream mb-1">
              {editingMember ? 'Edit Member Record' : 'Enroll New Member'}
            </h3>
            <p className="text-xs text-brand-muted mb-4">
              Registered Member Code and Phone Number will be the only credentials accepted at the Member Portal.
            </p>

            <form onSubmit={handleSaveMemberSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase text-brand-muted mb-1">Member Code / ID *</label>
                  <input
                    type="text"
                    name="member_code"
                    required
                    placeholder="e.g. KKL-1004"
                    defaultValue={editingMember?.member_code || `KKL-${1000 + members.length + 1}`}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-brand-elevated border border-brand-border text-brand-gold font-mono font-bold outline-none focus:border-brand-gold"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase text-brand-muted mb-1">Full Name *</label>
                  <input
                    type="text"
                    name="full_name"
                    required
                    placeholder="e.g. Anand Sharma"
                    defaultValue={editingMember?.full_name || ''}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-brand-elevated border border-brand-border text-brand-cream outline-none focus:border-brand-gold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase text-brand-muted mb-1">Mobile Phone *</label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    placeholder="e.g. 9490862006"
                    defaultValue={editingMember?.phone || ''}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-brand-elevated border border-brand-border text-brand-cream outline-none focus:border-brand-gold"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase text-brand-muted mb-1">Gender</label>
                  <select
                    name="gender"
                    defaultValue={editingMember?.gender || 'Male'}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-brand-elevated border border-brand-border text-brand-cream outline-none focus:border-brand-gold"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase text-brand-muted mb-1">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="member@gmail.com"
                    defaultValue={editingMember?.email || ''}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-brand-elevated border border-brand-border text-brand-cream outline-none focus:border-brand-gold"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase text-brand-muted mb-1">Emergency Contact</label>
                  <input
                    type="tel"
                    name="emergency_contact"
                    placeholder="Emergency Phone"
                    defaultValue={editingMember?.emergency_contact || ''}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-brand-elevated border border-brand-border text-brand-cream outline-none focus:border-brand-gold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase text-brand-muted mb-1">Enrolled Plan</label>
                  <select
                    name="current_plan_name"
                    defaultValue={editingMember?.current_plan_name || plans[0]?.name || '3 Months Strength'}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-brand-elevated border border-brand-border text-brand-cream outline-none focus:border-brand-gold"
                  >
                    {plans.map(p => (
                      <option key={p.id} value={p.name}>{p.name} (₹{p.price})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold uppercase text-brand-muted mb-1">Status</label>
                  <select
                    name="status"
                    defaultValue={editingMember?.status || 'active'}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-brand-elevated border border-brand-border text-brand-cream outline-none focus:border-brand-gold"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase text-brand-muted mb-1">Membership Expiry Date</label>
                <input
                  type="date"
                  name="expiry_date"
                  defaultValue={editingMember?.expiry_date || new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0]}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-brand-elevated border border-brand-border text-brand-cream outline-none focus:border-brand-gold"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowMemberModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-brand-border text-brand-muted hover:text-brand-cream"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gold-gradient text-brand-dark font-extrabold uppercase tracking-wider shadow-gold-sm"
                >
                  Save Member Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* MODAL: CREATE / EDIT PLAN */}
      {/* ------------------------------------------------------------------- */}
      {showPlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-brand-surface border border-brand-border rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setShowPlanModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg border border-brand-border text-brand-muted hover:text-brand-cream"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-heading text-xl font-bold uppercase text-brand-cream mb-4">
              {editingPlan ? 'Edit Membership Plan' : 'Create Membership Plan'}
            </h3>

            <form onSubmit={handleSavePlanSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold uppercase text-brand-muted mb-1">Plan Name *</label>
                <input
                  type="text"
                  name="name"
                  required
                  defaultValue={editingPlan?.name || ''}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-brand-elevated border border-brand-border text-brand-cream outline-none focus:border-brand-gold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase text-brand-muted mb-1">Duration (Months) *</label>
                  <input
                    type="number"
                    name="duration_months"
                    required
                    min={1}
                    max={36}
                    defaultValue={editingPlan?.duration_months || 3}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-brand-elevated border border-brand-border text-brand-cream outline-none focus:border-brand-gold"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase text-brand-muted mb-1">Price (₹ INR) *</label>
                  <input
                    type="number"
                    name="price"
                    required
                    min={0}
                    defaultValue={editingPlan?.price || 3000}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-brand-elevated border border-brand-border text-brand-cream outline-none focus:border-brand-gold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase text-brand-muted mb-1">Short Description</label>
                <input
                  type="text"
                  name="description"
                  defaultValue={editingPlan?.description || ''}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-brand-elevated border border-brand-border text-brand-cream outline-none focus:border-brand-gold"
                />
              </div>

              <div>
                <label className="block font-bold uppercase text-brand-muted mb-1">
                  Key Benefits (one per line)
                </label>
                <textarea
                  name="benefits"
                  rows={4}
                  defaultValue={editingPlan?.benefits.join('\n') || 'Full Gym Access\nLocker Access\nGeneral Coaching'}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-brand-elevated border border-brand-border text-brand-cream outline-none focus:border-brand-gold"
                />
              </div>

              <div className="flex items-center gap-6 pt-1">
                <label className="flex items-center gap-2 cursor-pointer font-bold uppercase text-brand-cream">
                  <input
                    type="checkbox"
                    name="is_popular"
                    defaultChecked={editingPlan?.is_popular}
                    className="w-4 h-4 accent-brand-gold"
                  />
                  <span>Popular Badge</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-bold uppercase text-brand-cream">
                  <input
                    type="checkbox"
                    name="is_published"
                    defaultChecked={editingPlan?.is_published ?? true}
                    className="w-4 h-4 accent-brand-gold"
                  />
                  <span>Publish On Website</span>
                </label>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPlanModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-brand-border text-brand-muted hover:text-brand-cream"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gold-gradient text-brand-dark font-extrabold uppercase tracking-wider shadow-gold-sm"
                >
                  Save Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* MODAL: ADD / EDIT TRAINER */}
      {/* ------------------------------------------------------------------- */}
      {showTrainerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-brand-surface border border-brand-border rounded-2xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowTrainerModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg border border-brand-border text-brand-muted hover:text-brand-cream"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-heading text-xl font-bold uppercase text-brand-cream mb-4">
              {editingTrainer ? 'Edit Coach Profile' : 'Add Trainer Profile'}
            </h3>

            <form onSubmit={handleSaveTrainerSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase text-brand-muted mb-1">Trainer Name *</label>
                  <input
                    type="text"
                    name="name"
                    required
                    defaultValue={editingTrainer?.name || ''}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-brand-elevated border border-brand-border text-brand-cream outline-none focus:border-brand-gold"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase text-brand-muted mb-1">Experience *</label>
                  <input
                    type="text"
                    name="experience"
                    required
                    placeholder="e.g. 8+ Years"
                    defaultValue={editingTrainer?.experience || '5+ Years'}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-brand-elevated border border-brand-border text-brand-cream outline-none focus:border-brand-gold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase text-brand-muted mb-1">Specialization *</label>
                <input
                  type="text"
                  name="specialization"
                  required
                  placeholder="e.g. Head Bodybuilding & Strength Coach"
                  defaultValue={editingTrainer?.specialization || 'Bodybuilding & Strength Coach'}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-brand-elevated border border-brand-border text-brand-cream outline-none focus:border-brand-gold"
                />
              </div>

              {/* Photo Upload or URL */}
              <div>
                <label className="block font-bold uppercase text-brand-muted mb-1">Coach Profile Photo</label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileUploadToDataURL(e.target.files[0], (url) => setTrainerPhotoPreview(url));
                      }
                    }}
                    className="text-xs text-brand-muted file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border file:border-brand-border file:bg-brand-elevated file:text-brand-cream file:text-xs"
                  />
                  {trainerPhotoPreview && (
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-brand-gold">
                      <Image src={trainerPhotoPreview} alt="Preview" fill className="object-cover" />
                    </div>
                  )}
                </div>
                <input
                  type="text"
                  name="photo_url"
                  placeholder="Or enter photo URL..."
                  defaultValue={editingTrainer?.photo_url || ''}
                  className="w-full px-3.5 py-2 rounded-xl bg-brand-elevated border border-brand-border text-brand-cream outline-none focus:border-brand-gold mt-2 text-[11px]"
                />
              </div>

              <div>
                <label className="block font-bold uppercase text-brand-muted mb-1">Biography</label>
                <textarea
                  name="bio"
                  rows={3}
                  defaultValue={editingTrainer?.bio || 'Dedicated to coaching strict biomechanics and progressive overload.'}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-brand-elevated border border-brand-border text-brand-cream outline-none focus:border-brand-gold resize-none"
                />
              </div>

              <div>
                <label className="block font-bold uppercase text-brand-muted mb-1">Certifications (one per line)</label>
                <textarea
                  name="certifications"
                  rows={2}
                  defaultValue={editingTrainer?.certifications?.join('\n') || 'Certified Strength Coach\nCPR / First Aid'}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-brand-elevated border border-brand-border text-brand-cream outline-none focus:border-brand-gold resize-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="is_active"
                  id="chk-trainer-active"
                  defaultChecked={editingTrainer?.is_active ?? true}
                  className="w-4 h-4 accent-brand-gold"
                />
                <label htmlFor="chk-trainer-active" className="text-brand-cream font-bold uppercase">
                  Active On Public Website
                </label>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowTrainerModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-brand-border text-brand-muted hover:text-brand-cream"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gold-gradient text-brand-dark font-extrabold uppercase tracking-wider shadow-gold-sm"
                >
                  Save Trainer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* MODAL: CREATE / EDIT WORKOUT PLAN */}
      {/* ------------------------------------------------------------------- */}
      {showWorkoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-brand-surface border border-brand-border rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowWorkoutModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg border border-brand-border text-brand-muted hover:text-brand-cream"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-heading text-xl font-bold uppercase text-brand-cream mb-4">
              {editingWorkout ? 'Edit Workout Routine' : 'Create New Workout Routine'}
            </h3>

            <form onSubmit={handleSaveWorkoutSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-bold uppercase text-brand-muted mb-1">Routine Title *</label>
                  <input
                    type="text"
                    name="title"
                    required
                    defaultValue={editingWorkout?.title || ''}
                    placeholder="e.g. 4-Day Muscle Split"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-brand-elevated border border-brand-border text-brand-cream outline-none focus:border-brand-gold"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase text-brand-muted mb-1">Difficulty</label>
                  <select
                    name="difficulty"
                    defaultValue={editingWorkout?.difficulty || 'Intermediate'}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-brand-elevated border border-brand-border text-brand-cream outline-none focus:border-brand-gold"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase text-brand-muted mb-1">Days Per Week</label>
                  <input
                    type="number"
                    name="days_per_week"
                    min={1}
                    max={7}
                    defaultValue={editingWorkout?.days_per_week || 4}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-brand-elevated border border-brand-border text-brand-cream outline-none focus:border-brand-gold"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase text-brand-muted mb-1">Short Description</label>
                  <input
                    type="text"
                    name="description"
                    placeholder="e.g. Hypertrophy focus"
                    defaultValue={editingWorkout?.description || ''}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-brand-elevated border border-brand-border text-brand-cream outline-none focus:border-brand-gold"
                  />
                </div>
              </div>

              {/* Dynamic Exercise Management */}
              <div className="pt-2 border-t border-brand-border/60">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold uppercase text-brand-gold">Exercises Included</span>
                  <button
                    type="button"
                    onClick={() => {
                      setWorkoutExercises([
                        ...workoutExercises,
                        {
                          id: 'ex-' + Date.now(),
                          plan_id: editingWorkout?.id || '',
                          day_name: 'Day 1: Upper Body',
                          exercise_name: 'Incline Dumbbell Press',
                          sets: 3,
                          reps: '10-12',
                          rest_seconds: 75,
                          instructions: 'Full stretch at bottom, squeeze at peak.',
                          demo_url: '',
                          display_order: workoutExercises.length + 1,
                        }
                      ]);
                    }}
                    className="inline-flex items-center gap-1 text-[11px] text-brand-gold hover:underline font-bold"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Exercise Row</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {workoutExercises.map((ex, idx) => (
                    <div key={ex.id || idx} className="p-3 rounded-xl bg-brand-elevated border border-brand-border space-y-2">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <input
                          type="text"
                          placeholder="Day/Split (e.g. Day 1)"
                          value={ex.day_name}
                          onChange={(e) => {
                            const updated = [...workoutExercises];
                            updated[idx].day_name = e.target.value;
                            setWorkoutExercises(updated);
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-brand-dark border border-brand-border text-brand-cream text-[11px] outline-none"
                        />
                        <input
                          type="text"
                          placeholder="Exercise Name"
                          value={ex.exercise_name}
                          onChange={(e) => {
                            const updated = [...workoutExercises];
                            updated[idx].exercise_name = e.target.value;
                            setWorkoutExercises(updated);
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-brand-dark border border-brand-border text-brand-cream text-[11px] outline-none"
                        />
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Sets x Reps (e.g. 4 sets x 8-10)"
                            value={`${ex.sets} sets x ${ex.reps}`}
                            onChange={(e) => {
                              const updated = [...workoutExercises];
                              updated[idx].reps = e.target.value;
                              setWorkoutExercises(updated);
                            }}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-brand-dark border border-brand-border text-brand-cream text-[11px] outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setWorkoutExercises(workoutExercises.filter((_, i) => i !== idx));
                            }}
                            className="p-1 rounded text-red-400 hover:bg-red-950"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-brand-border/60">
                <button
                  type="button"
                  onClick={() => setShowWorkoutModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-brand-border text-brand-muted hover:text-brand-cream"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gold-gradient text-brand-dark font-extrabold uppercase tracking-wider shadow-gold-sm"
                >
                  Save Workout Routine
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* MODAL: CREATE / EDIT DIET PLAN (WITH PHOTO/DOCUMENT UPLOAD) */}
      {/* ------------------------------------------------------------------- */}
      {showDietModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-brand-surface border border-brand-border rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowDietModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg border border-brand-border text-brand-muted hover:text-brand-cream"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-heading text-xl font-bold uppercase text-brand-cream mb-4">
              {editingDiet ? 'Edit Diet Plan' : 'Create Structured Diet Protocol'}
            </h3>

            <form onSubmit={handleSaveDietSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-bold uppercase text-brand-muted mb-1">Plan Title *</label>
                  <input
                    type="text"
                    name="title"
                    required
                    defaultValue={editingDiet?.title || ''}
                    placeholder="e.g. Lean Muscle Hypertrophy Protocol"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-brand-elevated border border-brand-border text-brand-cream outline-none focus:border-brand-gold"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase text-brand-muted mb-1">Fitness Goal</label>
                  <select
                    name="goal"
                    defaultValue={editingDiet?.goal || 'Bulking'}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-brand-elevated border border-brand-border text-brand-cream outline-none focus:border-brand-gold"
                  >
                    <option value="Bulking">Bulking</option>
                    <option value="Cutting">Cutting</option>
                    <option value="Muscle Gain">Muscle Gain</option>
                    <option value="Fat Loss">Fat Loss</option>
                    <option value="General Fitness">General Fitness</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3">
                <div>
                  <label className="block font-bold uppercase text-brand-muted mb-1">Calories (kcal)</label>
                  <input
                    type="number"
                    name="calories_est"
                    defaultValue={editingDiet?.calories_est || 2600}
                    className="w-full px-3 py-2 rounded-xl bg-brand-elevated border border-brand-border text-brand-gold font-bold outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase text-brand-muted mb-1">Protein (g)</label>
                  <input
                    type="number"
                    name="protein_g"
                    defaultValue={editingDiet?.protein_g || 170}
                    className="w-full px-3 py-2 rounded-xl bg-brand-elevated border border-brand-border text-brand-cream outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase text-brand-muted mb-1">Carbs (g)</label>
                  <input
                    type="number"
                    name="carbs_g"
                    defaultValue={editingDiet?.carbs_g || 300}
                    className="w-full px-3 py-2 rounded-xl bg-brand-elevated border border-brand-border text-brand-cream outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase text-brand-muted mb-1">Fats (g)</label>
                  <input
                    type="number"
                    name="fats_g"
                    defaultValue={editingDiet?.fats_g || 65}
                    className="w-full px-3 py-2 rounded-xl bg-brand-elevated border border-brand-border text-brand-cream outline-none"
                  />
                </div>
              </div>

              {/* Diet Sheet Photo or PDF Upload */}
              <div>
                <label className="block font-bold uppercase text-brand-muted mb-1">
                  Upload Diet Chart Document / Photo
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileUploadToDataURL(e.target.files[0], (url) => setDietDocPreview(url));
                      }
                    }}
                    className="text-xs text-brand-muted file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border file:border-brand-border file:bg-brand-elevated file:text-brand-cream file:text-xs"
                  />
                  {dietDocPreview && (
                    <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> File Ready
                    </span>
                  )}
                </div>
              </div>

              {/* Structured Meals Timeline */}
              <div className="pt-2 border-t border-brand-border/60">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold uppercase text-brand-gold">Daily Meals Timetable</span>
                  <button
                    type="button"
                    onClick={() => {
                      setDietMeals([
                        ...dietMeals,
                        {
                          name: `Meal ${dietMeals.length + 1}`,
                          time: '3:00 PM',
                          items: 'Paneer / Chicken + Rice',
                          portions: '150g',
                          notes: 'Eat with salad',
                        }
                      ]);
                    }}
                    className="inline-flex items-center gap-1 text-[11px] text-brand-gold hover:underline font-bold"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Meal Slot</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {dietMeals.map((meal, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-brand-elevated border border-brand-border space-y-2">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <input
                          type="text"
                          placeholder="Meal Name (e.g. Breakfast)"
                          value={meal.name}
                          onChange={(e) => {
                            const updated = [...dietMeals];
                            updated[idx].name = e.target.value;
                            setDietMeals(updated);
                          }}
                          className="px-2 py-1.5 rounded-lg bg-brand-dark border border-brand-border text-brand-cream text-[11px] outline-none"
                        />
                        <input
                          type="text"
                          placeholder="Timing (e.g. 7:30 AM)"
                          value={meal.time}
                          onChange={(e) => {
                            const updated = [...dietMeals];
                            updated[idx].time = e.target.value;
                            setDietMeals(updated);
                          }}
                          className="px-2 py-1.5 rounded-lg bg-brand-dark border border-brand-border text-brand-cream text-[11px] outline-none"
                        />
                        <input
                          type="text"
                          placeholder="Food Items"
                          value={meal.items}
                          onChange={(e) => {
                            const updated = [...dietMeals];
                            updated[idx].items = e.target.value;
                            setDietMeals(updated);
                          }}
                          className="px-2 py-1.5 rounded-lg bg-brand-dark border border-brand-border text-brand-cream text-[11px] outline-none"
                        />
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Portion"
                            value={meal.portions}
                            onChange={(e) => {
                              const updated = [...dietMeals];
                              updated[idx].portions = e.target.value;
                              setDietMeals(updated);
                            }}
                            className="w-full px-2 py-1.5 rounded-lg bg-brand-dark border border-brand-border text-brand-cream text-[11px] outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => setDietMeals(dietMeals.filter((_, i) => i !== idx))}
                            className="p-1 rounded text-red-400 hover:bg-red-950"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-brand-border/60">
                <button
                  type="button"
                  onClick={() => setShowDietModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-brand-border text-brand-muted hover:text-brand-cream"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gold-gradient text-brand-dark font-extrabold uppercase tracking-wider shadow-gold-sm"
                >
                  Save Diet Protocol
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* MODAL: UPLOAD GALLERY / MEDIA */}
      {/* ------------------------------------------------------------------- */}
      {showGalleryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-brand-surface border border-brand-border rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setShowGalleryModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg border border-brand-border text-brand-muted hover:text-brand-cream"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-heading text-xl font-bold uppercase text-brand-cream mb-4">
              Add Photo / Video To Gallery
            </h3>

            <form onSubmit={handleSaveGallerySubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold uppercase text-brand-muted mb-1">Title / Caption *</label>
                <input
                  type="text"
                  name="title"
                  required
                  placeholder="e.g. Heavy Dumbbells Zone or Chest Press"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-brand-elevated border border-brand-border text-brand-cream outline-none focus:border-brand-gold"
                />
              </div>

              <div>
                <label className="block font-bold uppercase text-brand-muted mb-1">Category</label>
                <select
                  name="category"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-brand-elevated border border-brand-border text-brand-cream outline-none focus:border-brand-gold"
                >
                  <option value="Equipment">Equipment</option>
                  <option value="Gym Floor">Gym Floor</option>
                  <option value="Training">Training</option>
                  <option value="Transformation">Transformation</option>
                </select>
              </div>

              {/* Upload file or enter URL */}
              <div>
                <label className="block font-bold uppercase text-brand-muted mb-1">Upload Photo / Video File</label>
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileUploadToDataURL(e.target.files[0], (url) => setGalleryMediaPreview(url));
                    }
                  }}
                  className="w-full text-xs text-brand-muted file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border file:border-brand-border file:bg-brand-elevated file:text-brand-cream file:text-xs"
                />
                {galleryMediaPreview && (
                  <div className="mt-2 relative h-36 w-full rounded-xl overflow-hidden border border-brand-gold">
                    <Image src={galleryMediaPreview} alt="Preview" fill className="object-cover" />
                  </div>
                )}
                <input
                  type="text"
                  name="image_url"
                  placeholder="Or paste media URL..."
                  defaultValue={galleryMediaPreview}
                  className="w-full px-3.5 py-2 rounded-xl bg-brand-elevated border border-brand-border text-brand-cream outline-none focus:border-brand-gold mt-2 text-[11px]"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowGalleryModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-brand-border text-brand-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gold-gradient text-brand-dark font-extrabold uppercase tracking-wider shadow-gold-sm"
                >
                  Save & Publish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* MODAL: ASSIGN DIET PLAN */}
      {/* ------------------------------------------------------------------- */}
      {showDietAssignModal && selectedMemberForDiet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-brand-surface border border-brand-border rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setShowDietAssignModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg border border-brand-border text-brand-muted hover:text-brand-cream"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-heading text-xl font-bold uppercase text-brand-cream mb-1">
              Assign Diet Plan
            </h3>
            <p className="text-xs text-brand-muted mb-4">
              Member: <span className="text-brand-gold font-bold">{selectedMemberForDiet.full_name}</span> ({selectedMemberForDiet.member_code})
            </p>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold uppercase text-brand-muted mb-1.5">
                  Select Diet Protocol
                </label>
                <select
                  value={selectedDietPlanId}
                  onChange={(e) => setSelectedDietPlanId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-brand-elevated border border-brand-border text-brand-cream outline-none focus:border-brand-gold"
                >
                  {diets.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.title} ({d.goal} - {d.calories_est} kcal)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold uppercase text-brand-muted mb-1.5">
                  Special Coach Notes / Instructions
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Drink 3.5L water daily, take whey immediately post-workout..."
                  value={dietAssignNotes}
                  onChange={(e) => setDietAssignNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-brand-elevated border border-brand-border text-brand-cream outline-none focus:border-brand-gold resize-none"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowDietAssignModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-brand-border text-brand-muted"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAssignDiet}
                  className="px-5 py-2.5 rounded-xl bg-gold-gradient text-brand-dark font-extrabold uppercase tracking-wider shadow-gold-sm"
                >
                  Confirm Diet Assignment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* MODAL: ASSIGN WORKOUT PLAN */}
      {/* ------------------------------------------------------------------- */}
      {showWorkoutAssignModal && selectedMemberForWorkout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-brand-surface border border-brand-border rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setShowWorkoutAssignModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg border border-brand-border text-brand-muted hover:text-brand-cream"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-heading text-xl font-bold uppercase text-brand-cream mb-1">
              Assign Workout Routine
            </h3>
            <p className="text-xs text-brand-muted mb-4">
              Member: <span className="text-brand-gold font-bold">{selectedMemberForWorkout.full_name}</span> ({selectedMemberForWorkout.member_code})
            </p>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold uppercase text-brand-muted mb-1.5">
                  Select Workout Plan
                </label>
                <select
                  value={selectedWorkoutPlanId}
                  onChange={(e) => setSelectedWorkoutPlanId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-brand-elevated border border-brand-border text-brand-cream outline-none focus:border-brand-gold"
                >
                  {workouts.map(w => (
                    <option key={w.id} value={w.id}>
                      {w.title} ({w.difficulty} - {w.days_per_week} Days/Week)
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowWorkoutAssignModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-brand-border text-brand-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  onClick={handleAssignWorkout}
                  className="px-5 py-2.5 rounded-xl bg-gold-gradient text-brand-dark font-extrabold uppercase tracking-wider shadow-gold-sm"
                >
                  Confirm Workout Assignment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
