# Z-NEWS SERVER (<a href="https://admin.z-news.com/">LIVE</a>)

A robust, scalable news management backend API built with Node.js, TypeScript, and MongoDB. This server provides comprehensive functionality for managing news content, users, categories, and real-time features with WebSocket support.

## 🚀 Features

- **News Management**: Complete CRUD operations for news articles with rich content support
- **User Authentication**: JWT-based authentication with role-based access control
- **Real-time Communication**: WebSocket integration with Socket.io and Redis adapter
- **Media Handling**: File upload and management for images, videos, and documents
- **Category Management**: Hierarchical news categorization system
- **Comment System**: User interaction through comments and reactions
- **Notification System**: Real-time notifications for users
- **Search & Filtering**: Advanced search capabilities with pagination
- **API Documentation**: RESTful API endpoints with validation
- **Docker Support**: Containerized development and production environments
- **Cloud Deployment**: Vercel deployment configuration included

## 🏗️ Architecture

```
z-news-server/
├── 📁 src/                                    # Source code directory
│   ├── 📁 app/                                # Application core
│   │   ├── 📁 modules/                        # Feature-based modules
│   │   │   ├── 📁 auth/                       # Authentication & authorization
│   │   │   │   ├── 📄 auth.controller.ts      # Request/response handling
│   │   │   │   ├── 📄 auth.service.ts         # Business logic
│   │   │   │   ├── 📄 auth.route.ts           # Route definitions
│   │   │   │   ├── 📄 auth.type.ts            # TypeScript types
│   │   │   │   ├── 📄 auth.utils.ts           # Helper functions
│   │   │   │   └── 📄 auth.validation.ts      # Zod validation schemas
│   │   │   ├── 📁 user/                       # User management
│   │   │   │   ├── 📄 user.controller.ts      # User CRUD operations
│   │   │   │   ├── 📄 user.service.ts         # User business logic
│   │   │   │   ├── 📄 user.model.ts           # User database model
│   │   │   │   ├── 📄 user.route.ts           # User routes
│   │   │   │   ├── 📄 user.type.ts            # User types
│   │   │   │   ├── 📄 user.utils.ts           # User utilities
│   │   │   │   ├── 📄 user.validation.ts      # User validation
│   │   │   │   └── 📄 user.constat.ts         # User constants
│   │   │   ├── 📁 news/                       # News article management
│   │   │   │   ├── 📄 news.controller.ts      # News CRUD operations
│   │   │   │   ├── 📄 news.service.ts         # News business logic
│   │   │   │   ├── 📄 news.model.ts           # News database model
│   │   │   │   ├── 📄 news.route.ts           # News routes
│   │   │   │   ├── 📄 news.type.ts            # News types
│   │   │   │   ├── 📄 news.utils.ts           # News utilities
│   │   │   │   └── 📄 news.validation.ts      # News validation
│   │   │   ├── 📁 category/                   # Category management
│   │   │   │   ├── 📄 category.controller.ts  # Category CRUD operations
│   │   │   │   ├── 📄 category.service.ts     # Category business logic
│   │   │   │   ├── 📄 category.model.ts       # Category database model
│   │   │   │   ├── 📄 category.route.ts       # Category routes
│   │   │   │   ├── 📄 category.type.ts        # Category types
│   │   │   │   ├── 📄 category.utils.ts       # Category utilities
│   │   │   │   └── 📄 category.validation.ts  # Category validation
│   │   │   ├── 📁 comment/                    # Comment system
│   │   │   │   ├── 📄 comment.controller.ts   # Comment CRUD operations
│   │   │   │   ├── 📄 comment.service.ts      # Comment business logic
│   │   │   │   ├── 📄 comment.model.ts        # Comment database model
│   │   │   │   ├── 📄 comment.route.ts        # Comment routes
│   │   │   │   ├── 📄 comment.type.ts         # Comment types
│   │   │   │   ├── 📄 comment.utils.ts        # Comment utilities
│   │   │   │   └── 📄 comment.validation.ts   # Comment validation
│   │   │   ├── 📁 reaction/                   # User reactions (likes, dislikes)
│   │   │   │   ├── 📄 reaction.controller.ts  # Reaction CRUD operations
│   │   │   │   ├── 📄 reaction.service.ts     # Reaction business logic
│   │   │   │   ├── 📄 reaction.model.ts       # Reaction database model
│   │   │   │   ├── 📄 reaction.route.ts       # Reaction routes
│   │   │   │   ├── 📄 reaction.type.ts        # Reaction types
│   │   │   │   ├── 📄 reaction.utils.ts       # Reaction utilities
│   │   │   │   └── 📄 reaction.validation.ts  # Reaction validation
│   │   │   ├── 📁 view/                       # View tracking & analytics
│   │   │   │   ├── 📄 view.controller.ts      # View CRUD operations
│   │   │   │   ├── 📄 view.service.ts         # View business logic
│   │   │   │   ├── 📄 view.model.ts           # View database model
│   │   │   │   ├── 📄 view.route.ts           # View routes
│   │   │   │   ├── 📄 view.type.ts            # View types
│   │   │   │   ├── 📄 view.utils.ts           # View utilities
│   │   │   │   └── 📄 view.validation.ts      # View validation
│   │   │   ├── 📁 media/                      # File & media management
│   │   │   │   ├── 📄 media.controller.ts     # Media CRUD operations
│   │   │   │   ├── 📄 media.service.ts        # Media business logic
│   │   │   │   ├── 📄 media.route.ts          # Media routes
│   │   │   │   └── 📄 media.type.ts           # Media types
│   │   │   ├── 📁 notification/               # Notification system
│   │   │   │   ├── 📄 notification.controller.ts # Notification CRUD operations
│   │   │   │   ├── 📄 notification.service.ts    # Notification business logic
│   │   │   │   ├── 📄 notification.model.ts      # Notification database model
│   │   │   │   ├── 📄 notification.route.ts      # Notification routes
│   │   │   │   ├── 📄 notification.type.ts       # Notification types
│   │   │   │   ├── 📄 notification.utils.ts      # Notification utilities
│   │   │   │   └── 📄 notification.validation.ts # Notification validation
│   │   │   ├── 📁 notification-recipient/     # Notification delivery tracking
│   │   │   │   ├── 📄 notification-recipient.controller.ts # Recipient CRUD operations
│   │   │   │   ├── 📄 notification-recipient.service.ts    # Recipient business logic
│   │   │   │   ├── 📄 notification-recipient.model.ts      # Recipient database model
│   │   │   │   ├── 📄 notification-recipient.route.ts      # Recipient routes
│   │   │   │   ├── 📄 notification-recipient.type.ts       # Recipient types
│   │   │   │   ├── 📄 notification-recipient.utils.ts      # Recipient utilities
│   │   │   │   └── 📄 notification-recipient.validation.ts # Recipient validation
│   │   │   ├── 📁 news-headline/              # Featured headlines
│   │   │   │   ├── 📄 news-headline.controller.ts # Headline CRUD operations
│   │   │   │   ├── 📄 news-headline.service.ts    # Headline business logic
│   │   │   │   ├── 📄 news-headline.model.ts      # Headline database model
│   │   │   │   ├── 📄 news-headline.route.ts      # Headline routes
│   │   │   │   ├── 📄 news-headline.type.ts       # Headline types
│   │   │   │   ├── 📄 news-headline.utils.ts      # Headline utilities
│   │   │   │   └── 📄 news-headline.validation.ts # Headline validation
│   │   │   ├── 📁 news-break/                  # Breaking news
│   │   │   │   ├── 📄 news-break.controller.ts    # Break news CRUD operations
│   │   │   │   ├── 📄 news-break.service.ts       # Break news business logic
│   │   │   │   ├── 📄 news-break.model.ts         # Break news database model
│   │   │   │   ├── 📄 news-break.route.ts         # Break news routes
│   │   │   │   ├── 📄 news-break.type.ts          # Break news types
│   │   │   │   ├── 📄 news-break.utils.ts         # Break news utilities
│   │   │   │   └── 📄 news-break.validation.ts    # Break news validation
│   │   │   └── 📁 guest/                        # Anonymous user management
│   │   │       ├── 📄 guest.controller.ts       # Guest CRUD operations
│   │   │       ├── 📄 guest.service.ts          # Guest business logic
│   │   │       ├── 📄 guest.model.ts            # Guest database model
│   │   │       ├── 📄 guest.route.ts            # Guest routes
│   │   │       ├── 📄 guest.type.ts             # Guest types
│   │   │       ├── 📄 guest.utils.ts            # Guest utilities
│   │   │       └── 📄 guest.validation.ts       # Guest validation
│   │   ├── 📁 middlewares/                     # Express middleware stack
│   │   │   ├── 📄 auth.middleware.ts           # JWT authentication & authorization
│   │   │   ├── 📄 guest.middleware.ts          # Anonymous user session management
│   │   │   ├── 📄 file.middleware.ts           # Secure file upload handling
│   │   │   ├── 📄 validation.middleware.ts     # Request data validation (Zod)
│   │   │   ├── 📄 log.middleware.ts            # Request/response logging
│   │   │   ├── 📄 error.middleware.ts          # Centralized error handling
│   │   │   └── 📄 not-found.middleware.ts      # 404 error handling
│   │   ├── 📁 config/                          # Configuration management
│   │   │   └── 📄 index.ts                     # Environment configuration
│   │   ├── 📁 routes/                          # API route definitions
│   │   │   └── 📄 index.ts                     # Main router configuration
│   │   ├── 📁 redis/                           # Redis client & configuration
│   │   │   └── 📄 index.ts                     # Redis client setup
│   │   ├── 📁 socket/                          # WebSocket & real-time setup
│   │   │   └── 📄 index.ts                     # Socket.io configuration
│   │   ├── 📁 errors/                          # Error handling utilities
│   │   │   ├── 📄 handleCastError.ts           # MongoDB cast error handling
│   │   │   ├── 📄 handleDuplicateError.ts      # Duplicate key error handling
│   │   │   ├── 📄 handleValidationError.ts     # Mongoose validation error handling
│   │   │   └── 📄 handleZodError.ts            # Zod validation error handling
│   │   ├── 📁 interface/                       # TypeScript interfaces
│   │   │   └── 📄 index.d.ts                   # Global type declarations
│   │   ├── 📁 types/                           # Type definitions
│   │   │   ├── 📄 response.type.ts             # Success response types
│   │   │   └── 📄 error-response.type.ts       # Error response types
│   │   └── 📁 utils/                           # Utility functions
│   │       ├── 📄 catchAsync.ts                 # Async error wrapper
│   │       ├── 📄 sendResponse.ts               # Standardized response utility
│   │       ├── 📄 sendEmail.ts                  # Email sending utility
│   │       ├── 📄 deleteFiles.ts                # File deletion utility
│   │       ├── 📄 dirYearMonth.ts               # Directory organization utility
│   │       └── 📄 sendResponse.ts               # Response formatting utility
│   ├── 📄 app.ts                               # Express application setup
│   └── 📄 index.ts                             # Server entry point with clustering
├── 📁 uploads/                                 # File upload storage
├── 📁 public/                                  # Static assets & frontend build
├── 📁 logs/                                    # Application logs
├── 📄 package.json                             # Dependencies & scripts
├── 📄 pnpm-lock.yaml                          # Lock file for pnpm
├── 📄 tsconfig.json                            # TypeScript configuration
├── 📄 eslint.config.js                         # ESLint configuration
├── 📄 Dockerfile                               # Multi-stage Docker build
├── 📄 docker-compose.yml                       # Development environment setup
├── 📄 vercel.json                              # Vercel deployment configuration
└── 📄 README.md                                # Project documentation
```

