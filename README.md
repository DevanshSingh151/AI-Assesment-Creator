# VedaAI — AI Assessment Creator

> An AI-powered assessment generation platform that enables teachers to create structured question papers using Google Gemini AI, featuring real-time generation tracking via WebSockets and an automated local process fallback queue.

[![VedaAI](https://img.shields.io/badge/VedaAI-Assessment%20Creator-7c3aed?style=for-the-badge)](#)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Express](https://img.shields.io/badge/Express-4-green?style=flat-square&logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8-green?style=flat-square&logo=mongodb)](https://www.mongodb.com/)
[![Redis](https://img.shields.io/badge/Redis-7-red?style=flat-square&logo=redis)](https://redis.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)

---

## 🏗️ System Architecture & Data Flow

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

### The Fail-Safe Generation Engine (Queue Fallback)

To handle virtual machine connection limits and firewall blocks (common in WSL2 and VPN setups), the backend employs a hybrid **Fail-Safe Queuing Engine**:

1. **Attempt BullMQ:** The API tries to enqueue the assessment job to Redis via BullMQ with a `1.5s` timeout limit.
2. **Local Fallback:** If Redis is down or times out, the server triggers a **local background runner** in the Node thread itself. It runs the exact same prompts, processes the Gemini 2.5-flash response, saves it to MongoDB, and pushes live event updates to Socket.IO.
3. **Seamless Client Transition:** The frontend remains completely unaware of whether BullMQ or the local background process ran the task, since both update the status in MongoDB and emit WebSocket events (`generation:progress`, `generation:completed`) seamlessly.

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | Next.js 15, React, TypeScript | Main client layout and routing |
| **State Management** | Zustand | Lightweight client stores (form caching, notification tracking) |
| **Real-time** | Socket.IO Client | Real-time WebSocket listener for generation stages |
| **Styling** | Vanilla CSS (`globals.css`) | Curated premium high-contrast dark theme with glassmorphic cards |
| **Backend** | Express.js, Node.js, TypeScript | Core REST endpoints & WebSocket server |
| **Database** | MongoDB + Mongoose | Schema definitions for assignments and question sheets |
| **Caching/Queue** | Redis + BullMQ | Background asynchronous worker queues |
| **AI Models** | Google Gemini 2.5 Flash | Structured exam paper prompt generation |
| **PDF Rendering** | jsPDF | Print-ready PDF compiler |

---

## 🚀 Installation & Running Locally

### Prerequisites
- **Node.js** >= 18.x
- **MongoDB** running locally (`mongodb://localhost:27017/vedaai`)
- **Redis** running locally or via Docker on port `6379`
- **Google Gemini API Key**

---

### Step-by-Step Setup

#### 1. Clone the repository
```bash
git clone https://github.com/DevanshSingh151/AI-Assesment-Creator.git
cd AI-Assesment-Creator
```

#### 2. Start Redis Container
If you have Docker installed:
```bash
docker-compose up -d
```
Otherwise, ensure your local Redis service is active on port `6379`.

#### 3. Backend Setup
1. Open the backend directory and configure the environment variables:
   ```bash
   cd backend
   ```
2. Check or create a `.env` file containing:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/vedaai
   REDIS_HOST=localhost
   REDIS_PORT=6379
   GEMINI_API_KEY=AIzaSyBPcgh7rTAgjspnC1e58UVRmkiJFI2K75o
   CORS_ORIGIN=http://localhost:3000
   ```
3. Install dependencies and start the watcher:
   ```bash
   npm install
   npm run dev
   ```

#### 4. Frontend Setup
1. Open a new terminal in the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install packages and start Next.js dev server:
   ```bash
   npm install
   npm run dev
   ```
3. Open your browser and navigate to `http://localhost:3000`.

---

## 📡 API Reference

### Express API endpoints (`http://localhost:5000/api`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/assignments` | Fetches all created assessments for the dashboard |
| `POST` | `/assignments` | Creates an assignment and starts generation (BullMQ/Local fallback) |
| `GET` | `/assignments/:id` | Returns assignment document and paper structure |
| `POST` | `/assignments/:id/regenerate` | Triggers prompt regeneration |
| `GET` | `/assignments/:id/pdf` | Returns compile jsPDF downloadable file |
| `GET` | `/health` | Health check endpoint |

### WebSocket Messages (Socket.IO Room `assignment:<id>`)

* `join:assignment`: Joins the socket room for real-time progress.
* `generation:progress`: Emits `{ message, status, progress }` updates.
* `generation:completed`: Emits `{ assignmentId, paper }` when questions are ready.
* `generation:failed`: Emits `{ error }` on system failures.

---

## 📁 Project Structure

```text
AI-Assessment-Creator/
├── frontend/                    # Next.js 15 Client Application
│   ├── public/                  # Static assets (icons, avatars)
│   ├── src/
│   │   ├── app/                 # App Router pages
│   │   │   ├── create/          # Assessment creator form
│   │   │   ├── assessment/[id]/ # Document view page
│   │   │   └── page.tsx         # Dashboard listing
│   │   ├── components/          # React components
│   │   │   ├── layout/          # Sidebar.tsx, Header.tsx
│   │   │   ├── create/          # FileUpload.tsx, QuestionConfig.tsx
│   │   │   └── assessment/      # QuestionPaper.tsx, ActionBar.tsx
│   │   ├── store/               # Zustand useAssessmentStore
│   │   └── hooks/               # WebSocket useWebSocket hook
│   └── globals.css              # Custom Dark-Mode Stylesheet
│
├── backend/                     # Express.js Server
│   ├── src/
│   │   ├── config/              # MongoDB & Redis client boot
│   │   ├── models/              # Mongoose schema definitions
│   │   ├── routes/              # Express endpoint controllers
│   │   ├── queues/              # BullMQ queue & worker workers
│   │   └── services/            # Gemini Prompt builder & jsPDF generator
│   └── tsconfig.json
│
├── docker-compose.yml           # Redis container setup
└── README.md
```

---

## 🎨 Layout & Design Approach

The layout is built with a premium high-contrast design system featuring:
- **Navigation Sidebar:** A white background (`#ffffff`) matching the Figma specification, featuring a custom orange brand icon, capsule outline CTA, and an active school information badge showing "Delhi Public School, Bokaro Steel City" at the bottom.
- **Glassmorphism:** Form blocks use semi-transparent white borders and overlays with blur backdrops.
- **Document View:** The generated question paper is rendered as a clean, high-contrast cream white paper element floating on the dark page layout to replicate a physical test sheet preview.
- **Micro-animations:** Hover scales on primary actions, pulse indicators on generating phases, and shimmer loaders on fetching states.
