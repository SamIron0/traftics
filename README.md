# Traftics

Traftics is the open source user behavioral analysis tool for modern teams.

## Project Structure

- `apps/web` - Main web application
- `apps/landing` - Landing page
- `apps/docs` - Documentation site
- `packages/tracker` - Session recording tracker script

## Prerequisites

- Node.js (version 18 or later)
- pnpm (version 8.15.4)
- Supabase account and CLI
- PostgreSQL (version 15)
- Vercel account
- Cloudflare account
- Git

## Required Services Setup

1. **Supabase Project**
   - Create a new project
   - Set up the database tables using migrations in `apps/web/supabase/migrations`
   - Configure storage buckets for session recordings

2. **Vercel Account**
   - For deploying the web app, landing page, and docs
   - Configure environment variables

3. **Cloudflare Account**
   - For hosting the tracker script
   - Set up Cloudflare Pages project

## Local Development

1. Clone the repository:

```bash
git clone https://github.com/SamIron0/traftics.git
cd traftics
```

2. Install dependencies:
```bash
pnpm install:all
```

3. Set up environment variables:
   - Copy `.env.example` to `.env.local` in the `apps/web` directory
   - Configure the following variables:
     - Supabase credentials
     - Stripe keys (if using payments)
     - Other service configurations

4. Start development servers:
```bash
pnpm dev
```

This will start:
- Web app on port 3000
- Landing page on port 3001
- Documentation on port 3002
- Tracker development server

## Building for Production

1. Build all packages:
```bash
pnpm build
```

This builds:
- Tracker script
- Web application
- Documentation site
- Landing page

## Deployment

### Deploy Web App
```bash
pnpm deploy:web
```

### Deploy Tracker
```bash
pnpm deploy:tracker
```

### Deploy Documentation
```bash
pnpm deploy:docs
```

### Deploy All
```bash
pnpm deploy:all
```

## Testing

Run tests for the web application:
```bash
cd apps/web
pnpm test
```

## License

This project is licensed under the [MIT License](LICENSE).