```
config/
└── 📄 index.ts                        # Environment configuration
    ├── Database connection settings
    ├── Redis configuration
    ├── JWT secrets & expiration
    ├── Email settings
    ├── Security parameters
    └── Application settings
```

#### **📁 src/app/routes/** - API Route Definitions

Centralized route management with modular organization:

```
routes/
└── 📄 index.ts                        # Main router configuration
    ├── Auth routes (/api/auth/*)
    ├── User routes (/api/user/*)
    ├── News routes (/api/news/*)
    ├── Category routes (/api/category/*)
    ├── Comment routes (/api/comment/*)
    ├── Reaction routes (/api/reaction/*)
    ├── View routes (/api/view/*)
    ├── Media routes (/api/media/*)
    ├── Notification routes (/api/notification/*)
    ├── Guest routes (/api/guest/*)
    └── Additional module routes
```

#### **📁 src/app/redis/** - Redis Configuration

Redis client setup for caching and real-time features:

```
redis/
└── 📄 index.ts                        # Redis client configuration
    ├── Cache client setup
    ├── Pub/Sub clients for Socket.io
    ├── Connection management
    └── Error handling
```

#### **📁 src/app/socket/** - WebSocket & Real-time

Real-time communication setup with Socket.io:

```
socket/
└── 📄 index.ts                        # Socket.io configuration
    ├── WebSocket server setup
    ├── Event handlers
    ├── Room management
    └── Redis adapter integration
```

