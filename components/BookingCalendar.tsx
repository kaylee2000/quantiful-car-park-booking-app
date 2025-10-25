'use client';

import { useState } from 'react';
import { Booking } from '@/lib/types';

interface BookingCalendarProps {
  bookings: Booking[];
  onDateClick?: (date: string, isBooked: boolean) => void;
}

export default function BookingCalendar({
  bookings,
  onDateClick,
}: BookingCalendarProps) {
  const bookedDates = new Set(bookings.map(b => b.date));
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const goToPreviousMonth = () => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() - 1);
      return newDate;
    });
  };

  const goToNextMonth = () => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + 1);
      return newDate;
    });
  };

  const getToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  };

  const firstDayOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  );
  const lastDayOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  );
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay();

  const daysArray = [];

  for (let i = 0; i < startingDayOfWeek; i++) {
    daysArray.push(null);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );
    date.setHours(0, 0, 0, 0);
    daysArray.push(date);
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const getDateString = (date: Date) => {
    // Format as YYYY-MM-DD in local timezone instead of UTC
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const isPastDate = (date: Date) => {
    const today = getToday();
    return date < today;
  };

  const getBookingForDate = (dateString: string) => {
    return bookings.find(b => b.date === dateString);
  };

  const handleDateClick = (date: Date) => {
    if (isPastDate(date)) return;

    const dateString = getDateString(date);
    const isBooked = bookedDates.has(dateString);

    if (onDateClick) {
      onDateClick(dateString, isBooked);
    }
  };

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={goToPreviousMonth}
          className="p-2 hover:bg-gray-100 rounded-md transition-colors"
          aria-label="Previous month"
        >
          <svg
            className="w-6 h-6 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <h2 className="text-2xl font-bold text-gray-800">
          {formatMonthYear(currentMonth)}
        </h2>
        <button
          onClick={goToNextMonth}
          className="p-2 hover:bg-gray-100 rounded-md transition-colors"
          aria-label="Next month"
        >
          <svg
            className="w-6 h-6 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {dayNames.map(dayName => (
          <div
            key={dayName}
            className="text-center text-sm font-semibold text-gray-600 py-2"
          >
            {dayName}
          </div>
        ))}

        {daysArray.map((date, index) => {
          if (date === null) {
            return <div key={index}></div>;
          }

          const dateString = getDateString(date);
          const isBooked = bookedDates.has(dateString);
          const isPast = isPastDate(date);
          const today = getToday();
          const isToday =
            date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();
          const booking = getBookingForDate(dateString);

          return (
            <div
              key={index}
              onClick={() => handleDateClick(date)}
              className={`
                p-3 border rounded-lg text-center text-sm transition-all
                ${
                  isPast
                    ? 'bg-gray-100 border-gray-200 text-gray-600 cursor-not-allowed'
                    : isBooked
                      ? 'bg-red-50 border-red-300 hover:bg-red-100 hover:border-red-400 hover:shadow-md active:scale-95 cursor-pointer'
                      : 'bg-green-50 border-green-300 hover:bg-green-100 hover:border-green-400 hover:shadow-md active:scale-95 cursor-pointer'
                }
                ${isToday ? 'ring-2 ring-blue-400' : ''}
              `}
            >
              <div
                className={`font-semibold ${isPast ? 'text-gray-600' : 'text-gray-700'}`}
              >
                {formatDate(date)}
              </div>
              {isToday && (
                <div className="text-xs text-blue-600 mt-1 font-semibold">
                  Today
                </div>
              )}
              {isBooked && booking && (
                <div
                  className={`text-xs mt-1 truncate ${isPast ? 'text-gray-500' : 'text-red-600'}`}
                >
                  {booking.userName}
                </div>
              )}
              {!isPast && isBooked && (
                <div className="text-xs text-red-500 mt-1 font-semibold">
                  Click to cancel
                </div>
              )}
              {!isPast && !isBooked && (
                <div className="text-xs text-green-600 mt-1 font-semibold">
                  Click to book
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex items-center justify-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-50 border border-green-300 rounded"></div>
          <span className="text-gray-600">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-50 border border-red-300 rounded"></div>
          <span className="text-gray-600">Booked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-100 border border-gray-200 rounded"></div>
          <span className="text-gray-600">Past</span>
        </div>
      </div>
    </div>
  );
}
