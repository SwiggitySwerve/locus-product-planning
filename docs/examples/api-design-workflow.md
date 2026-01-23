# Example: API Design Workflow

This example demonstrates using Locus skills to design a well-structured API.

## The Task

Design a REST API for a user management system.

## Step 1: Load the API Designer Skill

```
use_skill("locus:api-designer")
```

## Step 2: Define Resources

Following REST principles, identify your resources:

| Resource | Description |
|----------|-------------|
| `/users` | User accounts |
| `/users/:id/profile` | User profile information |
| `/users/:id/settings` | User preferences |
| `/organizations` | Organizations/teams |
| `/organizations/:id/members` | Organization membership |

## Step 3: Design Endpoints

### Users Resource

```
# List users (paginated)
GET /api/v1/users?page=1&limit=20&status=active

# Create user
POST /api/v1/users
{
  "email": "user@example.com",
  "name": "John Doe",
  "role": "member"
}

# Get user
GET /api/v1/users/:id

# Update user
PATCH /api/v1/users/:id
{
  "name": "Jane Doe"
}

# Delete user
DELETE /api/v1/users/:id
```

### Response Format

```json
// Success response
{
  "data": {
    "id": "user_abc123",
    "type": "user",
    "attributes": {
      "email": "user@example.com",
      "name": "John Doe",
      "role": "member",
      "created_at": "2024-01-15T10:30:00Z"
    }
  },
  "meta": {
    "request_id": "req_xyz789"
  }
}

// Error response
{
  "error": {
    "code": "validation_error",
    "message": "Invalid email format",
    "details": [
      {
        "field": "email",
        "code": "invalid_format",
        "message": "Must be a valid email address"
      }
    ],
    "request_id": "req_xyz789"
  }
}
```

## Step 4: Document with OpenAPI

**Load technical writer skill for documentation:**
```
use_skill("locus:technical-writer")
```

```yaml
openapi: 3.1.0
info:
  title: User Management API
  version: 1.0.0
  description: API for managing users and organizations

servers:
  - url: https://api.example.com/v1

paths:
  /users:
    get:
      summary: List users
      operationId: listUsers
      tags: [Users]
      parameters:
        - name: page
          in: query
          schema:
            type: integer
            default: 1
        - name: limit
          in: query
          schema:
            type: integer
            default: 20
            maximum: 100
        - name: status
          in: query
          schema:
            type: string
            enum: [active, inactive, pending]
      responses:
        '200':
          description: List of users
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/UserList'
    
    post:
      summary: Create user
      operationId: createUser
      tags: [Users]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateUserInput'
      responses:
        '201':
          description: User created
        '400':
          description: Validation error
        '409':
          description: Email already exists

components:
  schemas:
    User:
      type: object
      properties:
        id:
          type: string
        email:
          type: string
          format: email
        name:
          type: string
        role:
          type: string
          enum: [admin, member, viewer]
        created_at:
          type: string
          format: date-time
    
    CreateUserInput:
      type: object
      required: [email, name]
      properties:
        email:
          type: string
          format: email
        name:
          type: string
          minLength: 1
          maxLength: 100
        role:
          type: string
          enum: [admin, member, viewer]
          default: member
```

## Step 5: Consider Security

**Load security engineer skill:**
```
use_skill("locus:security-engineer")
```

Security checklist:
- [ ] Use HTTPS only
- [ ] Implement rate limiting
- [ ] Validate all input
- [ ] Use proper authentication (JWT/OAuth)
- [ ] Include request IDs for tracing
- [ ] Log security events
- [ ] Sanitize error messages (no stack traces)

## Step 6: Plan Database

**Load database architect skill:**
```
use_skill("locus:database-architect")
```

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);
```

## Skills Used

| Skill | Purpose |
|-------|---------|
| `api-designer` | REST design, endpoints, responses |
| `technical-writer` | OpenAPI documentation |
| `security-engineer` | Security considerations |
| `database-architect` | Schema design |

## Key Takeaways

1. **Design first** - Plan your API before coding
2. **Be consistent** - Use the same patterns everywhere
3. **Document everything** - OpenAPI spec is your contract
4. **Think security** - Consider auth, validation, rate limits
5. **Plan data** - Database design affects API design

## Related Examples

- [Building a SaaS App](./building-a-saas-app.md)
- [Database Design Workflow](./database-design-workflow.md)
