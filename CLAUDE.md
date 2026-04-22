# books.entcheneric.com

A full-stack Next.js book tracking application with authentication and purchase option management.

## Tech Stack

- **Framework**: Next.js 15 (React 19)
- **ORM**: Prisma with MySQL
- **Auth**: NextAuth.js with JWT sessions
- **UI**: shadcn/ui components with Tailwind CSS v4
- **Icons**: Lucide React
- **Testing**: Jest (unit), Cypress (E2E)
- **Transpilation**: TypeScript + Babel (Next.js)

## Project Structure

```
├── app/                      # Next.js App Router (v15)
│   ├── [user]/              # User-specific routes
│   ├── api/                 # API routes
│   ├── actions/             # Server actions
│   ├── lib/                 # Library utilities
│   └── ui/                  # Shared UI components
├── components/              # Reusable React components
├── cypress/                 # E2E test configurations
├── prisma/                  # Prisma schema & migrations
├── public/                  # Static assets
├── __tests__/              # Unit tests
└── lib/                     # TypeScript utilities
```

## Development Workflow

### Getting Started

```bash
# Install dependencies
npm install

# Set up environment
cp example.env .env.local

# Push database schema
npx prisma db push

# Start dev server
npm run dev
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with Turbopack |
| `npm run dev:test` | Start with `.env.test` |
| `npm run build` | Production build |
| `npm run test` | Run Jest unit tests |
| `npm run cy:run` | Run Cypress E2E tests |
| `npm run cy:open` | Open Cypress in browser |
| `npm run test:e2e:full` | Full E2E suite with migration |

## Testing Strategy

- **Unit tests (Jest)**: Component tests, utility functions
- **E2E tests (Cypress)**: Full user flows in production-like environment
- **Test commands**: Use `npm run test:e2e:ci` for CI environments

## Key Configuration Files

- `package.json`: Dependencies & scripts
- `tsconfig.json`: TypeScript configuration (strict mode)
- `prisma/schema.prisma`: Database schema
- `cypress.config.ts`: E2E test configuration
- `jest.config.js`: Jest configuration

## Code Style & Conventions

- **TypeScript**: Strict mode enabled (`tsconfig.json`)
- **Components**: Functional components with hooks (React 18+)
- **State**: Prefer React Context over complex state management
- **API Routes**: Server actions preferred for form submissions
- **UI Components**: Use shadcn/ui primitives consistently

## Authentication

- Session-based auth using NextAuth.js
- JWT stored in httpOnly cookies
- Protected routes via middleware
- Registration at `/register`

## Database Schema

**Models**:
- `User`: id, url, passwordHash, title, description
- `Book`: id, title, author, description, year, pages, progress, wishlisted
- `PurchaseOptionCache`: retailer options cached for books

## Environment Variables

Required values in `.env.local`:
- `DATABASE_URL` (MySQL connection string)
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`

## CI/CD

- GitHub Actions workflows in `.github/workflows/`
- Code coverage tracking via SonarQube
- Test reports generated as Jest Sonar reporter XML

## Contributing Guidelines

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/YourFeature`)
3. Make your changes
4. Write/update tests as needed
5. Commit with meaningful messages
6. Push and open a PR

## Important Notes

- Never commit `.env.local` or `.env.test`
- Database migrations via Prisma CLI only
- All API routes use `async function` pattern
- Server actions run on form submission
- UI components use Radix UI primitives
- E2E tests require production-like environment
