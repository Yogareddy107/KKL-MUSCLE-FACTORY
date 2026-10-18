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

    let success = false;
    switch (entity) {
      case 'settings':
        success = await saveTursoGymSettings(data);
        break;
      case 'plans':
        success = await saveTursoPlan(data);
        break;
      case 'trainers':
        success = await saveTursoTrainer(data);
        break;
      case 'members':
        success = await saveTursoMember(data);
        break;
      case 'workouts':
        success = await saveTursoWorkout(data);
        break;
      case 'diets':
        success = await saveTursoDiet(data);
        break;
      case 'gallery':
        success = await saveTursoGallery(data);
        break;
      case 'enquiries':
        success = await saveTursoEnquiry(data);
        break;
      case 'offer':
        success = await saveTursoSpecialOffer(data);
        break;
      default:
        return NextResponse.json({ success: false, message: 'Unknown entity' }, { status: 400, headers: noCacheHeaders });
    }

    if (!success) {
      console.warn(`[API /api/turso POST] Failed to persist entity: ${entity}`);
      return NextResponse.json({ success: false, message: `Failed to persist ${entity} to cloud database` }, { status: 500, headers: noCacheHeaders });
    }

    return NextResponse.json({ success: true, message: `Successfully saved ${entity} to cloud database` }, { headers: noCacheHeaders });
  } catch (error: any) {
    console.error('[API /api/turso POST] Exception saving:', error);
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500, headers: noCacheHeaders });
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

    let success = false;
    switch (entity) {
      case 'plans':
        success = await deleteTursoPlan(id);
        break;
      case 'trainers':
        success = await deleteTursoTrainer(id);
        break;
      case 'members':
        success = await deleteTursoMember(id);
        break;
      case 'workouts':
        success = await deleteTursoWorkout(id);
        break;
      case 'diets':
        success = await deleteTursoDiet(id);
        break;
      case 'gallery':
        success = await deleteTursoGallery(id);
        break;
      default:
        return NextResponse.json({ success: false, message: 'Unsupported delete entity' }, { status: 400 });
    }

    return NextResponse.json({ success });
  } catch (error: any) {
    console.error('[API /api/turso DELETE] Error deleting:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
