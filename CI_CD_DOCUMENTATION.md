# CI/CD Pipeline Documentation


## 🚀 GitHub Actions Code Quality Pipeline

This repository includes a comprehensive GitHub Actions pipeline that automatically runs code quality checks, tests, and security audits on every push and pull request.

## 📋 Pipeline Overview

The pipeline consists of three main jobs:

### 1. 🧪 Code Quality & Testing Job

**Triggers:** Push to `main`/`develop` branches, Pull Requests
**Matrix Strategy:** Tests on Node.js 18.x and 20.x
**Services:** PostgreSQL 15 for database tests

#### Steps Performed:

##### 🔒 Security Audits
- **npm audit** on root, client, and server dependencies
- Checks for moderate+ severity vulnerabilities
- Non-blocking (continues on error)

##### 🧹 Code Quality Checks
- **ESLint** validation for both client and server
- **TypeScript** type checking with `tsc --noEmit`
- **Prettier** formatting validation
- Ensures code follows established style guidelines

##### 🗄️ Database Setup
- Spins up PostgreSQL test database
- Runs Prisma migrations and generates client
- Prepares database for integration tests

##### 🧪 Testing Suite
- **Client Tests:** Angular unit tests with Karma/Jasmine
- **Server Unit Tests:** Jest unit tests with coverage
- **Server E2E Tests:** End-to-end API testing
- **Coverage Reports:** Generates and uploads to Codecov

##### 🏗️ Build Validation
- **Client Build:** Angular production build
- **Server Build:** NestJS TypeScript compilation
- Ensures deployable artifacts can be created

### 2. 🔍 Dependency Review Job

**Triggers:** Pull Requests only
**Purpose:** Reviews dependency changes for security issues

- Analyzes new dependencies added in PRs
- Fails on moderate+ severity vulnerabilities
- Prevents introduction of vulnerable packages

### 3. 🛡️ CodeQL Security Analysis

**Triggers:** Push and Pull Requests
**Purpose:** Advanced security scanning

- Static analysis for security vulnerabilities
- Scans TypeScript and JavaScript code
- Integrates with GitHub Security tab
- Provides detailed security reports

## 🔧 Configuration

### Environment Variables

The pipeline uses these environment variables:

```yaml
# Database (automatically configured)
DATABASE_URL: postgresql://postgres:postgres@localhost:5432/ng_demo_test

# Application
NODE_ENV: test
KEYCLOAK_CLIENT_SECRET: test-secret
```

### Required Scripts

Ensure your `package.json` files include these scripts:

#### Client (`client/package.json`)
```json
{
  "scripts": {
    "build": "ng build",
    "test:ci": "ng test --no-watch --no-progress --browsers=ChromeHeadless --code-coverage",
    "test:coverage": "ng test --no-watch --no-progress --browsers=ChromeHeadless --code-coverage",
    "lint": "ng lint"
  }
}
```

#### Server (`server/package.json`)
```json
{
  "scripts": {
    "build": "nest build",
    "test": "jest",
    "test:cov": "jest --coverage",
    "test:e2e": "jest --config ./test/jest-e2e.json",
    "lint": "eslint \"{src,apps,libs,test}/**/*.ts\" --fix"
  }
}
```

## 📊 Coverage Reports

The pipeline generates coverage reports and uploads them to Codecov:

- **Client Coverage:** Angular test coverage
- **Server Coverage:** Jest test coverage
- **Flags:** Separate tracking for `client` and `server`

### Setting up Codecov (Optional)

1. Sign up at [codecov.io](https://codecov.io)
2. Connect your GitHub repository
3. Add `CODECOV_TOKEN` to repository secrets (if private repo)

## 🚨 Failure Scenarios

The pipeline will fail if:

- ❌ Linting errors are found
- ❌ TypeScript compilation fails
- ❌ Code formatting doesn't match Prettier rules
- ❌ Unit or E2E tests fail
- ❌ Build process fails
- ❌ Moderate+ security vulnerabilities in dependencies (dependency review)

## 🔧 Local Development

Run the same checks locally before pushing:

```bash
# Install dependencies
npm ci
cd client && npm ci && cd ..
cd server && npm ci && cd ..

# Run linting
cd client && npm run lint && cd ..
cd server && npm run lint && cd ..

# Run type checking
cd client && npx tsc --noEmit && cd ..
cd server && npx tsc --noEmit && cd ..

# Run tests
cd client && npm run test:ci && cd ..
cd server && npm run test && npm run test:e2e && cd ..

# Check formatting
cd client && npx prettier --check "src/**/*.{ts,html,scss,json}" && cd ..
cd server && npx prettier --check "src/**/*.{ts,json}" && cd ..

# Build
cd client && npm run build && cd ..
cd server && npm run build && cd ..
```

## 🎯 Best Practices

### For Contributors

1. **Run tests locally** before pushing
2. **Fix linting errors** before committing
3. **Keep dependencies updated** and secure
4. **Write tests** for new features
5. **Follow code formatting** standards

### For Maintainers

1. **Review security alerts** from dependency review
2. **Monitor coverage trends** in Codecov
3. **Address CodeQL findings** promptly
4. **Keep pipeline dependencies updated**

## 🔄 Pipeline Maintenance

### Updating Dependencies

The pipeline uses these key actions:
- `actions/checkout@v4`
- `actions/setup-node@v4`
- `codecov/codecov-action@v3`
- `actions/dependency-review-action@v3`
- `github/codeql-action/*@v2`

### Node.js Versions

Currently testing on:
- Node.js 18.x (LTS)
- Node.js 20.x (Current LTS)

Update the matrix strategy as new LTS versions are released.

### Database Versions

Currently using PostgreSQL 15. Update the service image as needed:

```yaml
services:
  postgres:
    image: postgres:16  # Update version here
```

## 🎉 Benefits

This pipeline provides:

- ✅ **Automated Quality Assurance**
- ✅ **Security Vulnerability Detection**
- ✅ **Consistent Code Standards**
- ✅ **Comprehensive Test Coverage**
- ✅ **Build Validation**
- ✅ **Multi-Node.js Version Testing**
- ✅ **Database Integration Testing**
- ✅ **Coverage Tracking**

The pipeline ensures that all code merged into main branches meets high quality and security standards! 🚀 