import { readBookingsFile, writeBookingsFile } from './storage';
import { Booking } from './types';

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
export async function createBooking(bookingData: Omit<Booking, 'id' | 'createdAt'>): Promise<Booking> {
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
