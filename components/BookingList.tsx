'use client';

import { Booking } from '@/lib/types';

interface BookingListProps {
  bookings: Booking[];
  onCancel: (id: string) => void;
  isDeleting?: string;
}

export default function BookingList({
  bookings,
  onCancel,
  isDeleting,
}: BookingListProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (bookings.length === 0) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <p className="text-gray-500 text-lg">
          No bookings yet. Be the first to book!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        Upcoming Bookings
      </h2>
      <div className="space-y-3">
        {bookings
          .sort((a, b) => a.date.localeCompare(b.date))
          .map(booking => (
            <div
              key={booking.id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <div className="text-sm font-semibold text-gray-600">
                    {formatDate(booking.date)}
                  </div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="text-sm text-gray-700">
                    {booking.userName}
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {booking.userEmail}
                </div>
              </div>
              <button
                onClick={() => onCancel(booking.id)}
                disabled={isDeleting === booking.id}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isDeleting === booking.id ? 'Cancelling...' : 'Cancel'}
              </button>
            </div>
          ))}
      </div>
    </div>
  );
}
