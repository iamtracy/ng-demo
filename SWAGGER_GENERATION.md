# 🔄 Swagger-Based Test Generation

This project automatically generates Cypress fixtures and TypeScript types from your Swagger/OpenAPI documentation, ensuring your tests stay in sync with your API.

## 🎯 Why Generate from Swagger?

### **Benefits**
- ✅ **Always in sync**: Fixtures automatically reflect API changes
- ✅ **Type safety**: Full TypeScript support for API interactions
- ✅ **Single source of truth**: Swagger docs drive both API and tests
- ✅ **Reduced maintenance**: No manual fixture updates needed
- ✅ **Catch breaking changes**: Tests fail when API contracts change

### **What Gets Generated**
- **API Endpoints**: All routes organized by controller/tag
- **TypeScript Types**: Request/response interfaces
- **Cypress Commands**: Type-safe test helpers
- **Metadata**: Generation timestamps and version tracking

## 🚀 Usage

### **Generate Everything**
```bash
npm run generate:api
```

### **Generate Only Fixtures**
```bash
npm run generate:fixtures
```

### **Generate Only Types**
```bash
npm run generate:types
```

### **Custom API URL**
```bash
API_BASE_URL=http://localhost:3001 npm run generate:api
```

## 📁 Generated Files

### **`cypress/fixtures/api-endpoints.json`**
```json
{
  "endpoints": {
    "messages": {
      "list": "/api/messages",
      "create": "/api/messages",
      "update": "/api/messages/{id}",
      "delete": "/api/messages/{id}"
    },
    "users": {
      "profile": "/api/users/profile",
      "list": "/api/users"
    }
  },
  "metadata": {
    "generatedAt": "2024-01-01T00:00:00.000Z",
    "swaggerVersion": "42.0",
    "title": "The Hitchhiker's Guide to the Galaxy API",
    "baseUrl": "http://localhost:3000"
  }
}
```

### **`cypress/support/api-types.ts`**
```typescript
// Generated from Swagger documentation
export interface CreateMessageDto {
  message: string
}

export interface MessageResponseDto {
  id: number
  message: string
  userId: string
  createdAt: string
  updatedAt: string
}

export type CreateMessageRequest = CreateMessageDto
export type CreateMessageResponse = MessageResponseDto
```

### **`cypress/support/commands.d.ts`**
```typescript
declare namespace Cypress {
  interface Chainable {
    loginApi(username: string, password: string): Chainable<void>
    loginAsUser(userType: 'admin' | 'user1' | 'user2'): Chainable<void>
    apiRequest<T = any>(method: string, url: string, body?: any): Chainable<Cypress.Response<T>>
    createMessage(text: string): Chainable<void>
    getMessages(): Chainable<any[]>
    deleteMessage(messageId: number): Chainable<void>
  }
}
```

## 🧪 Using Generated Fixtures in Tests

### **Load API Endpoints**
```typescript
cy.fixture('api-endpoints').then((api) => {
  cy.request('GET', api.endpoints.messages.list)
})
```

### **Type-Safe API Calls**
```typescript
import { CreateMessageRequest, MessageResponseDto } from '../support/api-types'

cy.fixture('api-endpoints').then((api) => {
  const messageData: CreateMessageRequest = {
    message: 'Test message'
  }
  
  cy.request<MessageResponseDto>('POST', api.endpoints.messages.create, messageData)
    .then((response) => {
      expect(response.body.message).to.equal('Test message')
      expect(response.body.id).to.be.a('number')
    })
})
```

### **Using Generated Commands**
```typescript
cy.loginAsUser('admin')
cy.createMessage('Hello, Galaxy!')
cy.getMessages().should('have.length.greaterThan', 0)
```

## 🔄 Integration with Development Workflow

### **Pre-commit Hook** (Recommended)
```json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm run generate:api && git add cypress/fixtures cypress/support"
    }
  }
}
```

### **CI/CD Integration**
```yaml
- name: Generate API fixtures
  run: |
    npm run dev &
    sleep 10
    npm run generate:api
    kill %1
```

### **Watch Mode** (Development)
```bash
# Terminal 1: Start server
npm run dev

# Terminal 2: Generate fixtures when API changes
npx nodemon --watch server/src --ext ts --exec "npm run generate:api"
```

## 🛠️ Customization

### **Custom Endpoint Organization**
The generator organizes endpoints by Swagger tags. To customize:

```typescript
// In your NestJS controllers
@ApiTags('user-management')  // Will create 'user-management' category
@Controller('users')
export class UsersController {
  // ...
}
```

### **Custom Type Generation**
Modify `scripts/generate-api-types.ts` to:
- Add custom type mappings
- Include additional metadata
- Generate validation schemas
- Create mock data generators

### **Custom Selectors**
The selector generation can be extended in `scripts/generate-api-fixtures.ts`:

```typescript
function generateSelectors() {
  return {
    // Add your custom selectors here
    customComponent: {
      button: '[data-cy=custom-button]',
      input: '[data-cy=custom-input]'
    }
  }
}
```

## 🚨 Important Notes

### **Server Must Be Running**
The generation scripts need your API server running to fetch Swagger docs:

```bash
# Start server first
npm run dev

# Then generate (in another terminal)
npm run generate:api
```

### **Generated Files Are Gitignored**
Add to `.gitignore`:
```
# Generated test files
cypress/fixtures/api-endpoints.json
cypress/support/api-types.ts
cypress/support/commands.d.ts
```

### **Breaking Changes**
When API contracts change:
1. Tests will fail with type errors
2. Update your test code to match new contracts
3. Regenerate fixtures: `npm run generate:api`

## 🎯 Best Practices

1. **Generate after API changes**: Always regenerate when you modify controllers
2. **Version your Swagger docs**: Use semantic versioning in your API
3. **Test the generators**: Include fixture generation in your CI pipeline
4. **Document custom types**: Add JSDoc comments to generated interfaces
5. **Validate fixtures**: Add tests that verify fixture structure

This system ensures your Cypress tests are always in sync with your API, providing confidence that your tests accurately reflect your application's behavior! 🚀 