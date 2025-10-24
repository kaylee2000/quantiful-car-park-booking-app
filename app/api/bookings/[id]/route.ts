import { NextRequest, NextResponse } from 'next/server';
import { deleteBooking } from '@/lib/bookings';
import { ErrorResponse, SuccessResponse } from '@/lib/types';

// DELETE /api/bookings/[id] - Delete a booking by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Booking ID is required' } as ErrorResponse,
        { status: 400 }
      );
    }

    const deleted = await deleteBooking(id);

    if (!deleted) {
      return NextResponse.json(
        { error: 'Booking not found' } as ErrorResponse,
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Booking cancelled successfully' } as SuccessResponse,
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting booking:', error);
    return NextResponse.json(
      { error: 'Failed to delete booking' } as ErrorResponse,
      { status: 500 }
    );
  }
}
