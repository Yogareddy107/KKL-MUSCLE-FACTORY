import { NextResponse } from 'next/server';
import { submitEnquiry } from '@/lib/store';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone, email, plan_interest, message } = body;

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json(
        { success: false, message: 'Please enter a valid full name.' },
        { status: 400 }
      );
    }

    if (!phone || typeof phone !== 'string' || phone.trim().length < 7) {
      return NextResponse.json(
        { success: false, message: 'Please provide a valid contact phone number.' },
        { status: 400 }
      );
    }

    if (!message || typeof message !== 'string' || message.trim().length < 5) {
      return NextResponse.json(
        { success: false, message: 'Please write a brief message or question.' },
        { status: 400 }
      );
    }

    const saved = await submitEnquiry({
      name: name.trim(),
      phone: phone.trim(),
      email: email ? email.trim() : undefined,
      plan_interest: plan_interest || 'General Membership',
      message: message.trim(),
    });

    return NextResponse.json({
      success: true,
      message: 'Thank you! Your enquiry has been received. Our team will contact you shortly.',
      enquiryId: saved.id,
    });
  } catch (error) {
    console.error('Contact API Error:', error);
    return NextResponse.json(
      { success: false, message: 'An unexpected error occurred. Please try again or WhatsApp us directly.' },
      { status: 500 }
    );
  }
}
