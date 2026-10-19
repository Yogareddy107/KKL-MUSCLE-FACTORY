import { NextRequest, NextResponse } from 'next/server';
import { 
  getTursoGymSettings, saveTursoGymSettings,
  getTursoPlans, saveTursoPlan, deleteTursoPlan,
  getTursoTrainers, saveTursoTrainer, deleteTursoTrainer,
  getTursoMembers, saveTursoMember, deleteTursoMember,
  getTursoWorkouts, saveTursoWorkout, deleteTursoWorkout,
  getTursoDiets, saveTursoDiet, deleteTursoDiet,
  getTursoGallery, saveTursoGallery, deleteTursoGallery,
  getTursoEnquiries, saveTursoEnquiry, 
  getTursoSpecialOffer, saveTursoSpecialOffer,
  getTursoAttendance, saveTursoAttendance,
  getTursoWorkoutAssignments, saveTursoWorkoutAssignment,
  getTursoDietAssignments, saveTursoDietAssignment,
  isTursoConfigured
} from '@/lib/turso';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const noCacheHeaders = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0',
};

export async function GET(req: NextRequest) {
  if (!isTursoConfigured()) {
    return NextResponse.json({ success: false, message: 'Turso not configured' }, { status: 503, headers: noCacheHeaders });
  }

  const { searchParams } = new URL(req.url);
  const entity = searchParams.get('entity');

  try {
    switch (entity) {
      case 'settings': {
        const data = await getTursoGymSettings();
        return NextResponse.json({ success: true, data }, { headers: noCacheHeaders });
      }
      case 'plans': {
        const data = await getTursoPlans();
        return NextResponse.json({ success: true, data }, { headers: noCacheHeaders });
      }
      case 'trainers': {
        const data = await getTursoTrainers();
        return NextResponse.json({ success: true, data }, { headers: noCacheHeaders });
      }
      case 'members': {
        const data = await getTursoMembers();
        return NextResponse.json({ success: true, data }, { headers: noCacheHeaders });
      }
      case 'workouts': {
        const data = await getTursoWorkouts();
        return NextResponse.json({ success: true, data }, { headers: noCacheHeaders });
      }
      case 'diets': {
        const data = await getTursoDiets();
        return NextResponse.json({ success: true, data }, { headers: noCacheHeaders });
      }
      case 'gallery': {
        const data = await getTursoGallery();
        return NextResponse.json({ success: true, data }, { headers: noCacheHeaders });
      }
      case 'enquiries': {
        const data = await getTursoEnquiries();
        return NextResponse.json({ success: true, data }, { headers: noCacheHeaders });
      }
      case 'offer': {
        const data = await getTursoSpecialOffer();
        return NextResponse.json({ success: true, data }, { headers: noCacheHeaders });
      }
      case 'attendance': {
        const data = await getTursoAttendance();
        return NextResponse.json({ success: true, data }, { headers: noCacheHeaders });
      }
      case 'workout_assignments': {
        const data = await getTursoWorkoutAssignments();
        return NextResponse.json({ success: true, data }, { headers: noCacheHeaders });
      }
      case 'diet_assignments': {
        const data = await getTursoDietAssignments();
        return NextResponse.json({ success: true, data }, { headers: noCacheHeaders });
      }
      default:
        return NextResponse.json({ success: false, message: 'Invalid entity specified' }, { status: 400, headers: noCacheHeaders });
    }
  } catch (error: any) {
    console.error(`[API /api/turso GET] Error fetching ${entity}:`, error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500, headers: noCacheHeaders });
  }
}

export async function POST(req: NextRequest) {
  if (!isTursoConfigured()) {
    return NextResponse.json({ success: false, message: 'Turso not configured' }, { status: 503, headers: noCacheHeaders });
  }

  try {
    const body = await req.json();
    const { entity, data } = body;

    let result: { success: boolean; error?: string } = { success: false, error: 'Unknown entity' };
    switch (entity) {
      case 'settings':
        result = await saveTursoGymSettings(data);
        break;
      case 'plans':
        result = await saveTursoPlan(data);
        break;
      case 'trainers':
        result = await saveTursoTrainer(data);
        break;
      case 'members':
        result = await saveTursoMember(data);
        break;
      case 'workouts':
        result = await saveTursoWorkout(data);
        break;
      case 'diets':
        result = await saveTursoDiet(data);
        break;
      case 'gallery':
        result = await saveTursoGallery(data);
        break;
      case 'enquiries':
        result = await saveTursoEnquiry(data);
        break;
      case 'offer':
        result = await saveTursoSpecialOffer(data);
        break;
      case 'attendance':
        result = await saveTursoAttendance(data);
        break;
      case 'workout_assignments':
        result = await saveTursoWorkoutAssignment(data);
        break;
      case 'diet_assignments':
        result = await saveTursoDietAssignment(data);
        break;
      default:
        return NextResponse.json({ success: false, message: 'Unknown entity' }, { status: 400, headers: noCacheHeaders });
    }

    if (!result.success) {
      console.warn(`[API /api/turso POST] Failed to persist entity ${entity}:`, result.error);
      return NextResponse.json({ 
        success: false, 
        message: result.error || `Failed to persist ${entity} to cloud database`,
        error: result.error 
      }, { status: 500, headers: noCacheHeaders });
    }

    return NextResponse.json({ success: true, message: `Successfully saved ${entity} to cloud database` }, { headers: noCacheHeaders });
  } catch (error: any) {
    console.error('[API /api/turso POST] Exception saving:', error);
    return NextResponse.json({ success: false, error: error.message || 'Server error', message: error.message || 'Server error' }, { status: 500, headers: noCacheHeaders });
  }
}

export async function DELETE(req: NextRequest) {
  if (!isTursoConfigured()) {
    return NextResponse.json({ success: false, message: 'Turso not configured' }, { status: 503 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const entity = searchParams.get('entity');
    const id = searchParams.get('id');

    if (!entity || !id) {
      return NextResponse.json({ success: false, message: 'entity and id are required' }, { status: 400 });
    }

    let result: { success: boolean; error?: string } = { success: false, error: 'Unsupported delete entity' };
    switch (entity) {
      case 'plans':
        result = await deleteTursoPlan(id);
        break;
      case 'trainers':
        result = await deleteTursoTrainer(id);
        break;
      case 'members':
        result = await deleteTursoMember(id);
        break;
      case 'workouts':
        result = await deleteTursoWorkout(id);
        break;
      case 'diets':
        result = await deleteTursoDiet(id);
        break;
      case 'gallery':
        result = await deleteTursoGallery(id);
        break;
      default:
        return NextResponse.json({ success: false, message: 'Unsupported delete entity' }, { status: 400 });
    }

    if (!result.success) {
      return NextResponse.json({ success: false, message: result.error || 'Delete failed', error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[API /api/turso DELETE] Error deleting:', error);
    return NextResponse.json({ success: false, error: error.message, message: error.message }, { status: 500 });
  }
}
