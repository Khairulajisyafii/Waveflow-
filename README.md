# Waveflow

Waveflow is a modern, lightweight Task Management and CI/CD visualization platform designed specifically for developers. It helps you track your projects, manage daily tasks, and monitor your GitHub Actions CI/CD deployments all in one clean dashboard.

## Features

- **Project & Task Management**: Create projects, invite members, and assign tasks with priority and status tracking (TODO, IN PROGRESS, DONE).
- **GitHub CI/CD Integration**: Connect your projects to GitHub repositories and automatically track deployment statuses (SUCCESS/FAILED) via webhook integrations.
- **Developer-First Dashboard**: A sleek, real-time dashboard displaying quick stats, pending tasks, and active CI/CD connections.
- **Customizable Profile**: Supports custom avatar links, username modifications, and password management.
- **Modern UI/UX**: Built-in Dark Mode , English & Indonesian language support (i18n), and fully responsive design.
- **Secure Authentication**: End-to-end secure login and registration using Bcrypt password hashing and JOSE (JSON Web Tokens) for stateless sessions.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL (via [Prisma Composer](https://prisma.io/))
- **Authentication**: `jose` for edge-compatible JWT, `bcryptjs` for hashing
- **Styling**: Native CSS with CSS Variables for dynamic theming (Dark/Light Mode)
- **Deployment**: Optimized for Vercel

## Running Locally

Follow these steps to set up Waveflow on your local machine:

### 1. Prerequisites

- Node.js (v18 or higher)
- A PostgreSQL database (e.g., local server, Supabase, or Neon)

### 2. Clone the Repository

```bash
git clone https://github.com/Khairulajisyafii/Waveflow-.git
cd Waveflow-
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Create a `.env` file in the root directory and add the following variables:

```env
# Your PostgreSQL connection string
DATABASE_URL="postgresql://user:password@localhost:5432/waveflow?schema=public"

# Secret key for JWT sessions (Use a strong random string)
SESSION_SECRET="your-super-secret-session-key"

# Secret key for GitHub Webhooks
CI_WEBHOOK_SECRET="your-webhook-secret"
```

### 5. Database Setup (Prisma Composer)

Sync the Prisma schema with your PostgreSQL database:

```bash
npm run contract:emit
npx prisma db migrate --yes
```

### 6. Start the Development Server

```bash
npm run dev
```

Your app will be running at [http://localhost:3000](http://localhost:3000).

## 🔄 GitHub Actions Setup (CI/CD Webhooks)

To enable the CI/CD indicator (the green/red dots on your dashboard), add a webhook step to your GitHub Actions `.yml` workflow:

```yaml
- name: Waveflow Deployment Status
  if: always()
  run: |
    curl -X POST https://your-waveflow-domain.vercel.app/api/ci/webhook \
      -H "Content-Type: application/json" \
      -d '{
        "secret": "${{ secrets.CI_WEBHOOK_SECRET }}",
        "githubRepo": "${{ github.repository }}",
        "ciStatus": "${{ job.status }}"
      }'
```

---

<div align="center">
  <p><code>wave( Khairul Aji Syafi'i )</code></p>
  <a href="https://github.com/Khairulajisyafii">GitHub</a> • 
  <a href="https://www.instagram.com/kkkrulll/">Instagram</a> • 
  <a href="mailto:skhairulaji@gmail.com">Email</a>
</div>
