'use client';

import { Member } from '@/types';
import { getMembers } from './store';

const ADMIN_SESSION_KEY = 'kkl_admin_auth_token';
const MEMBER_SESSION_KEY = 'kkl_member_auth_session';

export function isAdminAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const session = localStorage.getItem(ADMIN_SESSION_KEY);
    return session === 'kkl_admin_verified_session';
  } catch {
    return false;
  }
}

export function setAdminAuthenticated(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ADMIN_SESSION_KEY, 'kkl_admin_verified_session');
  document.cookie = `admin_session=kkl_admin_verified_session; path=/; max-age=86400; SameSite=Lax`;
}

export function adminLogout(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ADMIN_SESSION_KEY);
  document.cookie = `admin_session=; path=/; max-age=0; SameSite=Lax`;
}

export async function loginWithPin(pin: string): Promise<{ success: boolean; message: string }> {
  const cleanPin = pin.trim();
  // Pin 4321 requested by the gym owner
  if (cleanPin === '4321') {
    setAdminAuthenticated();
    return { success: true, message: 'Admin authentication successful.' };
  }
  return { success: false, message: 'Invalid Admin PIN. Please check and try again.' };
}

// -----------------------------------------------------------------------------
// MEMBER AUTHENTICATION (Optional feature-flagged module)
// -----------------------------------------------------------------------------
export function getCurrentMember(): Member | null {
  if (typeof window === 'undefined') return null;
  try {
    const data = localStorage.getItem(MEMBER_SESSION_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function setMemberSession(member: Member): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(MEMBER_SESSION_KEY, JSON.stringify(member));
  document.cookie = `member_session=${member.id}; path=/; max-age=86400; SameSite=Lax`;
}

export function memberLogout(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(MEMBER_SESSION_KEY);
  document.cookie = `member_session=; path=/; max-age=0; SameSite=Lax`;
}

export async function loginMember(identifier: string): Promise<{ success: boolean; message: string; member?: Member }> {
  const clean = identifier.trim().toLowerCase();
  if (!clean) {
    return { success: false, message: 'Please enter your Member ID (e.g. KKL-1001) or Phone Number.' };
  }

  const members = await getMembers();
  const matched = members.find(m => 
    m.member_code.toLowerCase() === clean || 
    m.phone.replace(/\D/g, '') === clean.replace(/\D/g, '') ||
    (m.email && m.email.toLowerCase() === clean)
  );

  if (!matched) {
    return { 
      success: false, 
      message: 'No member found matching those details. Please consult the gym admin desk.' 
    };
  }

  if (matched.status === 'inactive' || matched.status === 'expired') {
    return { 
      success: false, 
      message: `Your membership is currently ${matched.status}. Please visit the front desk to renew.` 
    };
  }

  setMemberSession(matched);
  return { success: true, message: `Welcome back, ${matched.full_name}!`, member: matched };
}
