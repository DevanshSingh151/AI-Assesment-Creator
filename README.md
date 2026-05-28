<div align="center">
  <img src="frontend/public/teacher_avatar.png" width="120" height="120" style="border-radius: 50%; box-shadow: 0 8px 30px rgba(0,0,0,0.15);" alt="VedaAI Logo" />

  # ✦ VedaAI — AI Assessment Creator

  > An AI-powered assessment generation platform that enables teachers to create structured question papers using Google Gemini AI, featuring real-time generation tracking via WebSockets and an automated local process fallback queue.

  [![Next.js 15](https://img.shields.io/badge/Next.js-15.x-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
  [![Express 4](https://img.shields.io/badge/Express-4.x-green?style=for-the-badge&logo=express)](https://expressjs.com/)
  [![MongoDB](https://img.shields.io/badge/MongoDB-8.x-mediumseagreen?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
  [![Redis](https://img.shields.io/badge/Redis-7.x-red?style=for-the-badge&logo=redis)](https://redis.io/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
</div>

---

## 🏗️ System Architecture & Data Flow

Below is the architectural diagram mapping the client-server interactions, AI pipeline, and fail-safe queuing mechanism:

```mermaid
graph TD
    %% Frontend Layer
    subgraph Frontend [Next.js Client (Port 3000)]
        UI[Form UI & Dashboard] <--> Store[Zustand Store]
        Store <--> WS_Client[Socket.IO Client]
    end

    %% Backend Layer
    subgraph Backend [Express API Server (Port 5000)]
        Routes[API Router]
        IO[Socket.IO Server]
        
        %% Fallback System
        subgraph Fallback_System [Robust Job Queue System]
            Queue[BullMQ Queue Manager]
            LocalRunner[Local In-Memory Runner]
            Worker[BullMQ Workers]
        end
        
        Services[AI & PDF Services]
    end

    %% Infrastructure & External APIs
    subgraph Databases [Data Storage]
        DB[(MongoDB Database)]
        Cache[(Redis Cache Server)]
    end

    subgraph External [AI Models]
        Gemini[Google Gemini 2.5 Flash]
    end

    %% Flows
    UI -- "1. Form Submitted (POST)" --> Routes
    Routes -- "2. Attempts Queueing" --> Queue
    Queue -- "3a. If Redis connected" --> Cache
    Cache --> Worker
    Queue -- "3b. If Redis down (Fallback)" --> LocalRunner
    
    Worker -- "4a. Calls AI" --> Services
    LocalRunner -- "4b. Calls AI" --> Services
    
    Services -- "5. Prompt Request" --> Gemini
    Gemini -- "6. Returns Structured JSON" --> Services
    
    Services -- "7. Saves Paper" --> DB
    
    Worker -- "8a. Progress Event" --> IO
    LocalRunner -- "8b. Progress Event" --> IO
    
    IO -- "9. Live Update (WebSockets)" --> WS_Client
    WS_Client --> UI
```

---

## 🛠️ Key Engine Details

### ⚡ The Fail-Safe Generation Engine (Queue Fallback)
To ensure maximum availability (even during local Redis setup delays or VM network bridges):
1. **Queue Attempt:** The backend tries to dispatch background generation tasks to Redis using **BullMQ**.
2. **Graceful Fallback:** If Redis is down, times out, or triggers connection errors, the engine launches an asynchronous **Local In-Memory Runner** in the Node.js thread.
3. **Transparent Sync:** Both runners share identical interfaces—updating status in MongoDB and pushing live percentage updates via WebSockets. The teacher experience is completely uninterrupted.

### 📄 Intelligent Prompt Compiler & PDF Builder
- **Dynamic Prompts:** Consolidates grade-level, duration, marks, question distributions, and uploaded source materials into an instructional prompt.
- **Strict Schema Enforcement:** Leverages Gemini 2.5 Flash API with JSON-mode constraint definitions to enforce compliant question papers.
- **Clean PDF Layouts:** Renders beautiful, formatted question sheets using `jsPDF` with standard exam outlines, student name grids, difficulty labels, and distinct mark tags.

---

## 🎨 Premium UI/UX Design System
The client-side layout is built with custom CSS (no external Tailwind classes) following high-fidelity specs:
- **White Sidebar navigation:** Clean `#ffffff` panel containing the stylized brand icon, capsule outline CTA, menu badges, and a custom profile card showing the school details.
- **Dark Mode Workspace:** Black background (#000000) contrasting with glassmorphic input cards.
- **Cream Document View:** The output page renders papers inside a soft cream-white sheet component floating on the dark layout to feel like physical sheets.
- **Micro-animations:** Glow highlights on select boxes, slide-ups on card grids, and linear checkmarks on generation tasks.

---

## 📁 Directory Structures

```text
AI-Assessment-Creator/
├── frontend/                    # Next.js 15 Client Application
│   ├── public/                  # Avatars and static SVGs
│   ├── src/
│   │   ├── app/                 # Next.js App Router (create, dashboard, toolkit, library)
│   │   ├── components/          # Layout, forms, and preview sheets
│   │   ├── store/               # Zustand hooks state store
│   │   └── hooks/               # Custom Socket.IO sync hook
│   └── globals.css              # Dark/light theme custom stylesheet
│
├── backend/                     # Express.js API Backend
│   ├── src/
│   │   ├── config/              # Database & Redis client boot
│   │   ├── models/              # MongoDB Schema
│   │   ├── routes/              # Express Router
│   │   ├── queues/              # BullMQ & Local runner worker tasks
│   │   └── services/            # Gemini prompt compiler and PDF builder
│   └── tsconfig.json
│
├── docker-compose.yml           # Local Redis image launcher
└── README.md                    # System documentation
```

---

## 🚀 Running Locally

### 1. Prerequisites
- **Node.js** >= 18.x
- **MongoDB** running locally on default port `27017`
- **Redis** running locally (or via Docker) on port `6379`
- **Google Gemini API Key**

### 2. Startup Guide

#### Clone and Initialize
```bash
git clone https://github.com/DevanshSingh151/AI-Assesment-Creator.git
cd AI-Assesment-Creator
```

#### Run Redis via Docker
```bash
docker-compose up -d
```

#### Configure and Run Backend
1. Enter backend folder:
   ```bash
   cd backend
   ```
2. Setup environment variables in a `.env` file:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/vedaai
   REDIS_HOST=localhost
   REDIS_PORT=6379
   GEMINI_API_KEY=AIzaSyBPcgh7rTAgjspnC1e58UVRmkiJFI2K75o
   CORS_ORIGIN=http://localhost:3000
   ```
3. Install and run in development mode:
   ```bash
   npm install
   npm run dev
   ```

#### Configure and Run Frontend
1. Open a new shell and enter the frontend folder:
   ```bash
   cd ../frontend
   ```
2. Build dependencies and start:
   ```bash
   npm install
   npm run dev
   ```
3. Open `http://localhost:3000` to interact with the platform.

---

## 📡 API Reference & Socket Events

### API Endpoints (`http://localhost:5000/api`)

| Method | Endpoint | Payload | Response |
| :--- | :--- | :--- | :--- |
| `POST` | `/assignments` | Multipart form (fields + file) | `{ success, assignmentId, jobId }` |
| `GET` | `/assignments` | None | `Array<IAssignment>` |
| `GET` | `/assignments/:id` | None | `IAssignment` |
| `POST` | `/assignments/:id/regenerate` | None | `{ success, jobId }` |
| `GET` | `/assignments/:id/pdf` | None | Renders PDF stream download |

### WebSocket Events (Room `assignment:<id>`)

- `join:assignment` — Joins the Socket.io room using the target assessment ID.
- `generation:progress` — Emits real-time state logs:
  - `Analyzing requirements...`
  - `Generating questions...`
  - `Formatting paper...`
- `generation:completed` — Returns the full structured question paper JSON.
- `generation:failed` — Dispatches error logs if generation fails.
