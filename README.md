# Freelance Marketplace

A modern freelancer marketplace application built with Next.js, TypeScript, Prisma, and Tailwind CSS.

## Features

- **User Management**: Registration and authentication for freelancers and customers
- **Project Posting**: Customers can post projects with budgets and deadlines
- **Freelancer Offerings**: Freelancers can create service offerings
- **Bidding System**: Freelancers can bid on projects
- **Project Monitoring**: Track project status and progress
- **Payment Integration**: Stripe integration for secure payments
- **Admin Dashboard**: Administrative functions for platform management
- **Beautiful UI**: Modern, responsive design with Tailwind CSS

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: SQLite (via Prisma) - easily switchable to PostgreSQL
- **ORM**: Prisma
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS
- **Payments**: Stripe
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your configuration:
- `DATABASE_URL`: Database connection string (default: `file:./dev.db`)
- `NEXTAUTH_SECRET`: A random secret for NextAuth (generate with `openssl rand -base64 32`)
- `NEXTAUTH_URL`: Your app URL (default: `http://localhost:3000`)
- Stripe keys (optional for development)

3. Set up the database:
```bash
npx prisma generate
npx prisma db push
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # User dashboard
│   ├── projects/          # Project pages
│   ├── freelancers/       # Freelancer pages
│   └── admin/             # Admin dashboard
├── components/            # React components
├── lib/                   # Utility functions
├── prisma/                # Prisma schema
└── types/                 # TypeScript types
```

## Key Features Implementation

### Authentication
- Secure password hashing with bcryptjs
- JWT-based sessions with NextAuth.js
- Role-based access control (Customer, Freelancer, Admin)

### Database Schema
- Users with roles
- Projects with status tracking
- Offerings for freelancers
- Bids on projects
- Payments with status tracking
- Messages for communication

### UI Components
- Responsive navigation bar
- Featured projects and freelancers sections
- Project listing and detail pages
- Dashboard with statistics
- Admin panel

## Development

### Database Management

View database in Prisma Studio:
```bash
npm run db:studio
```

Push schema changes:
```bash
npm run db:push
```

### Building for Production

```bash
npm run build
npm start
```

## Environment Variables

Required:
- `DATABASE_URL`: Database connection string
- `NEXTAUTH_SECRET`: Secret for NextAuth.js
- `NEXTAUTH_URL`: Application URL

Optional (for payments):
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Stripe publishable key
- `STRIPE_SECRET_KEY`: Stripe secret key

## License

MIT

