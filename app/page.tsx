'use client';

import { useState, useEffect } from 'react';
import BookingCalendar from '@/components/BookingCalendar';
import BookingModal from '@/components/BookingModal';
import CancelBookingModal from '@/components/CancelBookingModal';
import { Booking } from '@/lib/types';

export default function Home() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  // Fetch all bookings
  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/bookings');
      if (!response.ok) throw new Error('Failed to fetch bookings');
      const data = await response.json();
      setBookings(data.bookings || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setMessage({ type: 'error', text: 'Failed to load bookings' });
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleDateClick = (date: string, isBooked: boolean) => {
    if (isBooked) {
      // Find the booking for this date
      const booking = bookings.find(b => b.date === date);
      if (booking) {
        setSelectedBooking(booking);
        setIsCancelModalOpen(true);
      }
    } else {
      // Open booking modal for available date
      setSelectedDate(date);
      setIsBookingModalOpen(true);
    }
  };

  // Create a new booking
  const handleCreateBooking = async (
    bookingData: Omit<Booking, 'id' | 'createdAt'>
  ) => {
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create booking');
      }

      setMessage({ type: 'success', text: 'Booking created successfully!' });
      setIsBookingModalOpen(false);
      await fetchBookings();
    } catch (error) {
      console.error('Error creating booking:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to create booking';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  // Cancel a booking
  const handleCancelBooking = async () => {
    if (!selectedBooking) return;

    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/bookings/${selectedBooking.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to cancel booking');
      }

      setMessage({ type: 'success', text: 'Booking cancelled successfully!' });
      setIsCancelModalOpen(false);
      setSelectedBooking(null);
      await fetchBookings();
    } catch (error) {
      console.error('Error cancelling booking:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to cancel booking';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Car Park Booking
          </h1>
          <p className="text-gray-600">
            Click on dates to book or cancel your slot
          </p>
        </div>

        {/* Message Display */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-100 text-green-800 border border-green-400'
                : 'bg-red-100 text-red-800 border border-red-400'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Calendar View - Main Content */}
        <div className="mb-6">
          <BookingCalendar bookings={bookings} onDateClick={handleDateClick} />
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 mt-8">
          <p>Shared company car park slot • One booking per date</p>
        </div>
      </div>

      {/* Booking Modal */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        onSubmit={handleCreateBooking}
        selectedDate={selectedDate}
        isLoading={isLoading}
      />

      {/* Cancel Booking Modal */}
      <CancelBookingModal
        isOpen={isCancelModalOpen}
        onClose={() => {
          setIsCancelModalOpen(false);
          setSelectedBooking(null);
        }}
        onConfirm={handleCancelBooking}
        booking={selectedBooking}
        isLoading={isLoading}
      />
    </div>
  );
}
