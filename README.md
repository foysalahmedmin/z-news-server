# Z-News Server

This high-performance, enterprise-grade news portal backend architecture orchestrates dynamic news delivery, hierarchical category management, real-time engagement monitoring, and automated notification systems. Engineered for high-concurrency and data integrity, it serves as the robust backbone for the Z-News ecosystem.

---

## Table of Contents

- [Z-News Server](#z-news-server)
  - [Table of Contents](#table-of-contents)
  - [Core Modules and Features](#core-modules-and-features)
    - [Authentication and Security](#authentication-and-security)
    - [News \& Editorial Management](#news--editorial-management)
    - [Infrastructure \& Performance](#infrastructure--performance)
    - [Communication Engine](#communication-engine)
  - [Tech Stack](#tech-stack)
  - [Security and Data Protection](#security-and-data-protection)
    - [Defensive Security Layers](#defensive-security-layers)
    - [Authentication \& Authorization](#authentication--authorization)
    - [Data Integrity \& Operations](#data-integrity--operations)
  - [Architecture](#architecture)
    - [System Architecture Diagram](#system-architecture-diagram)
    - [Internal Dependency Flow](#internal-dependency-flow)
  - [Project Directory Map](#project-directory-map)
  - [Database Schema](#database-schema)
    - [Detailed Entity-Relationship Diagram](#detailed-entity-relationship-diagram)
  - [Detailed API Endpoints](#detailed-api-endpoints)
  - [Endpoint Operation Patterns](#endpoint-operation-patterns)
  - [Workflow Diagrams](#workflow-diagrams)
    - [News Mutability \& Cache Sync Workflow](#news-mutability--cache-sync-workflow)
  - [Development and Deployment](#development-and-deployment)
    - [Development Setup](#development-setup)
    - [Production Strategy](#production-strategy)
  - [Production Readiness Checklist](#production-readiness-checklist)
  - [License](#license)

---

## Core Modules and Features

### Authentication and Security

- **Hybrid RBAC Architecture**: Granular Role-Based Access Control supporting `super-admin`, `admin`, `editor`, `author`, `contributor`, `subscriber`, and `user`.
- **Ecosystem Security**: Comprehensive protection via Helmet.js, global and route-specific rate limiting, MongoDB injection sanitization, and strict CORS policies.
- **JWT Lifecycle**: Advanced token management featuring secure rotation, password change tracking, and account verification states.

### News & Editorial Management

- **Segmented Article Flow**: Specialized handling for `Breaking News`, `Headlines`, and `Featured` articles with independent lifecycle controls.
- **Hierarchical Category Engine**: Advanced recursive tree architecture supporting infinite category nesting and aggregation.
- **Engagement Analytics**: Real-time tracking of `Views`, `Likes`, `Dislikes`, and `Comments` with atomic increment logic.

### Infrastructure & Performance

- **Intelligent Caching**: Redis-powered caching layer with pattern-based invalidation and query-stable key generation to reduce database load by up to 80%.
- **Cloud Storage Orchestration**: Robust Google Cloud Storage integration with automated file lifecycle management and metadata preservation.
- **Real-time Signaling**: Socket.io integration with Redis backplane for horizontally scalable event broadcasting and instant notifications.

### Communication Engine

- **Notification Priority Tiers**: Multi-channel delivery (Web, Socket) with priority levels (`low`, `medium`, `high`, `urgent`).
- **Recipient Management**: Personalized notification tracking with read/unread status management and bulk cleanup capabilities.

---

## Tech Stack

| Category                | Technology                                       |
| :---------------------- | :----------------------------------------------- |
| Runtime Environment     | Node.js (v18+)                                   |
| Core Framework          | Express.js (v5.x - Next Gen Architecture)        |
| Programming Language    | TypeScript (v5.x)                                |
| Persistent Storage      | MongoDB with Mongoose (v8.x)                     |
| Distributed Caching     | Redis (ioredis) for Lookups and Socket.io        |
| Object Storage          | Google Cloud Storage (GCS)                       |
| Real-time Engine        | Socket.io with Redis Adapter                     |
| Runtime Validation      | Zod (End-to-end type safety)                     |
| Security Infrastructure | bcrypt, jsonwebtoken, helmet, express-rate-limit |

---

## Security and Data Protection

The system implements an industry-standard security posture to protect sensitive editorial workflows and user data.

### Defensive Security Layers

- **Advanced Request Sanitization**:
  - Integrated `mongo-sanitize` at the middleware level to recursively scrub `$` and `.` characters from `req.body`, `req.query`, and `req.params`.
  - Effectively neutralizing NoSQL Injection attempts before they reach the service layer.
- **Intelligent Traffic Governance (Rate Limiting)**:
  - **Global Limiter**: Restricts baseline traffic to prevent broad DDoS spikes.
  - **Auth Limiter**: Implements strict thresholds on `/api/auth` endpoints to thwart brute-force password guessing and credential stuffing attacks.
  - **Dynamic Window**: Uses a 15-minute sliding window with customizable error messages and automated IP blocking.
- **Enterprise-Grade Response Hardening (Helmet.js)**:
  - Automatically configures 15+ secure HTTP headers including:
    - **Content-Security-Policy (CSP)**: Mitigates XSS by restricting source origins.
    - **Strict-Transport-Security (HSTS)**: Enforces SSL/TLS connections.
    - **X-Frame-Options**: Prevents Clickjacking by disallowing unauthorized framing.
- **Strict Production CORS**:
  - Whitelist-based origin verification ensures only authorized frontend environments (e.g., `admin.z-news.com`) can communicate with the API.

### Authentication & Authorization

- **JWT Perimeter**: Stateless authentication using industry-standard JSON Web Tokens with `HS256` signing and automated expiration handling.
- **Granular RBAC Architecture**:
  - A sophisticated Role-Based Access Control system enforces strict permission boundaries across roles: `super-admin`, `admin`, `editor`, `author`, `contributor`, `subscriber`, and `user`.
- **Cryptographic Hashing**: User passwords undergo `Bcrypt` salting with 12 rounds of computational work, ensuring maximum resistance against rainbow table attacks.
- **Input Integrity (Zod)**: Every API entry point is guarded by a `Zod` validator, performing rigid runtime schema enforcement and eliminating "garbage-in" data risks.

### Data Integrity & Operations

- **Soft Delete Pattern**: Implements a logical deletion strategy where data is flagged rather than purged, maintaining historical auditability and protecting against accidental loss.
- **Atomic Concurrency Control**: Engagement metrics (Likes, Views) utilize MongoDB's atomic `$inc` operators to ensure data consistency under high-volume parallel updates.

---

## Architecture

### System Architecture Diagram

<div align="center">

```mermaid
graph TB
    Client[Web/Mobile Client]
    LB[Perimeter Load Balancer]
    Cluster[Node.js Cluster Coordinator]
    W1[Worker Instance 1]
    W2[Worker Instance 2]
    WN[Worker Instance N]

    DB[(MongoDB Primary)]
    Cache[(Redis Cache Layer)]
    GCS[Google Cloud Storage]
    Socket[Socket.io Hub]

    Client --> LB
    LB --> Cluster
    Cluster --> W1 & W2 & WN
    W1 & W2 & WN --> DB
    W1 & W2 & WN --> Cache
    W1 & W2 & WN --> GCS
    W1 & W2 & WN --> Socket
```

</div>

### Internal Dependency Flow

<div align="center">

```mermaid
graph LR
    Router[API Router]
    Mid[Security Middleware]
    San[Sanitizer/Validator]
    Cont[Module Controller]
    Serv[Domain Service]
    CacheServ[Cache Helper]
    Agg[Aggregate Utility]
    Mongoose[Mongoose Model]

    Router --> Mid
    Mid --> San
    San --> Cont
    Cont --> Serv
    Serv --> CacheServ
    Serv --> Agg
    Agg --> Mongoose
```

</div>

---

## Project Directory Map

```text
src/
├── app/
│   ├── builder/        # AppQueryFind and Custom AppError classes
│   ├── config/         # Centralized environment registries and GCP/Redis flags
│   ├── interfaces/     # Global type definitions and index interfaces
│   ├── middlewares/    # Auth, RBAC, Rate-Limit, Sanitize, and Log handlers
│   ├── modules/        # Domain-driven features (15 specialized modules)
│   │   ├── news/       # Core editorial logic and engagement counters
│   │   ├── category/   # Hierarchical tree logic and recursive lookups
│   │   ├── auth/       # Identity management and security flows
│   │   └── ...         # Engagement, Notification, and User modules
│   ├── redis/          # Cache initialization and Pub/Sub configuration
│   ├── routes/         # Centralized API versioning and route mounting
│   ├── socket/         # Real-time relay orchestration
│   └── utils/          # Core utilities (cache.utils, catchAsync, sendResponse)
├── app.ts              # Express pipeline and global middleware configuration
└── index.ts            # Bootloader with Managed Cluster Execution
```

---

## Database Schema

### Detailed Entity-Relationship Diagram

<div align="center">

```mermaid
erDiagram
    %% Core Identity & Community
    User ||--o{ News : "authors"
    User ||--o{ Comment : "posts"
    User ||--o{ Reaction : "reacts"
    User ||--o{ View : "performs"
    User ||--o{ Notification : "sends"
    User ||--o{ NotificationRecipient : "receives"

    %% News Ecosystem Management
    News ||--|| NewsHeadline : "promoted_as"
    News ||--|| NewsBreak : "featured_as"
    News }o--|| Category : "primary_category"
    News }o--o{ Category : "secondary_categories"
    News ||--o{ Comment : "has_comments"
    News ||--o{ Reaction : "has_reactions"
    News ||--o{ View : "has_views"
    News ||--o| Event : "contextualized_by"
    News ||--o| File : "thumbnail_asset"
    News ||--o| File : "video_asset"

    %% Taxonomy & Hierarchy
    Category ||--o{ Category : "parent_of"
    Category ||--o{ Event : "classifies"
    Notification ||--o{ NotificationRecipient : "delivered_to"

    %% ============================================
    %% DETAILED MODEL ATTRIBUTES
    %% ============================================

    User {
        ObjectId _id PK
        string name "Required, 2-50 chars"
        string email "Required, Unique, Indexed"
        string password "Hashed, select: false"
        string role "super-admin|admin|editor|author|user|..."
        string status "in-progress|blocked"
        boolean is_verified
        boolean is_deleted
        timestamp created_at
    }

    News {
        ObjectId _id PK
        string title "Indexed"
        string slug "Unique, Indexed"
        string content "Rich Text/HTML"
        ObjectId category FK
        ObjectId author FK
        string status "draft|pending|published|archived"
        boolean is_featured
        date published_at
        date expired_at
        boolean is_deleted
    }

    Category {
        ObjectId _id PK
        string name "Unique"
        string slug "Unique, Indexed"
        ObjectId category FK "Self-Reference"
        number sequence "Order 1-100"
        string icon "Default: blocks"
        string status "active|inactive"
        boolean is_deleted
    }

    Comment {
        ObjectId _id PK
        ObjectId news FK
        ObjectId user FK "Optional"
        string guest "Optional UUID"
        string name "Fallback for guests"
        string email "Fallback for guests"
        string content "Max 300 chars"
        string status "pending|approved|rejected"
        boolean is_edited
    }

    Reaction {
        ObjectId _id PK
        ObjectId news FK
        ObjectId user FK
        string guest "Optional"
        string type "like|dislike"
        string status "approved"
    }

    View {
        ObjectId _id PK
        ObjectId news FK
        ObjectId user FK
        string guest "Optional"
    }

    NewsHeadline {
        ObjectId _id PK
        ObjectId news FK "Uniqueness enforced"
        string status "draft|published"
        date published_at
        date expired_at
    }

    NewsBreak {
        ObjectId _id PK
        ObjectId news FK "Uniqueness enforced"
        string status "draft|published"
        date published_at
        date expired_at
    }

    Notification {
        ObjectId _id PK
        string title
        string message
        string type "news-request|comment|reaction|..."
        string priority "low|medium|high|urgent"
        string[] channels "web|push|email"
        ObjectId sender FK
    }

    NotificationRecipient {
        ObjectId _id PK
        ObjectId notification FK
        ObjectId recipient FK
        json metadata "Action URLs/Images"
        boolean is_read
        date read_at
    }

    Event {
        ObjectId _id PK
        string name
        string slug "Unique"
        ObjectId category FK
        string status "active|inactive"
        date published_at
        date expired_at
    }

    File {
        ObjectId _id PK
        string url "CDN/Cloud Storage Link"
        string path "Internal Bucket Path"
        string filename
        string mimetype
        number size
        string provider "local|gcs"
    }
```

</div>

The database utilizes a document-oriented schema optimized for high-performance read operations and editorial consistency. Every major entity implements a **Strict Soft-Delete Strategy** and is tightly integrated with the **Redis Caching Layer**. Relationships are maintained through **Atomic ObjectIDs**, with comprehensive indexing on `slugs`, `emails`, and `status` fields to ensure millisecond-level query execution even under heavy load.

---

## Detailed API Endpoints

The system exposes the service layer via the `/api` namespace:

- **Identity**: `/api/auth` (Login, Registration, Password Management)
- **Editorial**: `/api/news`, `/api/news-headline`, `/api/news-break`
- **Taxonomy**: `/api/category` (Includes tree and public views)
- **Engagement**: `/api/comment`, `/api/reaction`, `/api/view`
- **Awareness**: `/api/notification`, `/api/notification-recipient`
- **Personnel**: `/api/user`, `/api/guest`
- **Assets**: `/api/file`, `/api/media`, `/api/storage`
- **Events**: `/api/event`

---

## Endpoint Operation Patterns

Standardization is strictly enforced across all domain modules:

- **Listings**: `GET /api/{module}` (Server-side search, multi-field filtering, pagination)
- **Detail**: `GET /api/{module}/:id` (Fully populated document hydration)
- **Creation**: `POST /api/{module}` (Zod validation and transaction safety)
- **Modification**: `PATCH /api/{module}/:id` (Strict partial update logic)
- **Soft Delete**: `DELETE /api/{module}/:id` (Historical preservation fallback)
- **Permanence**: `DELETE /api/{module}/:id/permanent` (Final byte eradication)
- **Bulk Actions**: `DELETE /api/{module}/bulk` (Batch processing)
- **Restoration**: `POST /api/{module}/:id/restore` (Lifecycle reversal)

---

## Workflow Diagrams

### News Mutability & Cache Sync Workflow

<div align="center">

```mermaid
sequenceDiagram
    participant Editor as Author/Admin
    participant API as Z-News API
    participant DB as MongoDB
    participant Redis as Redis Cache
    participant Client as Frontend Client

    Editor->>API: PATCH /api/news/:id (Update Content)
    API->>DB: Atomic Update & Logic Validation
    DB-->>API: Update Confirmed
    API->>Redis: Invalidate news:* Pattern
    Note over API,Redis: Purges lists, headlines, and detail caches
    API->>Redis: Invalidate news-break:* & news-headline:*
    API-->>Editor: 200 OK (Clean Data)

    Client->>API: GET /api/news/:slug
    API->>Redis: Check cache exists?
    Note right of Redis: Cache MISS
    Redis-->>API: Null
    API->>DB: Fetch Hydrated Content
    DB-->>API: Data
    API->>Redis: Set cache news:slug:xyz
    API-->>Client: Serve Fresh News
```

</div>

---

## Development and Deployment

### Development Setup

1. **Dependency Installation**:

   ```bash
   pnpm install
   ```

2. **Configuration**:
   Populate the `.env` file using the configuration template. Ensure `REDIS_ENABLED` and `GOOGLE_CLOUD_PROJECT_ID` are set for full infrastructure support.

3. **Running in Dev Mode**:
   ```bash
   pnpm run start:dev
   ```

### Production Strategy

1. **Build & Transpile**:

   ```bash
   pnpm build
   ```

2. **Managed Execution**:
   Run with the cluster engine for maximum throughput:

   ```bash
   pnpm run start
   ```

3. **Docker Orchestration**:
   ```bash
   docker-compose up -d --build
   ```

---

## Production Readiness Checklist

- [x] **Clustering**: Multi-core worker orchestration enabled.
- [x] **Caching**: Pattern-based Redis invalidation logic fully integrated.
- [x] **Storage**: Enterprise Google Cloud Storage middleware configured.
- [x] **Security**: Full Zod schema validation and RBAC enforcement.
- [x] **Resilience**: Graceful shutdown and Redis fallback mechanisms.

---

## License

Proprietary and Confidential. Unauthorized duplication or distribution is strictly prohibited.
