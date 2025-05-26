# 🌌 The Developer's Guide to the Galaxy
## (Also known as ng-demo)

> "In the beginning, the tech stack was created. This has made a lot of people very angry and been widely regarded as a bad move." 
> - Mostly Harmless Developer's Handbook

## 🧰 The Improbability Drive (Tech Stack)
Through a remarkable coincidence, exactly the kind that the Infinite Improbability Drive was designed to generate, our stack consists of:
- **Frontend:** Angular (because space is infinite, and so are our modules)
- **Backend:** NestJS (it knows where its towel is)
- **Database:** Prisma + Postgres (more reliable than the Guide's servers)
- **Security:** Keycloak (better than Vogon poetry for keeping out intruders)
- **Development:** Docker (contains entire worlds in boxes) & Shell Scripts (written by dolphins)
- **Documentation:** Swagger (because even aliens need API docs)
- **Testing:** Jest (answers all questions with 42% accuracy)

## 🏁 Features (or "Why This App Probably Won't Destroy Earth")
- Role-based security (stricter than the Galactic Hyperspace Planning Council)
- User data isolation (more private than Zaphod's second head)
- API documentation (clearer than the Babel fish)
- JWT authentication (more secure than the doors by Sirius Cybernetics Corp.)
- Modular architecture (like the Restaurant at the End of the Universe - everything in its right place)
- Development automation (because life's too short to be a Vogon)

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

Here's your guide to the cosmic constants:
- `PORT`: 3000 (A perfectly normal port number)
- `NODE_ENV`: development (Because production is too serious)
- `POSTGRES_HOST`: localhost (Your local piece of the galaxy)
- `POSTGRES_DB`: ng_demo_db (Where we store the meaning of life)
- `KEYCLOAK_REALM`: ng-demo (Your own secure dimension)

```env
# .env
PORT=3000
NODE_ENV=development
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=ng_demo_db
KEYCLOAK_AUTH_SERVER_URL=http://localhost:8080
KEYCLOAK_REALM=ng-demo
KEYCLOAK_CLIENT_ID=ng-demo-client
KEYCLOAK_CLIENT_SECRET=ng-demo-secret

# server/.env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/messages?schema=public"
```

3. Initiate the launch sequence:
```bash
# Start the infrastructure (like starting up the Heart of Gold)
docker-compose up -d

# Option 1: The Easy Way (recommended by Slartibartfast)
sh dev.sh

# Option 2: The Hard Way (for Vogons who enjoy the bureaucracy)
cd server
npm install        # Download the universe
npm run prisma:generate   # Generate the meaning of life
npm run prisma:migrate    # Move the stars around
npm run start:dev         # Engage the improbability drive

cd ../client
npm install              # More universal constants
npm run dev             # Make it go
```

Your local instance of the galaxy will be available at:

| Service | Location in Space-Time |
|---------|----------------------|
| User Interface | http://localhost:4200 (The Restaurant at the End of the Universe) |
| API & Documentation | http://localhost:3000/api/docs (The Guide's Technical Appendix) |
| Keycloak | http://localhost:8080 (The Galactic Security Office) |

## 🔐 Security Clearance (Authentication)

Like the doors in the Heart of Gold, but less cheerful. Default crew members:

| Crew Member | Access Code |
|-------------|-------------|
| admin | Password!23 (Don't Panic!) |
| user | Password!23 (Still Don't Panic!) |
| alice | Password!23 (Seriously, No Panicking!) |

To communicate with the ship:
1. Get your towel (access token) from Keycloak
2. Wave it appropriately:
   ```
   Authorization: Bearer <your-towel-token>
   ```

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
cd server
npm run test  # 42 tests and counting
```

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

## 🐠 The Babel Fish API Generator

> "The Babel fish is small, yellow, leech-like, and probably the oddest thing in the Universe..." - The Hitchhiker's Guide to the Galaxy

Our Babel Fish is a sophisticated piece of technology that translates your NestJS API definitions into TypeScript interfaces and services that Angular can understand. Much like its biological counterpart, it sits between two different frameworks (NestJS and Angular) and makes them perfectly comprehensible to each other.

### How it Works

1. When you run `npm run dev`, the Babel Fish activates automatically and:
   - Waits for the NestJS server to be ready
   - Generates Angular-compatible TypeScript code when the api is available

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
4. If problems persist, remember: DON'T PANIC! Just restart the dev server by running dev.sh

### Technical Details

The generation process:
1. Fetches OpenAPI specs from `http://localhost:3000/api/docs-json`
2. Uses `@openapitools/openapi-generator-cli` for code generation
3. Outputs to `client/src/app/api/`
4. Runs automatically during development via nodemon
5. Takes approximately 42 milliseconds (results may vary)

Remember: The Answer to the Ultimate Question of Life, the Universe, and your API types is automated code generation! 🚀

## 📜 License

MIT (More Improbable Than the Infinite Improbability Drive)

Remember: DON'T PANIC, and always know where your API documentation is! 🌌✨