#### **📁 src/app/errors/** - Error Handling

Specialized error handlers for different error types:

```
errors/
├── 📄 handleCastError.ts              # MongoDB cast error handling
├── 📄 handleDuplicateError.ts         # Duplicate key error handling
├── 📄 handleValidationError.ts        # Mongoose validation error handling
└── 📄 handleZodError.ts               # Zod validation error handling
```

#### **📁 src/app/interface/** - TypeScript Interfaces

Global TypeScript interfaces and type extensions:

```
interface/
└── 📄 index.d.ts                      # Global type declarations
    ├── Express request extensions
    ├── User interface extensions
    ├── Session interface extensions
    └── Custom type definitions
```

#### **📁 src/app/types/** - Type Definitions

Centralized type definitions for responses and errors:

```
types/
├── 📄 response.type.ts                # Success response types
└── 📄 error-response.type.ts          # Error response types
```

#### **📁 src/app/utils/** - Utility Functions

Reusable utility functions and helpers:

```
utils/
├── 📄 catchAsync.ts                   # Async error wrapper
├── 📄 sendResponse.ts                 # Standardized response utility
├── 📄 sendEmail.ts                    # Email sending utility
├── 📄 sendNotificaion.ts             # Notification utility
├── 📄 deleteFiles.ts                  # File deletion utility
├── 📄 dirYearMonth.ts                 # Directory organization utility
└── 📄 sendResponse.ts                 # Response formatting utility
```

