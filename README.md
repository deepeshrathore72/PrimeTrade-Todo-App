# TaskFlow - Scalable Task Management Application

A full-stack task management application built with Next.js 14, featuring secure authentication with OAuth support (Google & GitHub), MongoDB database, and a modern responsive dashboard.

![Next.js](https://img.shields.io/badge/Next.js-14.2-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-8.2-green)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-cyan)
![NextAuth](https://img.shields.io/badge/NextAuth-5.0-purple)

## ✨ Features

### 🔐 Authentication
- ✅ User registration with email/password
- ✅ **OAuth Login** (Google & GitHub)
- ✅ Secure JWT token authentication
- ✅ NextAuth.js v5 integration
- ✅ HTTP-only cookie storage (XSS protection)
- ✅ Password hashing with bcrypt (12 rounds)
- ✅ Protected routes with middleware
- ✅ OAuth users can optionally set password for email login
- ✅ Automatic session management

### 📋 Task Management
- ✅ Full CRUD operations
- ✅ Status tracking (Todo, In Progress, Completed)
- ✅ Priority levels (Low, Medium, High, Urgent)
- ✅ Due date management
- ✅ Tag support for organization
- ✅ Search functionality
- ✅ Filter by status and priority
- ✅ Pagination support

### 📊 Dashboard
- ✅ Overview with statistics
- ✅ Task completion rate visualization
- ✅ Recent tasks display
- ✅ Responsive sidebar navigation
- ✅ User profile management
- ✅ Password management (set/change)
- ✅ Settings page

### 🎨 UI/UX
- ✅ Modern, clean design
- ✅ Smooth animations with Framer Motion
- ✅ Fully responsive (mobile-first)
- ✅ Toast notifications
- ✅ Loading states and skeletons
- ✅ Modal dialogs
- ✅ Form validation feedback

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| Frontend | Next.js 14, React 18, TypeScript |
| Styling | TailwindCSS, Framer Motion |
| Backend | Next.js API Routes |
| Database | MongoDB, Mongoose |
| Authentication | NextAuth.js v5, JWT, bcrypt |
| OAuth Providers | Google, GitHub |
| Validation | Zod |
| Icons | Lucide React |

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── [...nextauth]/route.ts  # NextAuth handler
│   │   │   ├── login/route.ts
│   │   │   ├── register/route.ts
│   │   │   ├── logout/route.ts
│   │   │   └── me/route.ts
│   │   ├── user/
│   │   │   └── profile/route.ts
│   │   └── tasks/
│   │       ├── route.ts
│   │       └── [id]/route.ts
│   ├── auth/
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   └── error/page.tsx
│   └── dashboard/
│       ├── layout.tsx
│       ├── page.tsx
│       ├── tasks/page.tsx
│       ├── profile/page.tsx
│       └── settings/page.tsx
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Textarea.tsx
│   │   ├── Select.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   ├── Toaster.tsx
│   │   ├── Badge.tsx
│   │   ├── Loading.tsx
│   │   └── Avatar.tsx
│   └── dashboard/
│       └── Navigation.tsx
├── context/
│   ├── AuthContext.tsx
│   └── Providers.tsx
├── lib/
│   ├── db/
│   │   ├── mongoose.ts
│   │   └── models/
│   │       ├── User.ts
│   │       └── Task.ts
│   ├── auth/
│   │   ├── auth.config.ts    # NextAuth configuration
│   │   ├── index.ts          # Auth exports
│   │   ├── jwt.ts
│   │   └── middleware.ts
│   ├── utils/
│   │   ├── apiResponse.ts
│   │   ├── rateLimiter.ts
│   │   ├── security.ts
│   │   └── logger.ts
│   └── validations/
│       └── index.ts
├── types/
│   └── next-auth.d.ts        # NextAuth type extensions
└── middleware.ts
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18.17 or later
- MongoDB database (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd "PrimeTrade Ai - Assignment"
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:**
   Create a `.env.local` file in the root directory:
   ```env
   # MongoDB Connection
   MONGODB_URI=mongodb://localhost:27017/taskflow
   # Or for MongoDB Atlas:
   # MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/taskflow

   # JWT Secret (generate a secure random string)
   JWT_SECRET=your-super-secure-jwt-secret-key-change-this-in-production

   # NextAuth Configuration
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-nextauth-secret-key-change-in-production
   AUTH_SECRET=your-nextauth-secret-key-change-in-production

   # Google OAuth (https://console.cloud.google.com/apis/credentials)
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret

   # GitHub OAuth (https://github.com/settings/developers)
   GITHUB_CLIENT_ID=your-github-client-id
   GITHUB_CLIENT_SECRET=your-github-client-secret

   # Node Environment
   NODE_ENV=development
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGODB_URI` | MongoDB connection string | Yes |
| `JWT_SECRET` | Secret key for JWT signing | Yes |
| `NEXTAUTH_URL` | Application URL (e.g., http://localhost:3000) | Yes |
| `NEXTAUTH_SECRET` | NextAuth secret key | Yes |
| `AUTH_SECRET` | Auth secret (same as NEXTAUTH_SECRET) | Yes |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID | For Google login |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret | For Google login |
| `GITHUB_CLIENT_ID` | GitHub OAuth Client ID | For GitHub login |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth Client Secret | For GitHub login |
| `NODE_ENV` | Environment (development/production) | No |

### Setting up OAuth Providers

#### Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create a new project or select existing one
3. Go to **Credentials** → **Create Credentials** → **OAuth client ID**
4. Select **Web application**
5. Add **Authorized JavaScript origins**: `http://localhost:3000`
6. Add **Authorized redirect URIs**: `http://localhost:3000/api/auth/callback/google`
7. Copy the Client ID and Client Secret to your `.env.local`

#### GitHub OAuth Setup
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **New OAuth App**
3. Set **Homepage URL**: `http://localhost:3000`
4. Set **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
5. Copy the Client ID and generate a Client Secret to your `.env.local`

## 📖 API Documentation

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for detailed API endpoints documentation.

### Quick Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/logout` | User logout |
| GET | `/api/auth/me` | Get current user |
| GET/POST | `/api/auth/[...nextauth]` | NextAuth handlers (OAuth) |
| GET | `/api/user/profile` | Get user profile |
| PUT | `/api/user/profile` | Update profile |
| PATCH | `/api/user/profile` | Change/Set password |
| GET | `/api/tasks` | List tasks (with filters) |
| POST | `/api/tasks` | Create task |
| GET | `/api/tasks/:id` | Get task |
| PUT | `/api/tasks/:id` | Update task |
| PATCH | `/api/tasks/:id` | Partial update |
| DELETE | `/api/tasks/:id` | Delete task |

### Authentication Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    Authentication Options                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│  │   Email/    │    │   Google    │    │   GitHub    │     │
│  │  Password   │    │   OAuth     │    │   OAuth     │     │
│  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘     │
│         │                  │                  │             │
│         ▼                  ▼                  ▼             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              NextAuth.js Session                     │   │
│  │         (Unified authentication layer)               │   │
│  └─────────────────────────────────────────────────────┘   │
│                          │                                  │
│                          ▼                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Protected Dashboard                     │   │
│  │         (Tasks, Profile, Settings)                   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘

OAuth User Password Flow:
─────────────────────────
1. User signs up via Google/GitHub → Account created (no password)
2. User can always login via OAuth provider
3. To enable email/password login:
   - Go to Profile → Security → Set Password
   - Or register with same email to set password
```

## 🏗️ Architecture & Scaling

### Current Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client (Browser)                      │
│                    Next.js React Components                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Next.js Application                      │
│  ┌──────────────────┐  ┌──────────────────────────────────┐ │
│  │   Pages/Routes   │  │         API Routes               │ │
│  │   (SSR/CSR)      │  │    (RESTful Endpoints)           │ │
│  └──────────────────┘  └──────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      MongoDB Database                        │
│              (Users, Tasks Collections)                      │
└─────────────────────────────────────────────────────────────┘
```

### Scaling Recommendations

#### 1. **Database Scaling**

```javascript
// Current: Single MongoDB connection with caching
// For scale:
// - Use MongoDB Atlas with auto-scaling
// - Implement read replicas for read-heavy workloads
// - Add indexes for frequently queried fields:

// Recommended indexes (already in models):
// tasks: { user: 1, status: 1 }
// tasks: { user: 1, createdAt: -1 }
// tasks: { title: 'text', description: 'text' }
```

#### 2. **Caching Layer**

```javascript
// Add Redis for session/cache management
// Example: Cache frequent queries
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

// Cache user tasks with TTL
async function getCachedTasks(userId: string) {
  const cached = await redis.get(`tasks:${userId}`);
  if (cached) return JSON.parse(cached);
  
  const tasks = await Task.find({ user: userId });
  await redis.setex(`tasks:${userId}`, 300, JSON.stringify(tasks));
  return tasks;
}
```

#### 3. **API Rate Limiting**

```javascript
// Add rate limiting middleware
// Recommended: express-rate-limit or custom implementation
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
});
```

#### 4. **Authentication Improvements**

```javascript
// Current implementation includes:
// ✅ OAuth providers (Google, GitHub) via NextAuth.js v5
// ✅ Hybrid auth: Both session-based (OAuth) and JWT (credentials)
// ✅ OAuth users can optionally set password for email login
// ✅ Unified authentication middleware

// Future enhancements:
// - Add refresh tokens for JWT
// - Add more OAuth providers (Apple, Microsoft)
// - Add 2FA support
// - Consider Auth0 or Clerk for managed auth at scale
```

#### 5. **Infrastructure Scaling**

```
Production Architecture:
┌─────────────────┐     ┌─────────────────┐
│   CloudFlare    │────▶│   Load Balancer │
│   (CDN/WAF)     │     │   (nginx/ALB)   │
└─────────────────┘     └────────┬────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Next.js #1    │     │   Next.js #2    │     │   Next.js #3    │
│   (Vercel/AWS)  │     │   (Vercel/AWS)  │     │   (Vercel/AWS)  │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌────────────┼────────────┐
                    │            │            │
                    ▼            ▼            ▼
           ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
           │   MongoDB   │ │    Redis    │ │     S3      │
           │   Atlas     │ │   Cluster   │ │   (Files)   │
           └─────────────┘ └─────────────┘ └─────────────┘
```

#### 6. **Monitoring & Observability**

```javascript
// Add monitoring:
// - Sentry for error tracking
// - LogRocket for session replay
// - DataDog or New Relic for APM
// - Prometheus + Grafana for metrics

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
});
```

### Performance Optimizations

1. **Image Optimization:** Use Next.js Image component
2. **Code Splitting:** Automatic with Next.js App Router
3. **API Response Compression:** Enable gzip in production
4. **Database Connection Pooling:** Already implemented
5. **Static Generation:** Use SSG where possible

## 🔒 Security Features

### Implemented Security Measures
- ✅ HTTP-only cookies (prevents XSS attacks)
- ✅ Password hashing with bcrypt (12 rounds)
- ✅ Input validation with Zod schemas
- ✅ Protected API routes with authentication middleware
- ✅ CSRF protection via SameSite cookies
- ✅ Environment variables for secrets
- ✅ Rate limiting on authentication endpoints
- ✅ SQL/NoSQL injection prevention
- ✅ Security headers (XSS, HSTS, etc.)
- ✅ OAuth 2.0 with PKCE flow

### Additional Security Recommendations

```javascript
// Add security headers (in next.config.js)
const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
];
```

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run e2e tests
npm run test:e2e

# Run with coverage
npm run test:coverage
```

### Recommended Testing Stack

- **Unit Tests:** Jest + React Testing Library
- **API Tests:** Supertest
- **E2E Tests:** Playwright or Cypress
- **Load Testing:** k6 or Artillery

## 📦 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Docker

```dockerfile
# Dockerfile
FROM node:18-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
ENV PORT 3000
CMD ["node", "server.js"]
```

### Environment Setup for Production

```env
# .env.production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/taskflow
JWT_SECRET=<generate-256-bit-random-string>
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=<generate-256-bit-random-string>
AUTH_SECRET=<generate-256-bit-random-string>
GOOGLE_CLIENT_ID=your-production-google-client-id
GOOGLE_CLIENT_SECRET=your-production-google-client-secret
GITHUB_CLIENT_ID=your-production-github-client-id
GITHUB_CLIENT_SECRET=your-production-github-client-secret
NODE_ENV=production
```

> **Note:** For production OAuth, update your Google/GitHub OAuth app settings with your production domain URLs.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👤 Author

Built with ❤️ for PrimeTrade AI Assignment

---

## 📸 Screenshots

### Login Page
Modern authentication with email/password and OAuth options (Google & GitHub).

### Dashboard
Overview with task statistics, completion rate visualization, and recent activity.

### Tasks Page
Full task management with search, filters, and CRUD operations.

### Profile Page
User profile management with avatar support and password settings.

---
