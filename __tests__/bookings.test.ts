import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  createBooking,
  deleteBooking,
  getAllBookings,
  getBookingById,
  isDateBooked,
} from '@/lib/bookings';
import { Booking } from '@/lib/types';

// Mock the storage functions
vi.mock('@/lib/storage', () => ({
  readBookingsFile: vi.fn(),
  writeBookingsFile: vi.fn(),
}));

import { readBookingsFile, writeBookingsFile } from '@/lib/storage';

const mockReadBookingsFile = vi.mocked(readBookingsFile);
const mockWriteBookingsFile = vi.mocked(writeBookingsFile);

describe('Booking Service', () => {
  const mockBookings: Booking[] = [
    {
      id: 'booking-1',
      date: '2025-10-28',
      userName: 'John Doe',
      userEmail: 'john@company.com',
      createdAt: '2025-10-24T10:00:00.000Z',
    },
    {
      id: 'booking-2',
      date: '2025-10-30',
      userName: 'Jane Smith',
      userEmail: 'jane@company.com',
      createdAt: '2025-10-24T11:00:00.000Z',
    },
  ];

  beforeEach(() => {
    vi.resetAllMocks();
    mockWriteBookingsFile.mockResolvedValue();
  });

  describe('getAllBookings', () => {
    it('should return all bookings', async () => {
      mockReadBookingsFile.mockResolvedValueOnce(mockBookings);
      const result = await getAllBookings();

      expect(result).toEqual(mockBookings);
      expect(mockReadBookingsFile).toHaveBeenCalledOnce();
    });

    it('should return empty array when no bookings exist', async () => {
      mockReadBookingsFile.mockResolvedValueOnce([]);
      const result = await getAllBookings();

      expect(result).toEqual([]);
    });
  });

  describe('getBookingById', () => {
    it('should return booking when found', async () => {
      mockReadBookingsFile.mockResolvedValueOnce(mockBookings);
      const result = await getBookingById('booking-1');

      expect(result).toEqual(mockBookings[0]);
    });

    it('should return null when booking not found', async () => {
      mockReadBookingsFile.mockResolvedValueOnce(mockBookings);
      const result = await getBookingById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('isDateBooked', () => {
    it('should return true when date is booked', async () => {
      mockReadBookingsFile.mockResolvedValueOnce(mockBookings);
      const result = await isDateBooked('2025-10-28');

      expect(result).toBe(true);
    });

    it('should return false when date is not booked', async () => {
      mockReadBookingsFile.mockResolvedValueOnce(mockBookings);
      const result = await isDateBooked('2025-10-29');

      expect(result).toBe(false);
    });
  });

  describe('createBooking', () => {
    it('should create a new booking successfully', async () => {
      const newBookingData = {
        date: '2025-10-29',
        userName: 'Bob Wilson',
        userEmail: 'bob@company.com',
      };

      mockReadBookingsFile.mockResolvedValue(mockBookings);
      const result = await createBooking(newBookingData);

      expect(result).toMatchObject({
        ...newBookingData,
        id: expect.any(String),
        createdAt: expect.any(String),
      });
      expect(result.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      );
      // Just verify that writeBookingsFile was called with the correct structure
      expect(mockWriteBookingsFile).toHaveBeenCalledWith(
        expect.arrayContaining([
          ...mockBookings,
          expect.objectContaining({
            ...newBookingData,
            id: expect.any(String),
            createdAt: expect.any(String),
          }),
        ])
      );
    });

    it('should throw error when date is already booked', async () => {
      mockReadBookingsFile.mockResolvedValue(mockBookings);
      await expect(
        createBooking({
          date: '2025-10-28', // Already booked
          userName: 'Bob Wilson',
          userEmail: 'bob@company.com',
        })
      ).rejects.toThrow('This date is already booked');

      expect(mockWriteBookingsFile).not.toHaveBeenCalled();
    });

    it('should throw error for invalid date format', async () => {
      mockReadBookingsFile.mockResolvedValueOnce(mockBookings);
      await expect(
        createBooking({
          date: 'invalid-date',
          userName: 'Bob Wilson',
          userEmail: 'bob@company.com',
        })
      ).rejects.toThrow('Invalid date');

      expect(mockWriteBookingsFile).not.toHaveBeenCalled();
    });

    it('should throw error for invalid calendar date', async () => {
      mockReadBookingsFile.mockResolvedValueOnce(mockBookings);
      await expect(
        createBooking({
          date: '2025-02-30', // Feb 30 doesn't exist
          userName: 'Bob Wilson',
          userEmail: 'bob@company.com',
        })
      ).rejects.toThrow('Invalid date');

      expect(mockWriteBookingsFile).not.toHaveBeenCalled();
    });

    it('should throw error for invalid month', async () => {
      mockReadBookingsFile.mockResolvedValueOnce(mockBookings);
      await expect(
        createBooking({
          date: '2025-13-15', // Month 13 doesn't exist
          userName: 'Bob Wilson',
          userEmail: 'bob@company.com',
        })
      ).rejects.toThrow('Invalid date');

      expect(mockWriteBookingsFile).not.toHaveBeenCalled();
    });
  });

  describe('deleteBooking', () => {
    it('should delete existing booking successfully', async () => {
      mockReadBookingsFile.mockResolvedValue(mockBookings);
      const result = await deleteBooking('booking-1');

      expect(result).toBe(true);
      // Just verify that writeBookingsFile was called with the remaining bookings
      expect(mockWriteBookingsFile).toHaveBeenCalledWith(
        expect.arrayContaining([mockBookings[1]])
      );
    });

    it('should return false when booking not found', async () => {
      mockReadBookingsFile.mockResolvedValueOnce(mockBookings);
      const result = await deleteBooking('non-existent');

      expect(result).toBe(false);
      expect(mockWriteBookingsFile).not.toHaveBeenCalled();
    });
  });

  describe('Double-booking Prevention', () => {
    it('should prevent multiple bookings on the same date', async () => {
      // First call: empty bookings
      mockReadBookingsFile.mockResolvedValue([]);

      // First booking should succeed
      await createBooking({
        date: '2025-10-29',
        userName: 'First User',
        userEmail: 'first@company.com',
      });

      // Second call: first booking now exists
      mockReadBookingsFile.mockResolvedValue([
        {
          id: 'booking-1',
          date: '2025-10-29',
          userName: 'First User',
          userEmail: 'first@company.com',
          createdAt: '2025-10-24T10:00:00.000Z',
        },
      ]);

      // Second booking on same date should fail
      await expect(
        createBooking({
          date: '2025-10-29',
          userName: 'Second User',
          userEmail: 'second@company.com',
        })
      ).rejects.toThrow('This date is already booked');
    });

    it('should allow bookings on different dates', async () => {
      // First call: empty bookings
      mockReadBookingsFile.mockResolvedValue([]);

      const booking1 = await createBooking({
        date: '2025-10-29',
        userName: 'User 1',
        userEmail: 'user1@company.com',
      });

      // Second call: first booking exists
      mockReadBookingsFile.mockResolvedValue([booking1]);

      const booking2 = await createBooking({
        date: '2025-10-31',
        userName: 'User 2',
        userEmail: 'user2@company.com',
      });

      expect(booking1.date).toBe('2025-10-29');
      expect(booking2.date).toBe('2025-10-31');
      expect(mockWriteBookingsFile).toHaveBeenCalledTimes(2);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty bookings array', async () => {
      mockReadBookingsFile.mockResolvedValueOnce([]);
      const result = await getAllBookings();
      expect(result).toEqual([]);

      mockReadBookingsFile.mockResolvedValueOnce([]);
      const isBooked = await isDateBooked('2025-10-28');
      expect(isBooked).toBe(false);
    });

    it('should handle malformed booking data gracefully', async () => {
      mockReadBookingsFile.mockResolvedValueOnce([
        { id: 'invalid', date: '', userName: '', userEmail: '', createdAt: '' },
      ]);
      const result = await getAllBookings();
      expect(result).toHaveLength(1);
    });
  });
});
