'use client';

import { useEffect } from 'react';
import { Booking } from '@/lib/types';

interface CancelBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  booking: Booking | null;
  isLoading?: boolean;
}

export default function CancelBookingModal({
  isOpen,
  onClose,
  onConfirm,
  booking,
  isLoading,
}: CancelBookingModalProps) {
  // Handle ESC key press
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, isLoading]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (!isOpen || !booking) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm"
      onClick={e => {
        if (e.target === e.currentTarget && !isLoading) {
          onClose();
        }
      }}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Cancel Booking</h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold leading-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ×
          </button>
        </div>

        <div className="mb-6">
          <p className="text-gray-600 mb-4">
            Are you sure you want to cancel this booking?
          </p>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="space-y-2">
              <div>
                <p className="text-sm text-gray-600">Date</p>
                <p className="text-lg font-semibold text-red-700">
                  {formatDate(booking.date)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-medium text-gray-800">{booking.userName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium text-gray-800">{booking.userEmail}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
            disabled={isLoading}
          >
            Keep Booking
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Cancelling...' : 'Cancel Booking'}
          </button>
        </div>
      </div>
    </div>
  );
}
