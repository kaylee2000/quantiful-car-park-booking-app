# Car Park Booking Application

A full-stack car park slot booking application built with Next.js 16, React 19, TypeScript, and Tailwind CSS. The application allows employees to view booked dates and reserve available dates for a single shared car park slot.

## Features

✅ **Complete Booking System**

- View availability calendar with month navigation
- Book available dates with user identification
- Cancel existing bookings
- Prevent double-booking on the same date
- Visual distinction between available, booked, and past dates

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Frontend**: React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Storage**: JSON flat file (data/bookings.json)
- **Testing**: Vitest with React Testing Library
- **Development**: ESLint, Prettier

## Getting Started

### Prerequisites

- Node.js 20.x or later
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm test

# Run tests in watch mode
npm run test:ui

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## API Endpoints

### GET /api/bookings

Returns all bookings.

**Response**: `{ bookings: Booking[] }`

### POST /api/bookings

Create a new booking.

**Request Body**:

```json
{
  "date": "2025-10-28",
  "userName": "John Doe",
  "userEmail": "john@company.com"
}
```

**Response**: `{ booking: Booking }`

**Validation**:

- Date format: YYYY-MM-DD
- Email format: Valid email address
- Date must not be in the past
- Date must be a valid calendar date
- Name max length: 100 characters
- Email max length: 254 characters
- Prevents double-booking

### DELETE /api/bookings/:id

Delete a booking by ID.

**Response**: `{ message: "Booking cancelled successfully" }`

## Data Model

```typescript
interface Booking {
  id: string; // UUID
  date: string; // YYYY-MM-DD format
  userName: string; // User's name
  userEmail: string; // User's email
  createdAt: string; // ISO 8601 timestamp
}
```

## Technical Decisions

### Why Next.js?

**Decision**: Used Next.js as a full-stack framework instead of separate Express + React apps.

**Rationale**:

- **Unified Stack**: Next.js provides both frontend (React) and backend (API Routes) in one application, simplifying development and deployment
- **File-Based Routing**: Next.js's file-based routing is cleaner and more intuitive than React Router's component-based routing
- **Server Components**: Server Components allow rendering components on the server, reducing client-side JavaScript and improving performance
- **Performance**: Built-in optimizations like automatic code splitting, server-side rendering, and API routes reduce boilerplate

**Alternatives Considered**: Express + Create React App, Remix

- **Why Not Express + CRA**: Would require managing two separate codebases, build processes, and deployment configurations; React Router feels more verbose than Next.js's file-based routing
- **Why Not Remix**: Personal preference for Next.js ecosystem and deployment options

### Why JSON Flat File Storage?

**Decision**: Used JSON file (`data/bookings.json`) instead of a database (SQLite, PostgreSQL, MongoDB).

**Rationale**:

- **Simplicity**: For a take-home task with <1000 bookings, a JSON file is the simplest solution with zero setup
- **No Dependencies**: No need to install, configure, or run database servers
- **Portability**: Easy to inspect and backup
- **Sufficient for Scope**: Meets the requirement of "persist data between server restarts"

**Limitations**:

- **Not Production-Ready**: File-based storage doesn't scale beyond a few concurrent requests
- **No ACID Guarantees**: No transactions, rollbacks, or consistency guarantees
- **Race Conditions**: Multiple simultaneous writes can corrupt data (see Concurrency section)

**When to Upgrade**: For production, migrate to PostgreSQL or MongoDB for proper concurrency handling, scalability, and data integrity

## Concurrency Considerations

### The Problem

If two users attempt to book the same date simultaneously, a **race condition** can occur:

```
Time    Request A                      Request B
----    -------------                  -------------
0ms     read bookings.json (empty)
10ms                                 read bookings.json (empty)
20ms    check: not booked ✅
30ms    write: create booking A
40ms                                check: not booked ✅ (stale data!)
50ms                                write: create booking B ✅

Result: Booking A is overwritten! Only Booking B exists. ❌ Data loss
```

**Important**: With file-based writes, the last write wins. Booking A's data is lost, not saved alongside Booking B.

### Current Implementation

**Status**: The current implementation does **not** prevent race conditions. It uses optimistic locking (read-check-write) without file-level synchronization.

### Production Solutions

To handle concurrent booking requests in production, consider these approaches:

#### Option 1: Database with Constraints (Recommended)

Use a database with unique constraints:

```sql
CREATE TABLE bookings (
  id UUID PRIMARY KEY,
  date DATE UNIQUE NOT NULL,
  user_name VARCHAR(100) NOT NULL,
  user_email VARCHAR(254) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Option 2: File Locking

Implement in-memory or advisory file locks:

**Limitation**: Only works within a single process. Multiple server instances still have race conditions.

#### Option 3: Queue System

Use a message queue (AWS SQS or Kafka) to serialize write operations:

## License

MIT
