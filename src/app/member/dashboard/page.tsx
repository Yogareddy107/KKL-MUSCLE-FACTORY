'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  User, Dumbbell, Apple, CalendarCheck, Clock, 
  ExternalLink, LogOut, ShieldCheck, ChevronRight, 
  AlertCircle, CheckCircle2, Flame, Award, ArrowLeft, Printer 
} from 'lucide-react';
import { getCurrentMember, memberLogout } from '@/lib/auth';
import { 
  getGymSettings, getMemberDietAssignment, getMemberWorkoutAssignment, 
  getAttendance 
} from '@/lib/store';
import { Member, DietPlan, WorkoutPlan, AttendanceRecord, GymSettings } from '@/types';
import { WhatsAppDietButton } from '@/components/WhatsAppDietButton';

export default function MemberDashboardPage() {
  const router = useRouter();
  const [member, setMember] = useState<Member | null>(null);
  const [settings, setSettings] = useState<GymSettings | null>(null);
  const [dietPlan, setDietPlan] = useState<DietPlan | null>(null);
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(null);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'diet' | 'workout' | 'attendance' | 'profile'>('diet');

  useEffect(() => {
    const curMember = getCurrentMember();
    if (!curMember) {
      router.push('/member/login');
      return;
    }
    setMember(curMember);

    async function loadData(mem: Member) {
      setLoading(true);
      try {
        const [gymSettings, assignedDiet, assignedWorkout, allAttendance] = await Promise.all([
          getGymSettings(),
          getMemberDietAssignment(mem.id),
          getMemberWorkoutAssignment(mem.id),
          getAttendance(),
        ]);

        setSettings(gymSettings);
        setDietPlan(assignedDiet);
        setWorkoutPlan(assignedWorkout);
        setAttendance(allAttendance.filter(a => a.member_id === mem.id));
      } catch (e) {
        console.error('Error loading member dashboard data', e);
      } finally {
        setLoading(false);
      }
    }

    loadData(curMember);
  }, [router]);

  const handleSignOut = () => {
    memberLogout();
    router.push('/member/login');
  };

  if (!member) {
    return null;
  }

  // Calculate days remaining
  const calculateDaysRemaining = () => {
    if (!member.expiry_date) return null;
    const expiry = new Date(member.expiry_date);
    const now = new Date();
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysRemaining = calculateDaysRemaining();

  return (
    <div className="min-h-screen bg-brand-dark flex flex-col text-brand-cream">
      {/* Top Header Navigation */}
      <header className="sticky top-0 z-40 bg-brand-surface/90 backdrop-blur-md border-b border-brand-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="relative w-10 h-10 rounded-lg bg-brand-dark p-1 border border-brand-border">
                <Image
                  src="/logo.png"
                  alt="KKL Muscle Factory"
                  fill
                  className="object-contain"
                />
              </div>
              <div className="hidden sm:block">
                <h2 className="font-heading text-sm font-bold uppercase tracking-wider text-brand-cream group-hover:text-brand-gold transition-colors">
                  KKL MUSCLE FACTORY
                </h2>
                <span className="text-[10px] text-brand-gold font-semibold uppercase tracking-widest block">
                  Member Portal
                </span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-brand-cream">{member.full_name}</p>
              <p className="text-[10px] font-mono text-brand-gold font-semibold">{member.member_code}</p>
            </div>

            <button
              onClick={handleSignOut}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-900/40 bg-red-950/20 hover:bg-red-900/40 text-xs font-semibold text-red-300 transition-colors"
              title="Logout"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome & Membership Status Banner */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-brand-surface via-brand-elevated to-brand-surface border border-brand-border shadow-xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-800 text-[11px] font-bold uppercase text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Active Gym Membership
              </div>
              <h1 className="font-heading text-2xl sm:text-3xl font-black uppercase tracking-wide text-brand-cream">
                Welcome, {member.full_name}
              </h1>
              <p className="text-xs text-brand-muted">
                Member ID: <span className="font-mono text-brand-gold font-bold">{member.member_code}</span> &bull; Enrolled Plan: <span className="text-brand-cream font-semibold">{member.current_plan_name || 'Active Plan'}</span>
              </p>
            </div>

            {/* Validity Countdown Pill */}
            <div className="flex items-center gap-4 bg-brand-dark/60 p-4 rounded-xl border border-brand-border">
              <div>
                <p className="text-[10px] uppercase font-bold text-brand-muted">Expiry Date</p>
                <p className="font-mono text-sm font-bold text-brand-cream">
                  {member.expiry_date || 'N/A'}
                </p>
              </div>
              {daysRemaining !== null && (
                <div className="border-l border-brand-border pl-4 text-right">
                  <p className="text-[10px] uppercase font-bold text-brand-muted">Remaining</p>
                  <p className={`font-heading text-xl font-black ${
                    daysRemaining > 15 ? 'text-emerald-400' : daysRemaining > 5 ? 'text-amber-400' : 'text-red-400'
                  }`}>
                    {daysRemaining} Days
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-brand-border pb-3">
          {[
            { id: 'diet', label: 'My Diet Plan', icon: Apple },
            { id: 'workout', label: 'My Workout Routine', icon: Dumbbell },
            { id: 'attendance', label: 'Attendance History', icon: CalendarCheck, count: attendance.length },
            { id: 'profile', label: 'My Membership Details', icon: User },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                  isActive
                    ? 'bg-gold-gradient text-brand-dark shadow-gold-sm'
                    : 'bg-brand-surface border border-brand-border text-brand-cream hover:border-brand-gold/40'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    isActive ? 'bg-brand-dark text-brand-gold' : 'bg-brand-elevated text-brand-muted'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ------------------------------------------------------------------- */}
        {/* TAB 1: MY DIET PLAN (EXPLICIT USER FOCUS) */}
        {/* ------------------------------------------------------------------- */}
        {activeTab === 'diet' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {dietPlan ? (
              <div className="space-y-6">
                {/* Diet Summary Card */}
                <div className="p-6 rounded-2xl bg-brand-surface border border-brand-border shadow-lg space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-border/60 pb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="px-3 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-black uppercase">
                          {dietPlan.goal}
                        </span>
                        <span className="px-3 py-0.5 rounded-full bg-brand-elevated text-brand-gold border border-brand-border text-[10px] font-bold uppercase">
                          {dietPlan.dietary_preference}
                        </span>
                      </div>
                      <h2 className="font-heading text-2xl sm:text-3xl font-bold uppercase text-brand-cream">
                        {dietPlan.title}
                      </h2>
                      <p className="text-xs text-brand-muted mt-1 max-w-2xl">
                        {dietPlan.description}
                      </p>
                    </div>

                    <button
                      onClick={() => window.print()}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-elevated border border-brand-border hover:border-brand-gold text-xs font-semibold text-brand-cream transition-colors self-start sm:self-auto"
                      title="Print Diet Chart"
                    >
                      <Printer className="w-3.5 h-3.5 text-brand-gold" />
                      <span>Print Diet Sheet</span>
                    </button>
                  </div>

                  {/* Daily Target Macros Banner */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                    <div className="p-4 rounded-xl bg-brand-elevated border border-brand-border text-center">
                      <p className="font-heading text-3xl font-black text-brand-gold">{dietPlan.calories_est || '--'}</p>
                      <span className="text-[11px] uppercase font-bold text-brand-muted">Target Calories</span>
                    </div>
                    <div className="p-4 rounded-xl bg-brand-elevated border border-brand-border text-center">
                      <p className="font-heading text-3xl font-black text-brand-cream">{dietPlan.protein_g ? `${dietPlan.protein_g}g` : '--'}</p>
                      <span className="text-[11px] uppercase font-bold text-brand-muted">Daily Protein</span>
                    </div>
                    <div className="p-4 rounded-xl bg-brand-elevated border border-brand-border text-center">
                      <p className="font-heading text-3xl font-black text-brand-cream">{dietPlan.carbs_g ? `${dietPlan.carbs_g}g` : '--'}</p>
                      <span className="text-[11px] uppercase font-bold text-brand-muted">Carbohydrates</span>
                    </div>
                    <div className="p-4 rounded-xl bg-brand-elevated border border-brand-border text-center">
                      <p className="font-heading text-3xl font-black text-brand-cream">{dietPlan.fats_g ? `${dietPlan.fats_g}g` : '--'}</p>
                      <span className="text-[11px] uppercase font-bold text-brand-muted">Healthy Fats</span>
                    </div>
                  </div>
                </div>

                {/* Structured Meals Timeline Table */}
                <div className="rounded-2xl bg-brand-surface border border-brand-border overflow-hidden shadow-lg">
                  <div className="p-5 border-b border-brand-border flex items-center justify-between">
                    <div>
                      <h3 className="font-heading text-lg font-bold uppercase text-brand-cream">
                        Daily Meal Timeline & Portions
                      </h3>
                      <p className="text-xs text-brand-muted">
                        Eat at designated intervals to optimize digestion and protein synthesis.
                      </p>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-brand-elevated text-brand-muted uppercase font-bold tracking-wider border-b border-brand-border">
                        <tr>
                          <th className="py-3.5 px-4 w-44">Meal Schedule</th>
                          <th className="py-3.5 px-4">Recommended Food Items</th>
                          <th className="py-3.5 px-4 w-52">Portion Size</th>
                          <th className="py-3.5 px-4">Coach Instructions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-brand-border/60">
                        {dietPlan.meals.map((meal, idx) => (
                          <tr key={idx} className="hover:bg-brand-elevated/40 transition-colors">
                            <td className="py-4 px-4">
                              <p className="font-heading text-sm font-bold text-brand-gold uppercase">{meal.name}</p>
                              <div className="flex items-center gap-1.5 text-brand-muted mt-0.5 font-mono text-[11px]">
                                <Clock className="w-3 h-3 text-brand-gold" />
                                <span>{meal.time}</span>
                              </div>
                            </td>
                            <td className="py-4 px-4 font-semibold text-brand-cream text-xs leading-relaxed">
                              {meal.items}
                            </td>
                            <td className="py-4 px-4 text-brand-cream-dim font-medium">
                              {meal.portions}
                            </td>
                            <td className="py-4 px-4 text-brand-muted leading-relaxed">
                              {meal.notes || 'Follow standard portion guidelines.'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center p-12 rounded-2xl bg-brand-surface border border-brand-border max-w-lg mx-auto space-y-3">
                <Apple className="w-12 h-12 text-brand-gold mx-auto" />
                <h3 className="font-heading text-xl font-bold uppercase text-brand-cream">
                  No Diet Plan Assigned Yet
                </h3>
                <p className="text-xs text-brand-muted leading-relaxed">
                  Your certified coach has not yet linked a structured meal plan to your account. Use the button below to request a tailored diet on WhatsApp.
                </p>
              </div>
            )}

            {/* Special WhatsApp Custom Diet Plan Callout */}
            <div className="pt-2">
              <WhatsAppDietButton
                whatsappNumber={settings?.whatsapp_number || '919490862006'}
                fallbackPhone={settings?.phone || '9490862006'}
                isMemberView={true}
              />
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------- */}
        {/* TAB 2: MY WORKOUT ROUTINE */}
        {/* ------------------------------------------------------------------- */}
        {activeTab === 'workout' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {workoutPlan ? (
              <div className="space-y-6">
                <div className="p-6 rounded-2xl bg-brand-surface border border-brand-border shadow-lg">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-brand-border/60 pb-3 mb-4">
                    <div>
                      <span className="px-3 py-0.5 rounded-full bg-brand-gold/20 text-brand-gold text-[10px] font-black uppercase">
                        {workoutPlan.difficulty} &bull; {workoutPlan.days_per_week} Days/Week
                      </span>
                      <h2 className="font-heading text-2xl font-bold uppercase text-brand-cream mt-1">
                        {workoutPlan.title}
                      </h2>
                      <p className="text-xs text-brand-muted mt-0.5">{workoutPlan.description}</p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-brand-border overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-brand-elevated text-brand-muted uppercase font-bold">
                        <tr>
                          <th className="p-3">Day / Split</th>
                          <th className="p-3">Exercise Name</th>
                          <th className="p-3">Sets & Target Reps</th>
                          <th className="p-3">Rest Interval</th>
                          <th className="p-3">Form Guidance</th>
                          <th className="p-3 text-right">Demo Video</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-brand-border/60">
                        {workoutPlan.exercises?.map((ex) => (
                          <tr key={ex.id} className="hover:bg-brand-elevated/40">
                            <td className="p-3 font-semibold text-brand-gold">{ex.day_name}</td>
                            <td className="p-3 font-bold text-brand-cream">{ex.exercise_name}</td>
                            <td className="p-3 font-mono">{ex.sets} sets &times; {ex.reps}</td>
                            <td className="p-3 font-mono text-brand-muted">{ex.rest_seconds}s</td>
                            <td className="p-3 text-brand-muted text-[11px]">{ex.instructions}</td>
                            <td className="p-3 text-right">
                              {ex.demo_url ? (
                                <a
                                  href={ex.demo_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-brand-gold hover:underline inline-flex items-center gap-1 font-semibold"
                                >
                                  <span>Watch</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              ) : (
                                <span className="text-brand-muted">--</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center p-12 rounded-2xl bg-brand-surface border border-brand-border max-w-lg mx-auto space-y-3">
                <Dumbbell className="w-12 h-12 text-brand-gold mx-auto" />
                <h3 className="font-heading text-xl font-bold uppercase text-brand-cream">
                  No Workout Routine Assigned
                </h3>
                <p className="text-xs text-brand-muted">
                  Please consult the gym trainer desk to calibrate your progressive overload routine.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------------- */}
        {/* TAB 3: ATTENDANCE HISTORY */}
        {/* ------------------------------------------------------------------- */}
        {activeTab === 'attendance' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="rounded-2xl bg-brand-surface border border-brand-border overflow-hidden shadow-lg">
              <div className="p-5 border-b border-brand-border flex items-center justify-between">
                <div>
                  <h3 className="font-heading text-lg font-bold uppercase text-brand-cream">
                    Your Attendance Log ({attendance.length} Total Sessions)
                  </h3>
                  <p className="text-xs text-brand-muted">
                    Verified gym check-ins recorded at front desk.
                  </p>
                </div>
              </div>

              {attendance.length === 0 ? (
                <div className="p-12 text-center text-brand-muted text-xs">
                  No attendance records logged for your account yet. Check in at the desk during your next session!
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-brand-elevated text-brand-muted uppercase font-bold border-b border-brand-border">
                      <tr>
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4">Check-in Time</th>
                        <th className="py-3 px-4">Workout Shift</th>
                        <th className="py-3 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-border/60">
                      {attendance.map((att) => (
                        <tr key={att.id} className="hover:bg-brand-elevated/40">
                          <td className="py-3 px-4 font-mono text-brand-cream font-medium">
                            {new Date(att.check_in_date).toLocaleDateString('en-IN', {
                              weekday: 'short',
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-brand-gold">
                            {att.check_in_time}
                          </td>
                          <td className="py-3 px-4 text-brand-cream-dim">
                            {att.session_type} Session
                          </td>
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Verified Present</span>
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------- */}
        {/* TAB 4: PROFILE & MEMBERSHIP DETAILS */}
        {/* ------------------------------------------------------------------- */}
        {activeTab === 'profile' && (
          <div className="max-w-2xl space-y-6 animate-in fade-in duration-300">
            <div className="p-6 rounded-2xl bg-brand-surface border border-brand-border shadow-lg space-y-4">
              <h3 className="font-heading text-xl font-bold uppercase text-brand-cream border-b border-brand-border/60 pb-3">
                Member Information
              </h3>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-brand-muted uppercase font-bold block mb-1">Full Name</span>
                  <p className="font-semibold text-brand-cream text-sm">{member.full_name}</p>
                </div>
                <div>
                  <span className="text-brand-muted uppercase font-bold block mb-1">Member Code</span>
                  <p className="font-mono font-bold text-brand-gold text-sm">{member.member_code}</p>
                </div>
                <div>
                  <span className="text-brand-muted uppercase font-bold block mb-1">Contact Phone</span>
                  <p className="font-mono text-brand-cream">{member.phone}</p>
                </div>
                <div>
                  <span className="text-brand-muted uppercase font-bold block mb-1">Email Address</span>
                  <p className="text-brand-cream">{member.email || 'Not provided'}</p>
                </div>
                <div>
                  <span className="text-brand-muted uppercase font-bold block mb-1">Gender</span>
                  <p className="text-brand-cream">{member.gender}</p>
                </div>
                <div>
                  <span className="text-brand-muted uppercase font-bold block mb-1">Enrollment Date</span>
                  <p className="font-mono text-brand-cream">{member.join_date}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-brand-border/60">
                <span className="text-brand-muted uppercase font-bold block mb-1 text-xs">Emergency Contact</span>
                <p className="font-mono text-brand-cream text-xs">{member.emergency_contact || 'None registered'}</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
