import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const noCacheHeaders = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0',
};

const ALLOWED_TABLES = new Set([
  'gym_settings',
  'membership_plans',
  'trainers',
  'members',
  'attendance',
  'workout_plans',
  'diet_plans',
  'gallery_items',
  'enquiries',
  'special_offers',
  'workout_assignments',
  'diet_assignments',
]);

export async function GET(req: NextRequest) {
  if (!isSupabaseConfigured() || !supabase) {
    return NextResponse.json({ success: false, error: 'Supabase not configured' }, { status: 503, headers: noCacheHeaders });
  }

  const { searchParams } = new URL(req.url);
  const table = searchParams.get('table');
  const id = searchParams.get('id');

  if (!table || !ALLOWED_TABLES.has(table)) {
    return NextResponse.json({ success: false, error: 'Invalid or missing table' }, { status: 400, headers: noCacheHeaders });
  }

  try {
    let query = supabase.from(table).select('*');
    if (id) {
      query = query.eq('id', id);
    }

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500, headers: noCacheHeaders });
    }

    return NextResponse.json({ success: true, data: id ? data?.[0] : data }, { headers: noCacheHeaders });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Server error' }, { status: 500, headers: noCacheHeaders });
  }
}

export async function POST(req: NextRequest) {
  if (!isSupabaseConfigured() || !supabase) {
    return NextResponse.json({ success: false, error: 'Supabase not configured' }, { status: 503, headers: noCacheHeaders });
  }

  try {
    const body = await req.json();
    const { table, action, payload, id } = body;

    if (!table || !ALLOWED_TABLES.has(table)) {
      return NextResponse.json({ success: false, error: 'Invalid or missing table' }, { status: 400, headers: noCacheHeaders });
    }

    if (action === 'delete') {
      const targetId = id || payload?.id;
      if (!targetId) {
        return NextResponse.json({ success: false, error: 'id required for delete' }, { status: 400, headers: noCacheHeaders });
      }
      const { error } = await supabase.from(table).delete().eq('id', targetId);
      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500, headers: noCacheHeaders });
      }
      return NextResponse.json({ success: true }, { headers: noCacheHeaders });
    }

    // Default: upsert
    if (!payload || typeof payload !== 'object') {
      return NextResponse.json({ success: false, error: 'payload required for upsert' }, { status: 400, headers: noCacheHeaders });
    }

    const { data, error } = await supabase.from(table).upsert(payload).select();
    if (error) {
      console.error(`[API /api/sync POST] Supabase upsert error on ${table}:`, error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500, headers: noCacheHeaders });
    }

    return NextResponse.json({ success: true, data }, { headers: noCacheHeaders });
  } catch (err: any) {
    console.error('[API /api/sync POST] Exception:', err);
    return NextResponse.json({ success: false, error: err?.message || 'Server error' }, { status: 500, headers: noCacheHeaders });
  }
}