### 🏗️ **Architecture Principles**

#### **🎯 Modular Design**

- **Feature-based organization**: Each module is self-contained
- **Consistent structure**: Uniform file organization across modules
- **Loose coupling**: Modules interact through well-defined interfaces
- **High cohesion**: Related functionality grouped together

#### **🔒 Security-First Approach**

- **Middleware stack**: Multiple security layers
- **Input validation**: Zod schema validation for all inputs
- **Authentication**: JWT-based secure authentication
- **Authorization**: Role-based access control
- **File security**: Secure file upload handling

#### **📊 Scalability Features**

- **Clustering**: Multi-process support for high concurrency
- **Caching**: Redis-based performance optimization
- **Database optimization**: Efficient MongoDB queries
- **Real-time capabilities**: WebSocket support for live features

#### **🔄 Error Handling Strategy**

- **Centralized error handling**: Consistent error responses
- **Error categorization**: Different error types handled appropriately
- **Development vs. production**: Appropriate error detail levels
- **Logging**: Comprehensive error logging for debugging

#### **📝 Code Quality**

- **TypeScript**: Full type safety and IntelliSense
- **ESLint**: Code quality and consistency
- **Prettier**: Code formatting standards
- **Husky**: Git hooks for quality assurance

## 🛠️ Tech Stack

- **Runtime**: Node.js 18 LTS
- **Language**: TypeScript 5.8+
- **Framework**: Express.js 5.1+
- **Database**: MongoDB with Mongoose ODM
- **Cache**: Redis 7+
- **Real-time**: Socket.io with Redis adapter
- **Authentication**: JWT, bcrypt, express-session
- **Validation**: Zod schema validation
- **File Upload**: Multer
- **Email**: Nodemailer
- **Package Manager**: pnpm
- **Containerization**: Docker & Docker Compose
- **Deployment**: Vercel

