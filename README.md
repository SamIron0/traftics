# Traftics

Traftics is the open source user behavioural analysis tool for modern teams.

## Getting Started

### Prerequisites

- Node.js (version 18 or later)
- pnpm (version 8.15.4 or later)
- Supabase account and CLI
- PostgreSQL (version 15)
- Git

### Development Environment

1. **Node.js**: Required for running the application and its build tools
2. **pnpm**: The package manager used for managing dependencies
3. **Supabase**: Used for:
   - Authentication
   - Database
   - Storage
   - Edge Functions
4. **PostgreSQL**: Required for local development with Supabase

### Required Services

1. **Vercel Account**: For deployment and hosting
2. **Supabase Project**: For backend services
3. **Cloudflare Account**: For hosting the tracker script

### Installation

1. Clone the repository
2. Install dependencies:

```bash
pnpm install:all
```

3. Setup your Supabase instance (refer to `apps/web/supabase/types` for table definitions)

4. Set up environment variables:
   Create a `.env.local` file in the apps/web directory and add the necessary environment
   variables (refer to `.env.example`)

5. Build the project:
```bash
pnpm build
```

6. Start the development servers:
```bash
pnpm dev
```

## License

This project is licensed under the [MIT License](LICENSE).
