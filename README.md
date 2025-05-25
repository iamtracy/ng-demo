# Secure Message System

A secure messaging application built with NestJS and Keycloak authentication.

## Prerequisites

- Node.js (v22 or higher)
- Docker and Docker Compose

## Getting Started

1. Clone the repository:
```bash
git clone <repository-url>
cd my-app
```

2. Set up environment:
```env
.env
PORT=3000
NODE_ENV=development
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=my_app_db
KEYCLOAK_AUTH_SERVER_URL=http://localhost:8080
KEYCLOAK_REALM=my-app
KEYCLOAK_CLIENT_ID=my-app-client
KEYCLOAK_CLIENT_SECRET=my-app-secret

# server/.env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/messages?schema=public"
```

3. Start the application:
```bash
# Start infrastructure (Keycloak & PostgreSQL)
docker-compose up -d

# Option 1: Quick start with dev script
sh dev.sh

# Option 2: Manual setup
cd server
npm install
npm run prisma:generate
npm run prisma:migrate 
npm run start:dev

cd ../client
npm install
npm run dev
```

The application will be available at:
- API & Swagger Docs: http://localhost:3000/api/docs
- Keycloak Admin: http://localhost:8080

## Authentication

The application uses Keycloak for authentication. Default test users:
- admin/admin123
- user/user123
- alice/alice123

To make API requests:
1. Obtain an access token from Keycloak
2. Include the token in requests:
   ```
   Authorization: Bearer <your-access-token>
   ```

## API Endpoints

All endpoints require Bearer token authentication:

### Messages
- `GET /messages` - Get all messages for the current user
- `POST /messages` - Create a new message
- `PUT /messages/:id` - Update a message
- `DELETE /messages/:id` - Delete a message

## Development

### Testing
```bash
cd server
npm run test
```

### Linting
```bash
cd server
npm run lint
```

## Security Features

- JWT token authentication
- User-specific message access
- Ownership verification for updates and deletions
- Input validation
- Proper error handling
- Environment-specific configurations

## Error Codes

- 200: Success
- 201: Resource created
- 204: Resource deleted
- 400: Bad request
- 401: Unauthorized
- 403: Forbidden
- 404: Resource not found
- 500: Server error

## License

MIT