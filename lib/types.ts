export interface Booking {
  id: string;
  date: string; // ISO 8601 date format (YYYY-MM-DD)
  userName: string;
  userEmail: string;
  createdAt: string; // ISO 8601 timestamp
}

export interface CreateBookingRequest {
  date: string;
  userName: string;
  userEmail: string;
}

export interface BookingResponse {
  booking: Booking;
}

export interface BookingsResponse {
  bookings: Booking[];
}

export interface ErrorResponse {
  error: string;
}

export interface SuccessResponse {
  message: string;
}
