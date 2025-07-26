# CarePulse - Healthcare Management Platform

A sophisticated physiotherapy clinic management system built with domain-driven design principles, featuring real-time appointment scheduling, multi-role authentication, and comprehensive patient care workflows.

## 🏥 Project Overview

CarePulse is a full-stack healthcare management platform that demonstrates senior-level engineering practices through:
- **Domain-Driven Design**: Clean separation of business logic from infrastructure
- **Type-Safe Architecture**: End-to-end TypeScript with branded types and discriminated unions
- **Real-Time Updates**: Live synchronization across multiple user sessions
- **Multi-Role System**: Patient, Doctor, and Staff dashboards with role-based permissions

## 🛠 Tech Stack

### Backend
- **Framework**: Fastify (Node.js) with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Better Auth (session-based with multiple providers)
- **Real-time**: WebSocket support for live updates
- **SMS**: Twilio integration for notifications
- **Deployment**: Railway (backend) with environment-based configuration

### Frontend
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript with strict mode
- **Styling**: Tailwind CSS v4
- **State Management**: TanStack Query (server state) + Zustand (client state)
- **UI Components**: Radix UI primitives with custom styling
- **Forms**: React Hook Form with Zod validation
- **Testing**: Vitest (unit) + Playwright (E2E) + MSW (API mocking)
- **Deployment**: Vercel (frontend)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Docker and Docker Compose
- PostgreSQL (via Docker)
- Twilio account (for SMS - optional for development)

### Quick Start

1. **Clone the repository**
   ```bash
   git clone [repository-url]
   cd patient-management
   ```

2. **Start the database**
   ```bash
   docker-compose up -d
   ```

3. **Backend setup**
   ```bash
   cd backend
   npm install
   cp .env.example .env  # Configure your environment variables
   npm run db:push       # Create database tables
   npm run db:seed       # Populate with test data
   npm run dev           # Start backend server
   ```

4. **Frontend setup** (new terminal)
   ```bash
   cd frontend
   npm install
   cp .env.example .env  # Configure your environment variables
   npm run dev           # Start frontend server
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - Database GUI: `npm run db:studio` (http://localhost:5555)

### Test Credentials

After seeding, use these test accounts:

**Patients:**
- Email: `sarah.johnson@email.com` / Password: `password123`
- Email: `michael.chen@email.com` / Password: `password123`

**Doctors:**
- Email: `dr.wilson@clinic.com` / Password: `password123`
- Email: `dr.patel@clinic.com` / Password: `password123`

**Staff:**
- Email: `admin@clinic.com` / Password: `password123`

## 🏗 Architecture Overview

### Domain-Driven Design Structure

```
backend/
├── src/
│   ├── domain/           # Core business logic
│   │   ├── entities/     # Domain models with branded types
│   │   ├── repositories/ # Data access interfaces
│   │   └── services/     # Business logic services
│   ├── infrastructure/   # External concerns
│   ├── routes/          # HTTP endpoints
│   └── config/          # Configuration
```

### Key Architectural Decisions

1. **Branded Types**: Prevent ID mixing bugs at compile time
   ```typescript
   type PatientId = string & { readonly __brand: "PatientId" };
   type DoctorId = string & { readonly __brand: "DoctorId" };
   ```

2. **Repository Pattern**: Clean separation between domain and data layers
3. **State Machines**: Type-safe appointment and queue state transitions
4. **Discriminated Unions**: Exhaustive handling of all possible states

## 🔐 Authentication System

The platform uses Better Auth for comprehensive authentication:
- **Email/Password**: Traditional authentication with bcrypt hashing
- **Phone/OTP**: SMS-based authentication via Twilio
- **Session Management**: Stateful sessions with HTTP-only cookies
- **Role-Based Access**: Enforced at both API and UI levels

## 📋 Core Features

### Multi-Role Dashboards
- **Patient Dashboard**: View appointments, book new visits, check queue status
- **Doctor Dashboard**: Manage schedule, view patient history, write clinical notes
- **Staff Dashboard**: Oversee all appointments, manage queues, handle walk-ins

### Appointment Management
- Real-time availability checking
- Conflict detection and prevention
- State machine-driven status transitions
- SMS notifications for confirmations and reminders

### Queue Management System
- Digital check-in process
- Real-time queue updates
- Estimated wait time calculations
- SMS notifications for queue status

### Clinical Documentation
- Two-tier note system (private clinical notes vs patient summaries)
- Document upload and sharing
- Role-based visibility controls

## 🧪 Testing

### Unit Tests (Vitest)
```bash
cd frontend
npm run test        # Run unit tests
npm run test:ui     # Run with UI
```

### E2E Tests (Playwright)
```bash
cd frontend
npm run test:e2e    # Run E2E tests
npm run test:e2e:ui # Run with UI
```

### Backend Testing
```bash
cd backend
npm run test:db     # Test database connection
npm run typecheck   # TypeScript validation
```

## 📚 Development Workflow

### Database Management
```bash
# Backend directory
npm run db:push     # Apply schema changes
npm run db:seed     # Refresh test data
npm run db:studio   # Visual database browser
npm run db:reset    # Reset and reseed database
```

### Type Safety
```bash
# Both directories
npm run typecheck   # Validate TypeScript
```

### Code Quality
```bash
# Frontend directory
npm run lint        # ESLint checks
```

## 🚀 Deployment

### Backend (Railway)
1. Push to GitHub
2. Railway auto-deploys from main branch
3. Set environment variables in Railway dashboard
4. Run database migrations after deployment

### Frontend (Vercel)
1. Push to GitHub
2. Vercel auto-deploys from main branch
3. Set environment variables in Vercel dashboard

## 🔧 Environment Variables

### Backend (.env)
```env
DATABASE_URL="postgresql://user:password@localhost:5432/carepulse"
PORT=8000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Twilio (optional for development)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 👨‍💻 Learning Journey

This project was built as a learning exercise to build my skills in:
- Domain-Driven Design principles
- Full-stack TypeScript development
- State machine implementation
- Real-time system architecture
- Production deployment workflows

## 📄 License

This project is for educational purposes.