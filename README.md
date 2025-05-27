# 🌌 The Developer's Guide to the Galaxy
## (Also known as ng-demo)

[![CI - Code Quality & Unit Tests](https://github.com/iamtracy/ng-demo/actions/workflows/ci.yml/badge.svg)](https://github.com/iamtracy/ng-demo/actions/workflows/ci.yml)
[![E2E Tests](https://github.com/iamtracy/ng-demo/actions/workflows/e2e.yml/badge.svg)](https://github.com/iamtracy/ng-demo/actions/workflows/e2e.yml)
[![Security Analysis](https://github.com/iamtracy/ng-demo/actions/workflows/security.yml/badge.svg)](https://github.com/iamtracy/ng-demo/actions/workflows/security.yml)

[![codecov](https://codecov.io/gh/iamtracy/ng-demo/branch/main/graph/badge.svg?token=YOUR_CODECOV_TOKEN)](https://codecov.io/gh/iamtracy/ng-demo)
[![Coverage Status](https://img.shields.io/codecov/c/github/iamtracy/ng-demo/main.svg?label=Coverage)](https://codecov.io/gh/iamtracy/ng-demo)
[![Quality Gate](https://img.shields.io/badge/Quality%20Gate-Passing-brightgreen.svg)](https://github.com/iamtracy/ng-demo/actions/workflows/ci.yml)

> "In the beginning, the tech stack was created. This has made a lot of people very angry and been widely regarded as a bad move." 
> - Mostly Harmless Developer's Handbook

## 🎯 What is this Thing? (Project Overview)

This is a demonstration of a modern full-stack TypeScript application, much like the Guide itself but with fewer entries about towels. It showcases:

### Core Functionality
- Users can post, edit, and delete their own messages
- Admins can see and moderate all messages
- Each user has their own secure space in the galaxy
- Messages are stored safely in our infinitely improbable database

### Technical Showcase
- **Authentication:** Complete Keycloak integration with role-based access
- **Type Safety:** End-to-end TypeScript with automatic type generation
- **API Design:** RESTful endpoints with OpenAPI/Swagger documentation
- **Modern Stack:** Angular (frontend) + NestJS (backend) + Prisma (ORM) + PostgreSQL (database)
- **Development:** Docker-based development environment with hot reload
- **Testing:** Unit tests, integration tests, and end-to-end tests

### Architecture Highlights
- Clean separation between frontend and backend
- Automatic API client generation
- Resource-based authorization
- Database migrations and type generation
- Development automation scripts

Think of it as a small piece of the galaxy where messages can be shared safely, with all the modern conveniences a developer could want, and none of the Vogon poetry.

## 🧰 The Improbability Drive (Technical Architecture)
Through a remarkable coincidence, exactly the kind that the Infinite Improbability Drive was designed to generate, our stack consists of:

### Core Technologies
- **Frontend:** Angular (because space is infinite, and so are our modules)
  - Type-safe API client generation
  - Component-based architecture
  - Modern reactive patterns

- **Backend:** NestJS (it knows where its towel is)
  - RESTful API with OpenAPI/Swagger documentation
  - Modular architecture with dependency injection
  - End-to-end TypeScript support

- **Database:** PostgreSQL with Prisma ORM (more reliable than the Guide's servers)
  - Automated migrations and type generation
  - Type-safe database queries
  - Schema-driven development

### Security & Authentication
- **Keycloak Integration** (better than Vogon poetry for keeping out intruders)
  - Role-based access control
  - JWT authentication
  - Resource-based authorization

### Development Experience
- **Docker & Scripts** (contains entire worlds in boxes)
  - Containerized development environment
  - Hot reload for both frontend and backend
  - One-command setup with `dev.js`

- **Testing & Quality**
  - Jest for unit and integration tests (42% accuracy guaranteed)
  - End-to-end testing support
  - Automated type checking

Think of it as a small piece of the galaxy where messages can be shared safely, with all the modern conveniences a developer could want, and none of the Vogon poetry.

## Prerequisites (Things You'll Need on Your Journey)

Don't forget your towel, and also:
- Node.js (v22 or higher) - The Answer to "Which version?"
- Docker and Docker Compose (your own personal Infinite Improbability Drive)

## 🚀 Launching Your Ship (Getting Started)

1. First, acquire the code (much like hitchhiking, but digital):
```bash
git clone https://github.com/iamtracy/ng-demo
cd ng-demo
```

2. Configure your local sector of space:

Create two configuration files:

```env
# .env
PORT=3000
NODE_ENV=development
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=ng_demo_db

# Keycloak Configuration
KEYCLOAK_AUTH_SERVER_URL=http://localhost:8080
KEYCLOAK_REALM=ng-demo
KEYCLOAK_CLIENT_ID=ng-demo-client
KEYCLOAK_CLIENT_SECRET=ng-demo-secret
```

```env
# server/.env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ng_demo_db?schema=public"
```

3. Choose your launch sequence:

> ⚠️ **WARNING**: The Docker daemon must be running before launch
> 
> Make sure Docker is running on your system before proceeding. The script will check for this and display an error if Docker isn't available.
> 
> Without Docker, the Infinite Improbability Drive (our services) won't have enough power to start.

### Option A: One-Command Launch (Recommended)
```bash
node dev.js    # Handles all setup and startup automatically
```

### Option B: Manual Launch
```bash
# 1. Start Infrastructure
docker-compose up -d    # Start PostgreSQL and Keycloak

# 2. Setup Server
cd server
npm install
npm run prisma:generate
npm run prisma:migrate
npm run start:dev

# 3. Setup Client
cd ../client
npm install
npm run dev
```

Your local instance of the galaxy will be available at:

| Service | Location in Space-Time |
|---------|----------------------|
| User Interface | http://localhost:4200 (The Restaurant at the End of the Universe) |
| API & Documentation | http://localhost:3000/api/docs (The Guide's Technical Appendix) |
| Keycloak | http://localhost:8080 (The Galactic Security Office) |

## 🔐 Security Clearance (Authentication)

### Test Credentials
| Username | Role | Password | Notes |
|-------------|------|----------|-------|
| zaphod | admin | hoopy123! | Full access to all features |
| arthur | user | hoopy123! | Standard user access |
| trillian | user | hoopy123! | Standard user access |

### Quick Setup Tips
1. The `dev.js` script will automatically:
   - Start all required services (PostgreSQL, Keycloak)
   - Run database migrations
   - Import test users into Keycloak
   - Start both frontend and backend in development mode
   - Generate API client code automatically

2. Common Setup Issues:
   - If Keycloak fails to start, check if port 8080 is free
   - If PostgreSQL fails, check if port 5432 is available
   - Run `docker-compose down -v` to reset all services
   - Use `npm run prisma:reset` to reset the database

3. Development URLs:
   - Frontend: http://localhost:4200
   - API & Docs: http://localhost:3000/api/docs
   - Keycloak: http://localhost:8080
   - Database: localhost:5432

## 🌍 Interfacing with the Ship (API Endpoints)

All endpoints require proper towel authentication. For the most up-to-date guide to our subspace communications protocols, consult:

```
The Guide's Technical Appendix: http://localhost:3000/api/docs
```

This remarkable piece of hyperspace engineering, powered by Swagger, contains everything you need to know about:
- Available transmissions
- Required credentials
- Message formats
- Response codes
- And other improbably useful information

Remember: A good hitchhiker always checks the documentation before attempting interstellar communication! 🛸

## 🛠️ Ship Maintenance (Development)

### Running Diagnostics (Testing)
```bash
# Client Tests (Angular)
cd client
npm run test        # Run unit tests
npm run test:ci     # Run tests with coverage (headless)

# Server Tests (NestJS)
cd server
npm run test        # Run unit tests
npm run test:cov    # Run tests with coverage
npm run test:e2e    # Run end-to-end tests

# Full E2E Tests (Cypress)
npm run test:e2e    # Run Cypress tests (requires services running)
```

### 📊 Code Coverage (Quality Assurance)

The project maintains comprehensive test coverage across both client and server:

#### **Coverage Targets:**
- **Client (Angular):** 85%+ line coverage
- **Server (NestJS):** 90%+ line coverage
- **E2E (Cypress):** Critical user flows covered

#### **Coverage Reports:**
- **Local Development:** Coverage reports are generated in `coverage/` directories
- **CI/CD:** Automatic upload to [Codecov](https://codecov.io/gh/iamtracy/ng-demo)
- **GitHub Actions:** Coverage badges updated automatically

#### **Viewing Coverage:**
```bash
# Client coverage (opens in browser)
cd client
npm run test:ci
open coverage/lcov-report/index.html

# Server coverage (opens in browser)
cd server
npm run test:cov
open coverage/lcov-report/index.html
```

#### **Coverage Configuration:**
- **Jest (Server):** Configured in `jest.config.js` with 90% thresholds
- **Karma (Client):** Configured in `karma.conf.js` with 85% thresholds
- **Codecov:** Configured in `.codecov.yml` for PR checks

The coverage badges in the README are automatically updated by GitHub Actions and reflect the current state of the main branch.

### Safety Checks (Linting)
```bash
cd server
npm run lint  # Checks if your code is poetry to a Vogon
```

## 🛡️ Defense Systems (Security Features)

- JWT tokens (better than Babel fish for authentication)
- User-specific access (like having your own infinite improbability sphere)
- Ownership verification (stricter than a Vogon guard)
- Input validation (catches things even Deep Thought would miss)
- Error handling (more helpful than Marvin, less depressing)
- Environment-specific configurations (works in any parallel universe)

## 📊 Database Schema (The Universal Data Structure)

Our database models are defined using Prisma's schema language, which is more elegant than Vogon poetry:

```prisma
model Message {
  id        Int      @default(autoincrement()) @id
  message   String
  userId    String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Relations
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@map("messages")
}

model User {
  id            String    @id  // Keycloak sub (user ID)
  email         String    @unique
  username      String    @unique
  firstName     String?
  lastName      String?
  emailVerified Boolean   @default(false)
  roles         String[]  @default([])
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  lastLoginAt   DateTime?
  
  // Relations
  messages      Message[]
  
  @@map("users")
}
```

## 🎯 Type Safety Across the Galaxy

The project maintains type safety throughout the stack:

1. **Database Layer:**
   ```typescript
   // Prisma provides fully typed models
   import { Message, User } from '@prisma/client'
   ```

2. **API Layer:**
   ```typescript
   // DTOs ensure type safety in requests/responses
   export class MessageDto {
     id: number
     message: string
     userId: string
     createdAt: Date
     updatedAt: Date
   }
   ```

3. **Frontend Layer:**
   ```typescript
   // Auto-generated Angular services with type safety
   this.messageService.findAll().subscribe((messages: Message[]) => {
     // TypeScript knows the shape of 'messages'
   })
   ```

## 💡 Development Tips (A Hitchhiker's Guide to Not Panicking)

1. **Database Operations:**
   ```bash
   # Reset your local database (in case of existential crisis)
   cd server
   npm run prisma:reset
   
   # View your data through Prisma Studio
   npm run prisma:studio  # Opens at http://localhost:5555
   ```

2. **Common Issues:**
   - If Keycloak acts up, try `docker-compose restart keycloak`
   - Database connection issues? Check your towel (DATABASE_URL)
   - Types out of sync? Run generators manually (see Babel Fish section)

3. **Development Flow:**
   ```bash
   # Start everything with a single command
   node dev.js
   
   # Or start services individually (for the bureaucratically inclined)
   docker-compose up -d    # Infrastructure
   cd server && npm run start:dev
   cd client && npm start
   ```

## 🐠 The Babel Fish API Generator

> "The Babel fish is small, yellow, leech-like, and probably the oddest thing in the Universe..." - The Hitchhiker's Guide to the Galaxy

Our Babel Fish is a sophisticated piece of technology that translates your NestJS API definitions into TypeScript interfaces and services that Angular can understand. Much like its biological counterpart, it sits between two different frameworks (NestJS and Angular) and makes them perfectly comprehensible to each other.

### How it Works

1. When you run `node dev.js`, the Babel Fish activates automatically and:
   - Waits for the NestJS server to be ready
   - Generates Angular-compatible TypeScript code when the API is available

2. The generated code lives in `client/src/app/api/` and includes:
   - TypeScript interfaces matching your server DTOs
   - Angular services for API communication
   - Type-safe request/response handling

### Manual Generation

Sometimes the Babel Fish needs a gentle nudge. Run this when:

```bash
cd client
npm run generate
```

You might need this when:
- After pulling changes that modify the API
- If the automatic generation was interrupted
- If the API code gets out of sync with the server
- If Deep Thought is having an existential crisis (rare, but it happens)

### Troubleshooting

If you see TypeScript errors about missing API types:

1. Ensure the NestJS server is running (`http://localhost:3000`)
2. Check that the API documentation is accessible:
   ```bash
   curl http://localhost:3000/api/docs-json
   ```
3. Run the generate command manually (see above)
4. If problems persist, remember: DON'T PANIC! Just restart the dev server by running `node dev.js`

### Technical Details

The generation process:
1. Fetches OpenAPI specs from `http://localhost:3000/api/docs-json`
2. Uses `@openapitools/openapi-generator-cli` for code generation
3. Outputs to `client/src/app/api/`
4. Runs automatically during development via the dev script
5. Takes approximately 42 milliseconds (results may vary)

Remember: The Answer to the Ultimate Question of Life, the Universe, and your API types is automated code generation! 🚀

## 📜 License

MIT (More Improbable Than the Infinite Improbability Drive)

Remember: DON'T PANIC, and always know where your API documentation is! 🌌✨