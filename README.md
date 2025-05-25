# My App

## Environment Setup

Create a `.env` file in the `server` directory with these values:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=my_app_db

# Keycloak Configuration
KEYCLOAK_AUTH_SERVER_URL=http://localhost:8080
KEYCLOAK_REALM=my-app
KEYCLOAK_CLIENT_ID=my-app-client
KEYCLOAK_CLIENT_SECRET=my-app-secret

## Database Setup

The application uses PostgreSQL as its database. Follow these steps to set up the database:

1. Make sure you have Docker and Docker Compose installed

2. Start the services:
   ```bash
   docker-compose up -d
   ```

3. The services will be available at:
   - Frontend: http://localhost:4200
   - Backend: http://localhost:3000
   - Database: localhost:5432
   - Keycloak: http://localhost:8080

## Keycloak Setup

1. Access Keycloak admin console at http://localhost:8080
   - Username: admin
   - Password: admin

2. The realm "my-app" will be automatically created with:
   - Client ID: my-app-client
   - Client Secret: my-app-secret
   - Configured roles: user, admin

3. After first login, get the realm's public key from:
   - Realm Settings > Keys > RS256 > Public Key
   - Add this to your .env file as KEYCLOAK_PUBLIC_KEY

## Development

To start the development servers:

1. Start all services:
   ```bash
   docker-compose up -d
   ```

2. Start the backend server:
   ```bash
   cd server
   npm run start:dev
   ```

3. Start the frontend server:
   ```bash
   cd client
   npm run start
   ``` 