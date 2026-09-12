# Waveflow

Waveflow is a modern Agile Project Management and CI/CD visualization platform designed specifically for software engineers. It allows teams to track daily tasks while actively monitoring GitHub Actions pipeline statuses in a centralized, real-time dashboard.

## Core Features

### 1. Automated CI/CD Monitoring
Connect projects directly to your GitHub repositories without complex OAuth setups. Waveflow exposes a dynamic webhook endpoint that listens to GitHub Actions. Whenever a pipeline finishes, the build status (SUCCESS/FAILED) updates in real-time on your Waveflow dashboard. 

### 2. Real-Time Kanban Board
Organize workflows using a drag-and-drop Kanban-style system. Powered by background short-polling, any task transitions (TODO, IN PROGRESS, REVIEW, DONE) or new tasks added by team members are instantly synchronized across all active clients without requiring a page refresh.

### 3. Role-Based Team Collaboration
Invite developers to your projects directly via their registered emails. The platform utilizes a robust Role-Based Access Control (RBAC) system, ensuring that only project Owners or Admins can invite new members, while Members can seamlessly collaborate on the shared board.

### 4. Dynamic Theme Switching (Dark Mode)
Waveflow features a native implementation of Light and Dark themes. The UI is carefully engineered using custom CSS Variables to ensure deep contrast, legibility, and seamless transitions across all components, including modals, dropdowns, and form inputs.

## Tech Stack

- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL (managed via Prisma Composer `@prisma/composer`)
- **Authentication**: Custom JWT implementation using `jose`
- **Deployment**: Vercel (Edge & Serverless architecture)

## Running Locally

### 1. Setup Environment
Clone the repository and install dependencies:
```bash
git clone https://github.com/Khairulajisyafii/Waveflow-.git
cd Waveflow-
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/waveflow"
SESSION_SECRET="your-super-secret-session-key"
```

### 3. Initialize Database
Synchronize the Prisma schema and run migrations:
```bash
npm run contract:emit
npx prisma db migrate --yes
```

### 4. Run Development Server
```bash
npm run dev
```
Visit `http://localhost:3000` to view the application.

---

<div align="center">
  <p><code>wave( Khairul Aji Syafi'i )</code></p>
  <a href="https://github.com/Khairulajisyafii">GitHub</a> • 
  <a href="https://www.instagram.com/kkkrulll/">Instagram</a> • 
  <a href="mailto:skhairulaji@gmail.com">Email</a>
</div>
