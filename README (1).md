# SchoolCRM — School Marks Tracker

A full-stack web application for managing student marks, built as a learning project across multiple backend languages.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Axios |
| Backend | Node.js + Express |
| Database | PostgreSQL |
| Web Server | Nginx |
| Process Manager | PM2 |
| Hosting | AWS EC2 (Ubuntu 24.04) |

---

## Project Structure

```
schoolcrm_nodejsproject/
├── backend-node/          # Node.js/Express API
│   ├── src/
│   │   ├── index.js       # Entry point
│   │   ├── db.js          # PostgreSQL connection
│   │   ├── middleware/    # Auth middleware
│   │   └── routes/        # API routes
│   └── package.json
├── frontend/              # React app
│   ├── src/
│   │   ├── api.js         # Axios config
│   │   └── ...
│   └── package.json
└── db/
    └── migrations/        # SQL migration files
        ├── 001_create_tables.sql
        ├── 002_create_indexes.sql
        └── 003_seed_data.sql
```

---

## Features

- Teacher authentication (JWT)
- Student management
- Subject management
- Test creation
- Marks entry and tracking
- Analytics per student/subject

---

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/auth/login` | Teacher login |
| GET | `/students` | List all students |
| POST | `/students` | Add student |
| GET | `/tests` | List all tests |
| POST | `/tests` | Create test |
| GET | `/marks` | Get marks |
| POST | `/marks` | Enter marks |

---

## Local Development

### Requirements

- Node.js 24+
- PostgreSQL 16+

### Backend Setup

```bash
cd backend-node
npm install
cp .env.example .env
# Edit .env with your DB credentials
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

### Environment Variables

```env
PORT=8080
DATABASE_URL=postgresql://marks_user:marks_pass_2024@localhost:5432/marks_tracker
JWT_SECRET=your_secret_key
```

---

## Production Deployment

See [DEPLOY.md](./DEPLOY.md) for full step-by-step production deployment on AWS EC2.

---

## Architecture

```
Browser
  │
  ▼
Nginx (port 80)
  ├── /*      → React frontend (static files)
  └── /api/*  → Express backend (port 8080)
                      │
                      ▼
               PostgreSQL (port 5432)
```

---

## Learning Roadmap

This project is being rebuilt across multiple backends as a deliberate learning exercise:

- [x] Rust/Axum backend
- [x] Node.js/Express backend
- [ ] Python/FastAPI backend
- [ ] Dockerize all versions
- [ ] Deploy on K3s/Kubernetes

---

## Repository

[github.com/rajkumargdev/schoolcrm_nodejsproject](https://github.com/rajkumargdev/schoolcrm_nodejsproject)
