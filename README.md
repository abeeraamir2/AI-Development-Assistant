# 🚀 DevAssist — AI Development Assistant

<p align="center">
  <img src="https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Google_Gemini-AI-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="Gemini" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind" />
  <img src="https://img.shields.io/badge/Vite-8.1-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
</p>

---

## 📌 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
  - [1. AI Requirement Decomposition & Analysis](#1-ai-requirement-decomposition--analysis)
  - [2. Grounded Vector Search & RAG Context](#2-grounded-vector-search--rag-context)
  - [3. Automated Multi-Language Test Generation](#3-automated-multi-language-test-generation)
  - [4. Agile Work Item & Sprint Management](#4-agile-work-item--sprint-management)
  - [5. Role-Based Access Control (RBAC) & Governance](#5-role-based-access-control-rbac--governance)
  - [6. Security & Multi-Session Invalidation](#6-security--multi-session-invalidation)
  - [7. High-Performance In-Memory Caching](#7-high-performance-in-memory-caching)
- [Tech Stack](#-tech-stack)
- [System Architecture](#-system-architecture)
- [Project Directory Structure](#-project-directory-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [1. Backend Setup](#1-backend-setup)
  - [2. Frontend Setup](#2-frontend-setup)
  - [3. Environment Variables Configuration](#3-environment-variables-configuration)
- [API Reference](#-api-reference)
- [Contributing](#-contributing)
- [License](#-license)

---

## 📖 Overview

**DevAssist (AI Development Assistant)** is an enterprise-grade, full-stack AI platform built to accelerate software development lifecycles. By bridging the gap between product requirements, engineering implementation, and quality assurance, DevAssist uses Google Gemini generative models and semantic vector embeddings to automatically parse natural language requirements into:

* **Strict Acceptance Criteria** with sequential functional references (`AC-01`, `AC-02`).
* **Granular Engineering Tasks** ready for developer implementation.
* **REST API Contracts** complete with HTTP methods, payload schemas, and response formats.
* **Relational Database Schemas** with table definitions, column types, and foreign key constraints.
* **Edge Cases & Failure Scenarios** for robust defensive engineering.
* **Multi-Language Test Suites** (Pytest, Jest, JUnit, xUnit) ready for automated verification.

---

## 🌟 Key Features

### 1. AI Requirement Decomposition & Analysis
* **Multi-format Ingestion**: Upload specification documents (`.pdf`, `.docx`, `.txt`) or enter raw requirement text directly.
* **Scope Selection**: Select specific analysis modules (Summary, Acceptance Criteria, Tasks, APIs, Database Schema, Edge Cases).
* **One-Click Export**: Export comprehensive Markdown analysis reports (`<title>_analysis_report.md`) directly to your machine.

### 2. Grounded Vector Search & RAG Context
* **Duplicate & Similarity Detection**: Generates vector embeddings for requirement criteria using `sentence-transformers` and performs cosine similarity search.
* **Grounded AI Evidence**: References related requirements from the project history and provides visual similarity confidence scores and contextual explanations.

### 3. Automated Multi-Language Test Generation
* **Framework Coverage**: Generates ready-to-run test cases across Python (Pytest / Unittest), JavaScript (Jest / Mocha), Java (JUnit), and C# (xUnit).
* **Test History & Metrics**: Tracks generated suites, code snippets, total test assertions, and download packages.

### 4. Agile Work Item & Sprint Management
* **Jira-Style Kanban Tracking**: Organize items across `To Do`, `In Progress`, `Done`, and `Blocked`.
* **Auto-Incrementing Custom Project Keys**: Generates standardized IDs (e.g. `NETSOL-001`, `AUTH-042`).
* **Priority & Story Points**: Manage task estimation, category tags, start/end dates, and assignee workload.

### 5. Role-Based Access Control (RBAC) & Governance
* **Persona Dashboards**:
  * **Admin / Product Manager**: 6 KPI overview cards, project health telemetry, workload distribution matrix, needs-attention alert panel, and paginated audit logs.
  * **Developer**: Requirement analysis workbench, project activity line charts, analysis health gauge, and active project selector.
  * **QA / Test Engineer**: Test generator, test history, and coverage analytics.
* **Private Project Access Gate**: Request-to-join workflow for private workspaces with real-time in-app approval notifications.

### 6. Security & Multi-Session Invalidation
* **JWT Authentication with Token Versioning**: Revoke all active logins across other devices from the Security Settings page in one click.
* **Fetch Interceptors**: Global HTTP 401 interceptor automatically clears expired credentials and triggers secure re-authentication.

### 7. High-Performance In-Memory Caching
* **Sub-Millisecond Auth**: 30-second TTL in-memory user cache eliminates database round-trips for session validation (0.5 ms response times).
* **Warm Connection Pooling**: Pre-warmed Motor connections (`minPoolSize=10`) eliminate TLS handshake delays to cloud databases.
* **SWR Client-Side Navigation**: Instant zero-delay tab switching with background revalidation.

---

## 💻 Tech Stack

### **Frontend**
* **Framework**: React 19 + Vite 8
* **Routing**: React Router 7
* **Styling**: TailwindCSS 3.4 + Vanilla CSS Design Tokens (Dark & Light themes)
* **Icons & Animation**: Lucide React + Framer Motion
* **Charts & Visualizations**: Recharts
* **Notifications**: Sonner

### **Backend**
* **API Framework**: FastAPI (Python 3.12, ASGI, Uvicorn)
* **AI Engine**: Google Gemini API (`gemini-3.5-flash-lite` / Google GenAI SDK)
* **Database Driver**: Motor (`AsyncIOMotorClient` for asynchronous MongoDB Atlas operations)
* **Embeddings & Vector Search**: Sentence Transformers / NumPy cosine similarity
* **Authentication**: PyJWT + Passlib (Bcrypt) + OAuth2 Password Bearer

---

## 🏗️ System Architecture

```mermaid
graph TD
    A[Client Browser / React 19 Frontend] -->|REST API Requests / JWT| B[FastAPI Gateway]
    
    subgraph Backend Core
        B --> C[Auth Middleware + In-Memory User Cache]
        C --> D[Analyzer Routes]
        C --> E[Work Item Routes]
        C --> F[Project & Access Routes]
        C --> G[Test Generator Routes]
        C --> H[Admin Dashboard Routes]
    end

    subgraph AI & ML Layer
        D --> I[Google Gemini API]
        D --> J[Sentence Transformers Embedding Service]
    end

    subgraph Database Layer
        D --> K[(MongoDB Atlas Cloud)]
        E --> K
        F --> K
        G --> K
        H --> K
    end
```

---

## 📁 Project Directory Structure

```text
AI-Development-Assistant/
├── backend/
│   ├── database/
│   │   └── database.py               # Motor MongoDB client, collections & queries
│   ├── models/
│   │   ├── project_models.py         # Pydantic models for Projects & Join Requests
│   │   ├── user_models.py            # User auth, roles & profile schemas
│   │   └── work_item_models.py       # Agile work item request/response schemas
│   ├── routes/
│   │   ├── analyzer_overview_routes.py # Developer overview telemetry
│   │   ├── analyzer_routes.py        # File upload, requirement analysis & history
│   │   ├── auth_routes.py            # Register, Login & Session revocation
│   │   ├── dashboard_routes.py       # Admin SaaS KPI metrics & workload aggregation
│   │   ├── notification_routes.py    # Live in-app notifications
│   │   ├── project_access_routes.py  # Join request workflows & access gating
│   │   ├── project_routes.py         # Project CRUD & team member assignment
│   │   ├── role_routes.py            # RBAC role permissions
│   │   ├── test_generator_routes.py  # AI test suite generation
│   │   ├── user_routes.py            # Profile & session settings
│   │   └── work_item_routes.py       # Work item management & summary
│   ├── services/
│   │   ├── analysis_service.py       # Gemini prompt engineering & decomposition
│   │   ├── auth_service.py           # JWT creation, decoding & user TTL cache
│   │   ├── embedding_service.py      # Vector embeddings for semantic search
│   │   ├── file_service.py           # PDF, DOCX, TXT document parser
│   │   ├── project_access_service.py # Access status checks & approvals
│   │   └── work_item_service.py      # Work item business logic & index initialization
│   ├── main.py                       # FastAPI application entry point & CORS
│   └── requirements.txt              # Python package dependencies
├── frontend/
│   ├── src/
│   │   ├── components/               # Modular UI components by domain
│   │   │   ├── Admin/                # Admin charts, tables & metrics
│   │   │   ├── Analysis-history/     # History lists, filters & detail drawers
│   │   │   ├── Developer-overview/   # KPI cards, activity line charts, health donuts
│   │   │   ├── Requirement-analyzer/ # Ingestion screens & scope selectors
│   │   │   ├── Requirement-results/  # Evidence drawers, schemas, tasks & export
│   │   │   ├── Shared/               # TopHeader, Sidebar, Notifications
│   │   │   └── Work-items/           # Work item forms, cards & filters
│   │   ├── context/
│   │   │   └── ProjectAccessContext.jsx # Global project access & notification state
│   │   ├── pages/
│   │   │   ├── admin/                # AdminDashboard, UsersPage, RolesPage
│   │   │   ├── developer/            # OverviewPage, AnalyzerPage, ResultsPage, History
│   │   │   ├── test-engineer/        # TestGeneratorPage, TestHistoryPage
│   │   │   ├── work-items/           # WorkItemsPage, CreateWorkItemPage
│   │   │   └── SettingsPage.jsx      # Profile, Security, Sessions & Notification prefs
│   │   ├── utils/
│   │   │   ├── authUtils.js          # Fetch interceptor & auth helpers
│   │   │   ├── dateUtils.js          # Relative & localized date formatting
│   │   │   └── roleUtils.js          # RBAC normalization & permission checks
│   │   ├── App.jsx                   # Role-based route definitions
│   │   └── main.jsx                  # React application entry point
│   ├── package.json                  # Frontend dependencies & scripts
│   └── vite.config.js                # Vite build configuration
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
* **Node.js**: v18.0 or higher
* **Python**: v3.10, 3.11, or 3.12
* **MongoDB**: A free MongoDB Atlas cluster or local MongoDB instance
* **Google Gemini API Key**: Obtainable from [Google AI Studio](https://aistudio.google.com/)

---

### 1. Backend Setup

1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```

2. **Create and activate a virtual environment**:
   ```bash
   # On Windows PowerShell
   python -m venv venv
   .\venv\Scripts\Activate.ps1

   # On macOS / Linux
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure your `.env` file** (see [Environment Variables Configuration](#3-environment-variables-configuration)).

5. **Start the FastAPI server**:
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```
   *The backend will run at `http://localhost:8000` (Swagger docs available at `http://localhost:8000/docs`).*

---

### 2. Frontend Setup

1. **Navigate to the frontend directory**:
   ```bash
   cd ../frontend
   ```

2. **Install Node dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```
   *The frontend will run at `http://localhost:5173`.*

---

### 3. Environment Variables Configuration

Create a `.env` file in the `backend/` directory:

```ini
# ==============================================================================
# DATABASE CONFIGURATION
# ==============================================================================
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/requirement_analyzer?retryWrites=true&w=majority

# ==============================================================================
# AI / LLM CONFIGURATION
# ==============================================================================
GEMINI_API_KEY=AIzaSyYourGeminiApiKeyHere

# ==============================================================================
# SECURITY & AUTHENTICATION
# ==============================================================================
SECRET_KEY=your_super_secret_jwt_signing_key_at_least_32_characters_long
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
```

---

## 📡 API Reference

| Method | Endpoint | Description | Role Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/register` | Register a new user account | Public |
| `POST` | `/login` | Authenticate user & issue JWT | Public |
| `POST` | `/auth/revoke-sessions` | Revoke all other active logins | Authenticated |
| `POST` | `/upload` | Analyze requirement document or text | Developer / Admin |
| `GET` | `/history` | List requirement analysis history | Developer / Admin |
| `GET` | `/history/{id}` | Get full analysis details | Developer / Admin |
| `GET` | `/projects` | List all accessible workspace projects | Authenticated |
| `POST` | `/projects` | Create a new project workspace | Authenticated |
| `GET` | `/work-items` | Query agile work items with filters | Authenticated |
| `POST` | `/work-items` | Create a new agile work item | Authenticated |
| `POST` | `/generate-tests` | Generate multi-language unit test suite | QA / Admin |
| `GET` | `/admin/dashboard-stats` | Aggregated SaaS metrics & telemetry | Admin |

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository.
2. **Create a feature branch**:
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. **Commit your changes**:
   ```bash
   git commit -m "Add AmazingFeature"
   ```
4. **Push to the branch**:
   ```bash
   git push origin feature/AmazingFeature
   ```
5. **Open a Pull Request**.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.
