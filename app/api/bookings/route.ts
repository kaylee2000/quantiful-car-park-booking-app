import { NextRequest, NextResponse } from 'next/server';
import { getAllBookings, createBooking } from '@/lib/bookings';
import {
  CreateBookingRequest,
  BookingResponse,
  ErrorResponse,
} from '@/lib/types';

// GET /api/bookings - List all bookings
export async function GET() {
  try {
    const bookings = await getAllBookings();
    return NextResponse.json({ bookings });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' } as ErrorResponse,
      { status: 500 }
    );
  }
}

// POST /api/bookings - Create a new booking
export async function POST(request: NextRequest) {
  try {
    const body: CreateBookingRequest = await request.json();

    // Validate required fields
    if (!body.date || !body.userName || !body.userEmail) {
      return NextResponse.json(
        {
          error: 'Missing required fields: date, userName, userEmail',
        } as ErrorResponse,
        { status: 400 }
      );
    }

    // Validate date format (basic check)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(body.date)) {
      return NextResponse.json(
        { error: 'Invalid date format. Use YYYY-MM-DD' } as ErrorResponse,
        { status: 400 }
      );
    }

    // Validate email format (basic check)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.userEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' } as ErrorResponse,
        { status: 400 }
      );
    }

    // Check if date is in the past
    const bookingDate = new Date(body.date + 'T00:00:00'); // Parse as midnight in local time
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (bookingDate < today) {
      return NextResponse.json(
        { error: 'Cannot book dates in the past' } as ErrorResponse,
        { status: 400 }
      );
    }

    const booking = await createBooking(body);

    return NextResponse.json({ booking } as BookingResponse, { status: 201 });
  } catch (error) {
    console.error('Error creating booking:', error);

    if (
      error instanceof Error &&
      error.message === 'This date is already booked'
    ) {
      return NextResponse.json({ error: error.message } as ErrorResponse, {
        status: 409,
      });
    }

    return NextResponse.json(
      { error: 'Failed to create booking' } as ErrorResponse,
      { status: 500 }
    );
  }
}
