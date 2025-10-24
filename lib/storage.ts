import { promises as fs } from 'fs';
import path from 'path';
import { Booking, BookingsResponse } from './types';

const DATA_DIR = path.join(process.cwd(), 'data');
const BOOKINGS_FILE = path.join(DATA_DIR, 'bookings.json');

// Ensure data directory exists
export async function ensureDataDirectory(): Promise<void> {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

// Read bookings from JSON file
export async function readBookingsFile(): Promise<Booking[]> {
  await ensureDataDirectory();
  
  try {
    const data = await fs.readFile(BOOKINGS_FILE, 'utf-8');
    const parsed: BookingsResponse = JSON.parse(data);
    return parsed.bookings || [];
  } catch (error) {
    // File doesn't exist or is invalid, return empty array
    return [];
  }
}

// Write bookings to JSON file
export async function writeBookingsFile(bookings: Booking[]): Promise<void> {
  await ensureDataDirectory();
  
  const data: BookingsResponse = { bookings };
  const jsonString = JSON.stringify(data, null, 2);
  
  // Write atomically by writing to temp file first, then renaming
  const tempFile = `${BOOKINGS_FILE}.tmp`;
  await fs.writeFile(tempFile, jsonString, 'utf-8');
  await fs.rename(tempFile, BOOKINGS_FILE);
}