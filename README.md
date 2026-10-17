# Urban Community — Management Panel

![React 19](https://img.shields.io/badge/React-19-61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6)
![Vite](https://img.shields.io/badge/Vite-8-646CFF)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**English** | [Türkçe](README.tr.md)

The web panel of Urban Community, an AI-assisted platform for reporting and resolving urban issues.
Admins manage the whole platform; officials handle the reports routed to their department within their
jurisdiction.

## Repositories

| Repository | Description |
| --- | --- |
| [urban-community-backend](https://github.com/berkanserbes/urban-community-backend) | ASP.NET Core API, RabbitMQ consumers, PostgreSQL/PostGIS |
| [urban-community-ai-service](https://github.com/berkanserbes/urban-community-ai-service) | FastAPI service for categorization, priority scoring and duplicate detection |
| **[urban-community-management-web](https://github.com/berkanserbes/urban-community-management-web)** | React admin and official panel (this repository) |
| [urban-community-mobile](https://github.com/berkanserbes/urban-community-mobile) | Expo / React Native citizen app |

See the [backend README](https://github.com/berkanserbes/urban-community-backend#readme) for the overall
architecture.

## Features

### Admin

- Dashboard with report, suggestion and user statistics and charts
- Report management with search, status, priority and assignment filters, and manual department assignment
- Official accounts: create an official with a temporary password, set their department and jurisdiction
- Organizations, departments, report categories, provinces, districts and neighborhoods
- Announcements, suggestions (status changes and official responses) and notifications

### Official

- Dashboard for the reports assigned to their department
- Report workflow: confirm, start, resolve or reject a report and change its priority
- Suggestions: move them through review and close them with an official response
- Comments on reports and suggestions
- Announcements for their own jurisdiction

### Shared

- JWT sign-in with automatic token refresh and a forced password change for temporary passwords
- Role-based routing between the admin and official areas
- Server-side pagination and filtering on every list, with debounced search where lists are searchable
- Light and dark theme

## Tech stack

| Area | Technologies |
| --- | --- |
| Framework | React 19, TypeScript, Vite |
| Data fetching | TanStack Query, Axios |
| Tables | TanStack Table |
| State | Zustand |
| Forms | React Hook Form, Zod |
| UI | Tailwind CSS 4, Radix UI primitives, Lucide icons, Sonner |
| Charts | Recharts |
| Routing | React Router |

## Project structure

```text
urban-community-admin/src/
├── app/          # Router, layouts and dashboard pages
├── components/   # Shared components and UI primitives
├── features/     # One folder per domain: api/, hooks/, components/, pages/
├── hooks/        # Shared hooks
├── lib/          # Axios client, API result helpers, utilities
├── stores/       # Zustand stores (authentication)
└── types/        # API types shared across features
```

## Getting started

### Prerequisites

- Node.js 20.19+ or 22.12+ and [pnpm](https://pnpm.io/)
- A running backend API (see the [backend README](https://github.com/berkanserbes/urban-community-backend#getting-started))

### Run

```bash
cd urban-community-admin
pnpm install
cp .env.example .env.development   # set VITE_API_BASE_URL if the API is not on http://localhost:5000
pnpm dev
```

Sign in with an admin account. In development the backend can create one from the `DEV_ADMIN_*`
settings.

### Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Start the development server |
| `pnpm build` | Type-check and build for production |
| `pnpm lint` | Run ESLint |
| `pnpm preview` | Preview the production build |

## License

This project is licensed under the [MIT License](LICENSE).
