# TCS NQT Study Tracker

A simple, clean personal study tracker for TCS NQT exam preparation.

**Exam Date:** March 2027

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite + Tailwind CSS |
| Backend | Spring Boot 3.3 + Java 21 |
| Database | PostgreSQL |

---

## Project Structure

```
Progress/
├── frontend/          # React + Vite app
│   └── src/
│       ├── pages/     # Dashboard, TodaysTasks, Schedule, DsaTracker, Subjects, WeeklyProgress
│       ├── components/ # Layout, TaskModal, ConfirmDialog, ProgressBar
│       └── api.js     # Axios API service
│
└── backend/           # Spring Boot app
    └── src/main/java/com/tcs/nqt/
        ├── controller/  # REST endpoints
        ├── service/     # Business logic
        ├── repository/  # JPA repositories
        ├── entity/      # JPA entities
        └── dto/         # Data transfer objects
```

---

## Setup & Run

### Prerequisites
- Java 21
- Maven (or use the `mvnw` wrapper included)
- Node.js 18+
- PostgreSQL running locally

### 1. PostgreSQL Setup

```sql
CREATE DATABASE nqt_tracker;
-- Default user: postgres / password: postgres
```

### 2. Backend (Spring Boot)

```bash
cd backend

# Using Maven wrapper (recommended)
.\mvnw.cmd spring-boot:run

# OR if Maven is in PATH
mvn spring-boot:run
```

The backend starts on **http://localhost:8080**

> ⚙️ Edit `src/main/resources/application.properties` to change DB credentials.

### 3. Frontend (React)

```bash
cd frontend
npm install   # only needed first time
npm run dev
```

The frontend starts on **http://localhost:5173**

---

## Features

### Dashboard
- Days remaining to exam (March 2027)
- Today's task completion summary
- Striver DSA progress snapshot
- Subject progress overview

### Today's Tasks ✅
- View tasks for any date
- Checkbox to mark tasks complete (persisted in DB)
- Add / Edit / Delete tasks with confirmation dialog
- Progress bar showing completion %

### Schedule 🕐
- Default daily schedule (7AM – 9:45PM)
- Fully editable — add, edit, delete slots

### DSA Tracker 📖
- 110-hour Striver DSA target
- Manual hours input
- Progress bar + remaining hours

### Subjects 📊
- Per-subject progress (slider + number input)
- Save updates to DB

### Weekly Progress 📅
- Mon–Sun view of current week
- Tasks completed / total per day

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks?date=YYYY-MM-DD` | Get tasks by date |
| GET | `/api/tasks/range?start=...&end=...` | Get tasks by date range |
| POST | `/api/tasks` | Create task |
| PUT | `/api/tasks/{id}` | Update task |
| PATCH | `/api/tasks/{id}/toggle` | Toggle complete |
| DELETE | `/api/tasks/{id}` | Delete task |
| GET | `/api/dsa-progress` | Get DSA progress |
| PUT | `/api/dsa-progress` | Update DSA hours |
| GET | `/api/subject-progress` | Get all subjects |
| PUT | `/api/subject-progress/{id}` | Update subject % |
| GET | `/api/schedule` | Get schedule |
| POST | `/api/schedule` | Add schedule item |
| PUT | `/api/schedule/{id}` | Edit schedule item |
| DELETE | `/api/schedule/{id}` | Delete schedule item |
