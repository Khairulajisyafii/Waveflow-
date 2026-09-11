# Waveflow

Waveflow is a modern, lightweight Agile Project Management and CI/CD visualization platform designed specifically for software engineers. It allows teams to track daily tasks while actively monitoring GitHub Actions pipeline statuses in a centralized dashboard.

## Core Features

- **Agile Task Management**: Organize workflows using a Kanban-style system. Create tasks, set priorities, and transition them across states (TODO, IN PROGRESS, DONE).
- **Automated CI/CD Monitoring**: Connect projects directly to your GitHub repositories. Waveflow exposes a dynamic webhook endpoint that listens to GitHub Actions, updating the build status (SUCCESS/FAILED) in real-time on your dashboard.
- **Team Collaboration**: Invite members to your projects via email with role-based access control (Owner, Admin, Member).
- **Secure Authentication**: End-to-end secure user management, utilizing Bcrypt for password hashing and JOSE (JSON Web Tokens) for stateless sessions.
- **Modern Architecture**: Built for the Edge, featuring Dark/Light mode, i18n support (English/Indonesian), and a fully responsive interface.

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL (managed via Prisma Composer `@prisma/composer`)
- **Authentication**: Custom JWT implementation using `jose`
- **Deployment**: Vercel (Edge & Serverless architecture)

## Running Locally

Follow these steps to set up Waveflow on your local machine:

### 1. Prerequisites

- Node.js (v18 or higher)
- A PostgreSQL database (e.g., Neon, Supabase, or local)

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

Create a `.env` file in the root directory:

```env
# Your PostgreSQL connection string
DATABASE_URL="postgresql://user:password@localhost:5432/waveflow"

# Secret key for JWT sessions (Minimum 32 characters)
SESSION_SECRET="your-super-secret-session-key"
```

### 5. Database Setup (Prisma)

Synchronize the Prisma schema and run migrations:

```bash
npm run contract:emit
npx prisma db migrate --yes
```

### 6. Start the Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to view the application.

## GitHub Actions Integration (CI/CD)

Waveflow serves as a centralized dashboard for your pipeline health. To connect a GitHub repository:

1. Create a project in Waveflow and navigate to the **Integrations** tab.
2. Enter your repository name (e.g., `owner/repo`).
3. Copy the dynamically generated YAML configuration provided in the dashboard.
4. Paste the configuration into your repository's `.github/workflows/ci.yml` file.

Example Webhook Integration:

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: ["main", "master"]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v3

      # Execute your tests and build commands here

      - name: Update CI Status to Waveflow
        if: always()
        run: |
          curl -X POST https://your-waveflow-domain.vercel.app/api/ci/webhook \
            -H "Content-Type: application/json" \
            -d '{
              "secret": "YOUR_PROJECT_UNIQUE_UUID",
              "githubRepo": "${{ github.repository }}",
              "ciStatus": "${{ job.status }}"
            }'
```

*Note: The Waveflow dashboard automatically generates the exact payload with your project's unique token. No GitHub Secrets configuration is required.*

---

<div align="center">
  <p><code>wave( Khairul Aji Syafi'i )</code></p>
  <a href="https://github.com/Khairulajisyafii">GitHub</a> • 
  <a href="https://www.instagram.com/kkkrulll/">Instagram</a> • 
  <a href="mailto:skhairulaji@gmail.com">Email</a>
</div>
