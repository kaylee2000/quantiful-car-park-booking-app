import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/bookings/route';
import { DELETE } from '@/app/api/bookings/[id]/route';
import { getAllBookings, createBooking, deleteBooking } from '@/lib/bookings';

// Mock the booking service
vi.mock('@/lib/bookings', () => ({
  getAllBookings: vi.fn(),
  createBooking: vi.fn(),
  deleteBooking: vi.fn(),
}));

const mockGetAllBookings = vi.mocked(getAllBookings);
const mockCreateBooking = vi.mocked(createBooking);
const mockDeleteBooking = vi.mocked(deleteBooking);

describe('API Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/bookings', () => {
    it('should return all bookings successfully', async () => {
      const mockBookings = [
        {
          id: 'booking-1',
          date: '2025-10-28',
          userName: 'John Doe',
          userEmail: 'john@company.com',
          createdAt: '2025-10-24T10:00:00.000Z',
        },
      ];

      mockGetAllBookings.mockResolvedValue(mockBookings);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ bookings: mockBookings });
      expect(mockGetAllBookings).toHaveBeenCalledOnce();
    });

    it('should handle errors gracefully', async () => {
      mockGetAllBookings.mockRejectedValue(new Error('Database error'));

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to fetch bookings' });
    });
  });

  describe('POST /api/bookings', () => {
    const validBookingData = {
      date: '2025-10-28',
      userName: 'John Doe',
      userEmail: 'john@company.com',
    };

    it('should create booking successfully', async () => {
      const mockBooking = {
        id: 'booking-1',
        ...validBookingData,
        createdAt: '2025-10-24T10:00:00.000Z',
      };

      mockCreateBooking.mockResolvedValue(mockBooking);

      const request = new NextRequest('http://localhost:3000/api/bookings', {
        method: 'POST',
        body: JSON.stringify(validBookingData),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toEqual({ booking: mockBooking });
      expect(mockCreateBooking).toHaveBeenCalledWith(validBookingData);
    });

    it('should validate required fields', async () => {
      const invalidData = { date: '2025-10-28' }; // Missing userName and userEmail

      const request = new NextRequest('http://localhost:3000/api/bookings', {
        method: 'POST',
        body: JSON.stringify(invalidData),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Missing required fields');
    });

    it('should validate date format', async () => {
      const invalidData = {
        ...validBookingData,
        date: 'invalid-date',
      };

      const request = new NextRequest('http://localhost:3000/api/bookings', {
        method: 'POST',
        body: JSON.stringify(invalidData),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Invalid date format');
    });

    it('should validate email format', async () => {
      const invalidData = {
        ...validBookingData,
        userEmail: 'invalid-email',
      };

      const request = new NextRequest('http://localhost:3000/api/bookings', {
        method: 'POST',
        body: JSON.stringify(invalidData),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Invalid email format');
    });

    it('should prevent booking past dates', async () => {
      const pastDate = '2020-01-01';
      const invalidData = {
        ...validBookingData,
        date: pastDate,
      };

      const request = new NextRequest('http://localhost:3000/api/bookings', {
        method: 'POST',
        body: JSON.stringify(invalidData),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Cannot book dates in the past');
    });

    it('should handle double-booking conflict', async () => {
      mockCreateBooking.mockRejectedValue(
        new Error('This date is already booked')
      );

      const request = new NextRequest('http://localhost:3000/api/bookings', {
        method: 'POST',
        body: JSON.stringify(validBookingData),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.error).toBe('This date is already booked');
    });

    it('should handle unexpected errors', async () => {
      mockCreateBooking.mockRejectedValue(new Error('Unexpected error'));

      const request = new NextRequest('http://localhost:3000/api/bookings', {
        method: 'POST',
        body: JSON.stringify(validBookingData),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to create booking');
    });
  });

  describe('DELETE /api/bookings/[id]', () => {
    it('should delete booking successfully', async () => {
      mockDeleteBooking.mockResolvedValue(true);

      const response = await DELETE(
        new NextRequest('http://localhost:3000/api/bookings/booking-1'),
        { params: Promise.resolve({ id: 'booking-1' }) }
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ message: 'Booking cancelled successfully' });
      expect(mockDeleteBooking).toHaveBeenCalledWith('booking-1');
    });

    it('should return 404 when booking not found', async () => {
      mockDeleteBooking.mockResolvedValue(false);

      const response = await DELETE(
        new NextRequest('http://localhost:3000/api/bookings/non-existent'),
        { params: Promise.resolve({ id: 'non-existent' }) }
      );
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toEqual({ error: 'Booking not found' });
    });

    it('should handle missing ID parameter', async () => {
      const response = await DELETE(
        new NextRequest('http://localhost:3000/api/bookings/'),
        { params: Promise.resolve({ id: '' }) }
      );
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: 'Booking ID is required' });
    });

    it('should handle unexpected errors', async () => {
      mockDeleteBooking.mockRejectedValue(new Error('Database error'));

      const response = await DELETE(
        new NextRequest('http://localhost:3000/api/bookings/booking-1'),
        { params: Promise.resolve({ id: 'booking-1' }) }
      );
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to delete booking' });
    });
  });
});
