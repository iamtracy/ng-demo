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

### Root TypeScript Structure
The project now includes a **TypeScript-native root workspace** for better development experience:

- **Root Package.json:** Manages TypeScript tooling and shared dependencies
- **TypeScript Configuration:** Full type safety for development scripts
- **Modern Tooling:** Uses `tsx` for native TypeScript execution
- **Environment Management:** Centralized `.env` configuration with comprehensive validation

**Available Commands:**
```bash
npm run dev        # Start development environment (TypeScript)
npm run test:e2e   # Run production tests (TypeScript)
npm run build      # Compile TypeScript files
npm run type-check # Validate TypeScript without compilation
```

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
  - One-command setup with TypeScript-powered scripts

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

**Environment Configuration** is now fully centralized and environment-driven. Create your configuration file:

```bash
# Copy the template and customize
cp env.template .env
```

**Required Environment Variables:**
- `DATABASE_URL` - PostgreSQL connection string
- `KEYCLOAK_CLIENT_SECRET` - Keycloak client secret

**Key Configuration Sections:**

```env
# 🚀 Server Configuration
PORT=3000
CLIENT_PORT=4200
NODE_ENV=development

# 🗄️ Database Configuration
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ng_demo_db

# 🔐 Keycloak Configuration
KEYCLOAK_AUTH_SERVER_URL=http://localhost:8080
KEYCLOAK_REALM=ng-demo
KEYCLOAK_CLIENT_ID=ng-demo-client
KEYCLOAK_CLIENT_SECRET=ng-demo-secret

# 🏥 Health Check Configuration
HEALTH_CHECK_TIMEOUT=2000
HEALTH_CHECK_MAX_RETRIES=30

# 📝 Logging Configuration
KC_LOG_LEVEL=INFO
```

**Environment Variables Reference:**

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | NestJS API server port |
| `CLIENT_PORT` | `4200` | Angular development server port |
| `NODE_ENV` | `development` | Environment mode |
| `DATABASE_URL` | **[REQUIRED]** | PostgreSQL connection string |
| `KEYCLOAK_CLIENT_SECRET` | **[REQUIRED]** | Keycloak client secret |
| `KEYCLOAK_AUTH_SERVER_URL` | `http://localhost:8080` | Keycloak server URL |
| `KEYCLOAK_REALM` | `ng-demo` | Keycloak realm name |
| `KEYCLOAK_CLIENT_ID` | `ng-demo-client` | Keycloak client ID |
| `HEALTH_CHECK_TIMEOUT` | `2000` | Health check interval (ms) |
| `HEALTH_CHECK_MAX_RETRIES` | `30` | Max health check attempts |
| `KC_LOG_LEVEL` | `INFO` | Keycloak logging level |

> **📋 Complete Configuration:** See `env.template` for all available environment variables including optional monitoring, security, and deployment settings.

3. Choose your launch sequence:

> ⚠️ **WARNING**: The Docker daemon must be running before launch
> 
> Make sure Docker is running on your system before proceeding. The script will check for this and display an error if Docker isn't available.
> 
> Without Docker, the Infinite Improbability Drive (our services) won't have enough power to start.

### Option A: One-Command Launch (Recommended)
```bash
npm run dev    # TypeScript-powered development launch
# or the classic way:
node dev.js    # JavaScript version (still works)
```

The development script will:
- Validate all required environment variables
- Display current configuration
- Start Docker services (PostgreSQL + Keycloak)
- Set up and start the NestJS server
- Set up and start the Angular client
- Monitor all services with colored output

### Option B: Manual Launch
```bash
# 1. Start Infrastructure
docker-compose up -d    # Start PostgreSQL and Keycloak

# 2. Setup Server
cd server
npm install
npm run prisma:generate
npm run prisma:migrate
npm run start

# 3. Setup Client
cd ../client
npm install
npm run dev
```

### Option C: Production Mode Testing
```bash
npm run test:e2e    # TypeScript-powered production testing
# or the classic way:
node test-e2e.js    # JavaScript version (still works)
```

This production test mode will:
- Build the Angular client for production
- Build the NestJS server for production
- Start the server in production mode (serves static files)
- Run basic health checks
- Test API endpoints and static file serving

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