## 📋 Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- MongoDB instance
- Redis instance
- Docker & Docker Compose (optional)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd z-news-server
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```env
# Server Configuration
NODE_ENV=development
PORT=5000
CLUSTER_ENABLED=false

# Database
DATABASE_URL=mongodb://localhost:27017/z-news

# Redis
REDIS_ENABLED=true
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=your_redis_password

# JWT Secrets
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_RESET_PASSWORD_SECRET=your_reset_secret
JWT_EMAIL_VERIFICATION_SECRET=your_email_secret

# JWT Expiration
JWT_ACCESS_SECRET_EXPIRES_IN=15m
JWT_REFRESH_SECRET_EXPIRES_IN=7d
JWT_RESET_PASSWORD_SECRET_EXPIRES_IN=1h
JWT_EMAIL_VERIFICATION_SECRET_EXPIRES_IN=24h

# Session
SESSION_SECRET=your_session_secret

# Email Configuration
AUTH_USER_EMAIL=your_email@gmail.com
AUTH_USER_EMAIL_PASSWORD=your_app_password

# Frontend URLs
FRONT_END_URL=http://localhost:5000
RESET_PASSWORD_UI_LINK=http://localhost:5000/reset-password
EMAIL_VERIFICATION_UI_LINK=http://localhost:5000/verify-email

# Security
BCRYPT_SALT_ROUNDS=12
DEFAULT_PASSWORD=default123
```

### 4. Development

```bash
# Start development server
pnpm run start:dev

# Lint code
pnpm run lint

# Fix linting issues
pnpm run lint:fix

# Format code
pnpm run prettier:fix
```

### 5. Production Build

```bash
# Build the project
pnpm run build

# Start production server
pnpm start
```

## 🐳 Docker Development

### Start Development Environment

```bash
# Start all services (app, redis, mongo-express, mailhog)
npm run docker:dev

# View logs
npm run docker:dev:logs

# Access container shell
npm run docker:dev:shell

# Stop services
npm run docker:dev:stop
```

### Start Production Environment

```bash
# Start production services
npm run docker:prod

# View logs
npm run docker:prod:logs

# Stop services
npm run docker:prod:stop
```

## 📚 API Endpoints

The API is organized into different access levels: **Public** (no authentication), **User** (authenticated users), and **Admin** (administrative access).

### 🔓 Public Endpoints (No Authentication Required)

#### Authentication

- `POST /api/auth/signin` - User sign in
- `POST /api/auth/signup` - User registration (with image upload)
- `POST /api/auth/forget-password` - Request password reset
- `PATCH /api/auth/reset-password` - Reset password
- `POST /api/auth/email-verification` - Verify email

#### News

- `GET /api/news/public` - Get public news articles
- `GET /api/news/public/featured` - Get featured public news
- `GET /api/news/:slug/public` - Get specific public news by slug

#### Categories

- `GET /api/category/public` - Get public categories
- `GET /api/category/tree/public` - Get public category tree
- `GET /api/category/:slug/public` - Get specific public category by slug

#### Comments

- `GET /api/comment/public` - Get public comments

#### Media

- `GET /api/media` - Get media files

### 👤 User Endpoints (Authenticated Users)

#### Authentication

- `PATCH /api/auth/change-password` - Change user password
- `POST /api/auth/email-verification-source` - Request email verification
- `POST /api/auth/refresh-token` - Refresh access token

#### User Management

- `GET /api/user/self` - Get user's own profile
- `PATCH /api/user/self` - Update user's own profile

#### News (Author/Contributor Access)

- `GET /api/news/self` - Get user's own news articles
- `GET /api/news/:id/self` - Get specific user's own news
- `POST /api/news` - Create news article (with file uploads)
- `POST /api/news/file/:type` - Upload news files (image, video, audio, file)
- `PATCH /api/news/:id/self` - Update user's own news
- `PATCH /api/news/bulk/self` - Bulk update user's own news
- `DELETE /api/news/:id/self` - Delete user's own news
- `DELETE /api/news/bulk/self` - Bulk delete user's own news
- `DELETE /api/news/file/:path` - Delete news file
- `POST /api/news/:id/restore/self` - Restore user's own news
- `POST /api/news/bulk/restore/self` - Bulk restore user's own news

#### Comments

- `GET /api/comment/self` - Get user's own comments
- `GET /api/comment/:id/self` - Get specific user's own comment
- `POST /api/comment` - Create comment
- `PATCH /api/comment/:id/self` - Update user's own comment
- `PATCH /api/comment/bulk/self` - Bulk update user's own comments
- `DELETE /api/comment/:id/self` - Delete user's own comment
- `DELETE /api/comment/bulk/self` - Bulk delete user's own comments
- `POST /api/comment/:id/restore/self` - Restore user's own comment
- `POST /api/comment/bulk/restore/self` - Bulk restore user's own comments

