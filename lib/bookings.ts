import { readBookingsFile, writeBookingsFile } from './storage';
import { Booking } from './types';

// Utility function to validate date format and calendar validity
function isValidDate(dateString: string): boolean {
  // Check format: YYYY-MM-DD
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateString)) {
    return false;
  }

  // Parse the date components
  const date = new Date(dateString + 'T00:00:00');

  // Check if date is valid
  if (isNaN(date.getTime())) {
    return false;
  }

  // Check if parsed date matches input (catches invalid dates like 2025-02-30)
  const [year, month, day] = dateString.split('-').map(Number);
  const parsedYear = date.getFullYear();
  const parsedMonth = date.getMonth() + 1; // getMonth() returns 0-11
  const parsedDay = date.getDate();

  return parsedYear === year && parsedMonth === month && parsedDay === day;
}

// Check if a date is already booked
export async function isDateBooked(date: string): Promise<boolean> {
  const bookings = await readBookingsFile();
  return bookings.some(booking => booking.date === date);
}

// Get booking by ID
export async function getBookingById(id: string): Promise<Booking | null> {
  const bookings = await readBookingsFile();
  return bookings.find(booking => booking.id === id) || null;
}

// Create a new booking
export async function createBooking(
  bookingData: Omit<Booking, 'id' | 'createdAt'>
): Promise<Booking> {
  // Validate date format and calendar validity
  if (!isValidDate(bookingData.date)) {
    throw new Error('Invalid date');
  }

  const bookings = await readBookingsFile();

  // Check if date is already booked
  if (await isDateBooked(bookingData.date)) {
    throw new Error('This date is already booked');
  }

  const newBooking: Booking = {
    ...bookingData,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };

  bookings.push(newBooking);
  await writeBookingsFile(bookings);

  return newBooking;
}

// Delete a booking by ID
export async function deleteBooking(id: string): Promise<boolean> {
  const bookings = await readBookingsFile();
  const initialLength = bookings.length;
  const filteredBookings = bookings.filter(booking => booking.id !== id);

  if (filteredBookings.length === initialLength) {
    return false; // Booking not found
  }

  await writeBookingsFile(filteredBookings);
  return true;
}

// Get all bookings
export async function getAllBookings(): Promise<Booking[]> {
  return await readBookingsFile();
}
