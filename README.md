# Verdis

Verdis is a full-stack productivity application focused on deep-work sessions, habit consistency, and profile-based progress tracking.


- Built as a modern full-stack web app with secure authentication and persisted user data.
- Designed around clean UX flows: sign up, log in, start sessions, and review profile stats.
- Structured with scalable frontend patterns and cloud-hosted backend services.
- Emphasizes ownership across the full lifecycle: product thinking, implementation, and iteration.

## Technology Stack

### Frontend

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4
- React Context API for shared app and profile state

### Backend and Data

- Supabase Auth for user authentication
- Supabase Postgres for relational data storage
- Supabase Row Level Security (RLS) policies for per-user data protection
- Supabase database triggers for profile bootstrapping and workflow automation
- Supabase JavaScript SDK for client-to-backend integration

### Tooling and Quality

- ESLint 9 with Next.js config
- PostCSS
- npm scripts for local development, build, and production start

## Methodology

### Product and Delivery Approach

- **User-first development:** core features prioritize real user workflows over unnecessary complexity.
- **Incremental shipping:** features are delivered in focused slices to keep progress visible and reduce risk.
- **Feedback loop:** architecture supports quick iteration based on usage insights and observed friction.

### Engineering Methodology

- **Component-driven UI:** reusable React components keep the interface maintainable as features expand.
- **State management by responsibility:** local state for view logic, context for cross-page user/profile state.
- **Secure-by-default backend:** authentication, RLS, and controlled queries enforce data access boundaries.
- **Schema-aware implementation:** backend behavior leverages database rules and triggers to keep data consistent.

### Full-Stack Practices

- **Separation of concerns:** presentation, state, and data-access logic are clearly divided.
- **Operational readiness:** scripts and conventions support reliable local development and deployment flow.
- **Maintainability focus:** typed code, linting, and predictable project structure improve long-term velocity.

## Running Locally

1. Install dependencies:

   `npm install`

2. Add environment variables:

   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

3. Start development server:

   `npm run dev`

4. Build for production:

   `npm run build`