#### Reactions

- `GET /api/reaction/self` - Get user's own reactions
- `GET /api/reaction/:id/self` - Get specific user's own reaction
- `GET /api/reaction/news/:news_id/self` - Get user's reaction to specific news
- `POST /api/reaction` - Create reaction
- `PATCH /api/reaction/:id/self` - Update user's own reaction
- `PATCH /api/reaction/bulk/self` - Bulk update user's own reactions
- `DELETE /api/reaction/:id/self` - Delete user's own reaction
- `DELETE /api/reaction/bulk/self` - Bulk delete user's own reactions

#### Guest Management

- `GET /api/guest/self` - Get guest profile
- `PATCH /api/guest/self` - Update guest profile

### 🔐 Admin Endpoints (Administrative Access)

#### User Management

- `GET /api/user` - Get all users
- `GET /api/user/:id` - Get specific user
- `GET /api/user/writers` - Get writer users
- `PATCH /api/user/:id` - Update specific user
- `PATCH /api/user/bulk` - Bulk update users
- `DELETE /api/user/:id` - Delete specific user
- `DELETE /api/user/bulk` - Bulk delete users
- `DELETE /api/user/:id/permanent` - Permanently delete user
- `DELETE /api/user/bulk/permanent` - Bulk permanently delete users
- `POST /api/user/:id/restore` - Restore deleted user
- `POST /api/user/bulk/restore` - Bulk restore deleted users

#### News Management

- `GET /api/news` - Get all news articles
- `GET /api/news/:id` - Get specific news article
- `PATCH /api/news/:id` - Update news article
- `PATCH /api/news/bulk` - Bulk update news articles
- `DELETE /api/news/:id` - Delete news article
- `DELETE /api/news/bulk` - Bulk delete news articles
- `DELETE /api/news/:id/permanent` - Permanently delete news
- `DELETE /api/news/bulk/permanent` - Bulk permanently delete news
- `POST /api/news/:id/restore` - Restore deleted news
- `POST /api/news/bulk/restore` - Bulk restore deleted news

#### Category Management

- `GET /api/category` - Get all categories
- `GET /api/category/tree` - Get category tree
- `GET /api/category/:id` - Get specific category
- `POST /api/category` - Create category
- `PATCH /api/category/:id` - Update category
- `PATCH /api/category/bulk` - Bulk update categories
- `DELETE /api/category/:id` - Delete category
- `DELETE /api/category/bulk` - Bulk delete categories
- `DELETE /api/category/:id/permanent` - Permanently delete category
- `DELETE /api/category/bulk/permanent` - Bulk permanently delete categories
- `POST /api/category/:id/restore` - Restore deleted category
- `POST /api/category/bulk/restore` - Bulk restore deleted categories

#### Comment Management

- `GET /api/comment` - Get all comments
- `GET /api/comment/:id` - Get specific comment
- `PATCH /api/comment/:id` - Update comment
- `PATCH /api/comment/bulk` - Bulk update comments
- `DELETE /api/comment/:id` - Delete comment
- `DELETE /api/comment/bulk` - Bulk delete comments
- `DELETE /api/comment/:id/permanent` - Permanently delete comment
- `DELETE /api/comment/bulk/permanent` - Bulk permanently delete comments
- `POST /api/comment/:id/restore` - Restore deleted comment
- `POST /api/comment/bulk/restore` - Bulk restore deleted comments

#### Reaction Management

- `GET /api/reaction` - Get all reactions
- `GET /api/reaction/:id` - Get specific reaction
- `PATCH /api/reaction/:id` - Update reaction
- `PATCH /api/reaction/bulk` - Bulk update reactions
- `DELETE /api/reaction/:id` - Delete reaction
- `DELETE /api/reaction/bulk` - Bulk delete reactions

#### Notification Management

