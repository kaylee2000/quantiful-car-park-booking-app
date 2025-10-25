'use client';

import { useState } from 'react';
import { Booking } from '@/lib/types';

interface BookingFormProps {
  onSubmit: (booking: Omit<Booking, 'id' | 'createdAt'>) => void;
  isLoading?: boolean;
}

export default function BookingForm({ onSubmit, isLoading }: BookingFormProps) {
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [date, setDate] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate inputs
    if (!userName.trim() || !userEmail.trim() || !date) {
      setError('Please fill in all fields');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userEmail)) {
      setError('Please enter a valid email address');
      return;
    }

    onSubmit({ userName, userEmail, date });

    // Reset form
    setUserName('');
    setUserEmail('');
    setDate('');
  };

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-lg shadow-md space-y-4"
    >
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Book a Date</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label
          htmlFor="userName"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Your Name
        </label>
        <input
          type="text"
          id="userName"
          value={userName}
          onChange={e => setUserName(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="John Doe"
          required
        />
      </div>

      <div>
        <label
          htmlFor="userEmail"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Email Address
        </label>
        <input
          type="email"
          id="userEmail"
          value={userEmail}
          onChange={e => setUserEmail(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="john@company.com"
          required
        />
      </div>

      <div>
        <label
          htmlFor="date"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Select Date
        </label>
        <input
          type="date"
          id="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          min={today}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? 'Booking...' : 'Book Car Park Slot'}
      </button>
    </form>
  );
}