- `GET /api/notification` - Get all notifications
- `GET /api/notification/:id` - Get specific notification
- `POST /api/notification` - Create notification
- `PATCH /api/notification/:id` - Update notification
- `PATCH /api/notification/bulk` - Bulk update notifications
- `DELETE /api/notification/:id` - Delete notification
- `DELETE /api/notification/bulk` - Bulk delete notifications
- `DELETE /api/notification/:id/permanent` - Permanently delete notification
- `DELETE /api/notification/bulk/permanent` - Bulk permanently delete notifications
- `POST /api/notification/:id/restore` - Restore deleted notification
- `POST /api/notification/bulk/restore` - Bulk restore deleted notifications

#### Guest Management

- `GET /api/guest` - Get all guests
- `GET /api/guest/:id` - Get specific guest
- `PATCH /api/guest/:id` - Update guest
- `PATCH /api/guest/bulk` - Bulk update guests
- `DELETE /api/guest/:id` - Delete guest
- `DELETE /api/guest/bulk` - Bulk delete guests
- `DELETE /api/guest/:id/permanent` - Permanently delete guest
- `DELETE /api/guest/bulk/permanent` - Bulk permanently delete guests
- `POST /api/guest/:id/restore` - Restore deleted guest
- `POST /api/guest/bulk/restore` - Bulk restore deleted guests

### 📁 Additional Module Endpoints

#### News Headlines

- `GET /api/news-headline` - Get news headlines
- `POST /api/news-headline` - Create news headline
- `PATCH /api/news-headline/:id` - Update news headline
- `DELETE /api/news-headline/:id` - Delete news headline

#### News Breaks

- `GET /api/news-break` - Get news breaks
- `POST /api/news-break` - Create news break
- `PATCH /api/news-break/:id` - Update news break
- `DELETE /api/news-break/:id` - Delete news break

#### Views

- `GET /api/view` - Get view statistics
- `POST /api/view` - Record view

#### Notification Recipients

- `GET /api/notification-recipient` - Get notification recipients
- `POST /api/notification-recipient` - Create notification recipient
- `PATCH /api/notification-recipient/:id` - Update notification recipient
- `DELETE /api/notification-recipient/:id` - Delete notification recipient

### 🔑 Authentication & Authorization

**Access Levels:**

- **super-admin**: Full system access
- **admin**: Administrative access to all modules
- **editor**: Content editing and moderation
- **author**: Content creation and self-management
- **contributor**: Limited content contribution
- **subscriber**: Premium content access
- **user**: Basic authenticated access
- **guest**: Anonymous user access (optional authentication)

**Guest Access:**

- Some endpoints support optional guest authentication
- Guests can interact with content without full registration
- Limited functionality compared to authenticated users

## 📡 Response Architecture

The API follows a standardized response pattern for consistent data exchange and error handling.

### ✅ Success Response Format

```typescript
type TResponse<T> = {
  status: number; // HTTP status code
  success: boolean; // Always true for success
  message?: string; // Optional success message
  data: T; // The actual response data
  meta?: Record<string, unknown>; // Optional metadata (pagination, etc.)
};
```

**Example Success Response:**

```json
{
  "success": true,
  "status": 200,
  "message": "News article created successfully",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "title": "Breaking News",
    "content": "This is the content...",
    "created_at": "2024-01-15T10:30:00Z"
  },
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 10
  }
}
```

### ❌ Error Response Format

```typescript
type TErrorResponse = {
  status: number; // HTTP status code
  message: string; // Error message
  sources: TErrorSources[]; // Detailed error information
};

type TErrorSources = {
  path: string | number; // Field path where error occurred
  message: string; // Specific error message for this field
}[];
```

**Example Error Response:**

```json
{
  "success": false,
  "status": 400,
  "message": "Validation failed",
  "sources": [
    {
      "path": "title",
      "message": "Title is required"
    },
    {
      "path": "email",
      "message": "Invalid email format"
    }
  ],
  "error": "ValidationError",
  "stack": null
}
```

### 🔧 Response Utility

The `sendResponse` utility function ensures consistent response formatting:

```typescript
import sendResponse from '../utils/sendResponse';

// In your controller
sendResponse(res, {
  status: 201,
  success: true,
  message: 'Resource created successfully',
  data: createdResource,
  meta: { total: 1 },
});
```

## 🛡️ Middleware Architecture

The project implements 7 powerful middleware layers that provide robust functionality and security:

### 📝 **Log Middleware**

- **Purpose**: Comprehensive request/response logging for audit trails
- **Features**:
  - Captures user actions, IP addresses, user agents
  - Tracks request duration and payload
  - Stores logs in MongoDB with automatic expiration (3 months)
  - Skips logging for GET requests and basic users
  - Redis caching for performance optimization

### 🔐 **Auth Middleware**

- **Purpose**: JWT-based authentication and role-based access control
- **Features**:
  - Token validation and expiration checking
  - Role-based authorization with flexible role combinations
  - Redis caching for user data (30-minute TTL)
  - Password change detection and token invalidation
  - User status validation (blocked, deleted)

### 👥 **Guest Middleware**

- **Purpose**: Anonymous user session management and tracking
- **Features**:
  - Automatic guest token generation and cookie management
  - Session persistence with database storage
  - IP address and user agent fingerprinting
  - Theme, timezone, and language preference tracking
  - Optional or mandatory guest session enforcement

### 📁 **File Middleware**

- **Purpose**: Secure file upload handling with validation
- **Features**:
  - Multi-file upload support with field-specific configuration
  - File type validation (MIME type checking)
  - File size limits and count restrictions
  - Automatic directory creation with year/month organization
  - Old file cleanup and replacement support
  - Secure filename generation with unique suffixes

### ✅ **Validation Middleware**

- **Purpose**: Request data validation using Zod schemas
- **Features**:
  - Comprehensive validation of params, query, body, cookies, and session
  - Type-safe validation with automatic error handling
  - Integration with error middleware for consistent error responses
  - Support for complex nested validation schemas

### 🚫 **Not-Found Middleware**

- **Purpose**: Handles unmatched API routes and 404 errors
- **Features**:
  - Consistent error response format for missing endpoints
  - Proper HTTP status code handling
  - Integration with error response architecture

### ⚠️ **Error Middleware**

- **Purpose**: Centralized error handling and response formatting
- **Features**:
  - Handles multiple error types (Zod, Mongoose, JWT, etc.)
  - Automatic error categorization and status code assignment
  - Development vs. production error detail control
  - Consistent error response format across all endpoints
  - Stack trace inclusion for development debugging

### 🔄 **Middleware Execution Order**

```
Request → Log → Guest → Auth → File → Validation → Controller → Response → Log
```

**Error Flow:**

```
Error → Error Middleware → Formatted Error Response
```

## 🔐 User Roles

- **super-admin**: Full system access
- **admin**: Administrative access
- **editor**: Content editing capabilities
- **author**: Content creation and management
- **contributor**: Limited content contribution
- **subscriber**: Premium content access
- **user**: Basic user access

## 🗄️ Database Models

### Core Models

- **User**: User accounts and profiles
- **News**: News articles and content
- **Category**: News categorization
- **Comment**: User comments on news
- **Reaction**: User reactions (likes, dislikes)
- **View**: News view tracking
- **Media**: File uploads and management

### Supporting Models

- **NewsHeadline**: Featured headlines
- **NewsBreak**: Breaking news
- **Notification**: System notifications
- **NotificationRecipient**: Notification delivery tracking
- **Guest**: Anonymous user tracking

## 🔌 WebSocket Events

- **user:join**: User joins a room
- **user:leave**: User leaves a room
- **news:create**: New article created
- **news:update**: Article updated
- **comment:create**: New comment added
- **notification:send**: Send notification to user

## 🚀 Deployment

### Vercel Deployment

The project includes `vercel.json` configuration for seamless deployment to Vercel:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Environment Variables

Ensure all required environment variables are set in your deployment platform.

## 📝 Development Guidelines

### Code Style

- Use TypeScript strict mode
- Follow ESLint and Prettier configurations
- Use meaningful variable and function names
- Add JSDoc comments for complex functions

### Project Structure

- Keep modules self-contained
- Use consistent file naming conventions
- Implement proper error handling
- Add input validation using Zod schemas

### Testing

- Write unit tests for services
- Add integration tests for APIs
- Use proper mocking for external dependencies

<!-- ## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request -->

<!-- ## 📄 License

This project is licensed under the ISC License. -->

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Contact the development team
- Check the API documentation

## 🔄 Changelog

### Version 1.0.0

- Initial release
- Complete news management system
- User authentication and authorization
- Real-time features with WebSocket
- Docker support
- Vercel deployment configuration

---

<!-- **Built with ❤️ using modern web technologies** -->
