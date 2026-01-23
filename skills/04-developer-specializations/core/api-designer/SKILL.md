---
name: api-designer
description: REST and GraphQL API design, versioning strategies, documentation, and building developer-friendly interfaces
metadata:
  version: "1.0.0"
  tier: developer-specialization
  category: core
  council: code-review-council
---

# API Designer

You embody the perspective of a senior API designer with expertise in creating intuitive, well-documented, and developer-friendly APIs that stand the test of time.

## When to Apply

Invoke this skill when:
- Designing new APIs (REST, GraphQL, gRPC)
- Reviewing API designs for consistency
- Planning API versioning strategies
- Writing API documentation
- Designing error handling and response formats
- Creating API security patterns
- Building SDK-friendly interfaces
- Planning backwards-compatible changes

## Core Competencies

### 1. API Design
- Resource modeling and naming
- HTTP method semantics
- Response format consistency
- Error handling patterns

### 2. Documentation
- OpenAPI/Swagger specifications
- Interactive documentation
- Code examples and SDKs
- Changelog management

### 3. Versioning
- Breaking vs non-breaking changes
- Deprecation strategies
- Migration support
- Multiple version maintenance

### 4. Security
- Authentication patterns
- Authorization design
- Rate limiting
- Input validation

## REST API Design

### Resource Naming Conventions

| Pattern | Example | Description |
|---------|---------|-------------|
| **Collection** | `/users` | List of resources |
| **Instance** | `/users/123` | Single resource |
| **Sub-resource** | `/users/123/orders` | Related collection |
| **Action** | `/users/123/activate` | Non-CRUD operation |

### Naming Rules
- Use nouns, not verbs (except actions)
- Use plural for collections
- Use kebab-case for multi-word
- Avoid deep nesting (max 2-3 levels)

```
Good:
  GET  /users
  GET  /users/123
  GET  /users/123/orders
  POST /users/123/reset-password

Bad:
  GET  /getUsers
  GET  /user/123  (inconsistent plural)
  GET  /users/123/orders/456/items/789/details (too deep)
```

### HTTP Methods

| Method | Use | Idempotent | Safe |
|--------|-----|------------|------|
| **GET** | Read resource(s) | Yes | Yes |
| **POST** | Create resource | No | No |
| **PUT** | Replace resource | Yes | No |
| **PATCH** | Partial update | No* | No |
| **DELETE** | Remove resource | Yes | No |

*PATCH can be idempotent with proper design

### Status Codes

| Range | Meaning | Common Codes |
|-------|---------|--------------|
| **2xx** | Success | 200 OK, 201 Created, 204 No Content |
| **3xx** | Redirect | 301 Moved, 304 Not Modified |
| **4xx** | Client error | 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 409 Conflict, 422 Unprocessable |
| **5xx** | Server error | 500 Internal Error, 502 Bad Gateway, 503 Unavailable |

### Status Code Decision Tree

```
Success?
├─ Yes → Resource returned?
│        ├─ Yes → 200 OK
│        └─ No  → Created?
│                 ├─ Yes → 201 Created
│                 └─ No  → 204 No Content
│
└─ No → Client's fault?
        ├─ Yes → Auth issue?
        │        ├─ Yes → Needs login? → 401 Unauthorized
        │        │        └─ Has access? → 403 Forbidden
        │        └─ No  → Resource exists?
        │                 ├─ No  → 404 Not Found
        │                 └─ Yes → Valid input?
        │                          ├─ No  → 400 Bad Request (syntax)
        │                          │        422 Unprocessable (semantic)
        │                          └─ Yes → 409 Conflict (state)
        │
        └─ No (Server's fault) → 500/502/503
```

## Response Format

### Standard Response Structure

```json
// Success response
{
  "data": {
    "id": "user_123",
    "type": "user",
    "attributes": {
      "email": "user@example.com",
      "name": "John Doe",
      "created_at": "2024-01-15T10:30:00Z"
    },
    "relationships": {
      "organization": {
        "id": "org_456",
        "type": "organization"
      }
    }
  },
  "meta": {
    "request_id": "req_abc123"
  }
}

// Collection response
{
  "data": [...],
  "meta": {
    "total": 100,
    "page": 1,
    "per_page": 20,
    "request_id": "req_abc123"
  },
  "links": {
    "self": "/users?page=1",
    "next": "/users?page=2",
    "last": "/users?page=5"
  }
}
```

### Error Response Structure

```json
{
  "error": {
    "code": "validation_error",
    "message": "The request contains invalid parameters",
    "details": [
      {
        "field": "email",
        "code": "invalid_format",
        "message": "Must be a valid email address"
      },
      {
        "field": "age",
        "code": "out_of_range",
        "message": "Must be between 18 and 120"
      }
    ],
    "request_id": "req_abc123",
    "documentation_url": "https://api.example.com/docs/errors#validation_error"
  }
}
```

### Error Code Taxonomy

```
authentication_error    - Auth token invalid/expired
authorization_error     - User lacks permission
validation_error        - Input validation failed
not_found              - Resource doesn't exist
conflict               - Resource state conflict
rate_limit_exceeded    - Too many requests
internal_error         - Server error (hide details)
service_unavailable    - Temporary outage
```

## Pagination

### Cursor-Based (Recommended)

```
GET /orders?cursor=eyJpZCI6MTIzfQ&limit=20

Response:
{
  "data": [...],
  "pagination": {
    "has_more": true,
    "next_cursor": "eyJpZCI6MTQzfQ"
  }
}
```

**Pros**: Stable with concurrent writes, no offset performance issues
**Cons**: Can't jump to arbitrary page

### Offset-Based

```
GET /orders?offset=40&limit=20

Response:
{
  "data": [...],
  "pagination": {
    "total": 500,
    "offset": 40,
    "limit": 20
  }
}
```

**Pros**: Simple, supports page jumping
**Cons**: Unstable with writes, slow for large offsets

## Filtering and Sorting

### Filter Patterns

```
# Simple equality
GET /users?status=active

# Multiple values
GET /users?status=active,pending

# Comparison operators
GET /orders?total[gte]=100&total[lte]=500

# Date ranges
GET /events?created_at[gte]=2024-01-01&created_at[lt]=2024-02-01

# Search
GET /products?q=laptop

# Nested filters (if needed)
GET /users?organization.plan=enterprise
```

### Sorting

```
# Single field
GET /users?sort=created_at

# Descending
GET /users?sort=-created_at

# Multiple fields
GET /users?sort=-created_at,name
```

## Versioning Strategies

### URL Path Versioning (Recommended)

```
GET /v1/users
GET /v2/users
```

**Pros**: Explicit, easy to route, cache-friendly
**Cons**: Not "pure" REST

### Header Versioning

```
GET /users
Accept: application/vnd.api+json; version=2
```

**Pros**: Clean URLs
**Cons**: Hidden, harder to test, cache complexity

### Version Lifecycle

```
v1 (deprecated) ─────────> sunset date ───────> removed
v2 (current)    ─────────> stable ────────────> deprecated (when v3)
v3 (preview)    ─────────> stable (becomes current)
```

### Breaking vs Non-Breaking Changes

| Non-Breaking (Safe) | Breaking (Requires New Version) |
|---------------------|----------------------------------|
| Add optional field | Remove field |
| Add new endpoint | Change field type |
| Add optional parameter | Change field meaning |
| Expand enum values | Remove enum value |
| Relax validation | Tighten validation |
| Add HTTP method | Change URL structure |

## GraphQL Design

### Schema Design

```graphql
type User {
  id: ID!
  email: String!
  name: String!
  createdAt: DateTime!
  
  # Relationships with pagination
  orders(first: Int, after: String): OrderConnection!
  
  # Computed fields
  totalSpent: Money!
}

type OrderConnection {
  edges: [OrderEdge!]!
  pageInfo: PageInfo!
  totalCount: Int!
}

type OrderEdge {
  cursor: String!
  node: Order!
}

type PageInfo {
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  startCursor: String
  endCursor: String
}
```

### Query Patterns

```graphql
# Good: Specific fields, connection pattern
query GetUserOrders($userId: ID!, $first: Int!, $after: String) {
  user(id: $userId) {
    id
    name
    orders(first: $first, after: $after) {
      edges {
        node {
          id
          total
          status
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
}

# Avoid: Deeply nested queries without limits
query Bad {
  users {
    orders {
      items {
        product {
          reviews {
            # This can explode
          }
        }
      }
    }
  }
}
```

### Mutation Patterns

```graphql
# Input types for mutations
input CreateUserInput {
  email: String!
  name: String!
  organizationId: ID
}

# Consistent mutation response
type CreateUserPayload {
  user: User
  errors: [UserError!]!
}

type UserError {
  field: String
  message: String!
  code: ErrorCode!
}

mutation CreateUser($input: CreateUserInput!) {
  createUser(input: $input) {
    user {
      id
      email
    }
    errors {
      field
      message
    }
  }
}
```

## API Security

### Authentication

| Method | Use Case |
|--------|----------|
| **API Keys** | Server-to-server, simple auth |
| **OAuth 2.0 + OIDC** | User authorization, SSO |
| **JWT** | Stateless session tokens |
| **mTLS** | High-security B2B |

### Authorization Header

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

### Rate Limiting Headers

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 998
X-RateLimit-Reset: 1640995200
Retry-After: 60  (when limited)
```

### Input Validation Checklist

- [ ] Validate content-type header
- [ ] Limit request body size
- [ ] Validate all input parameters
- [ ] Sanitize strings for injection
- [ ] Validate file uploads (type, size)
- [ ] Prevent mass assignment

## Documentation

### OpenAPI Specification Structure

```yaml
openapi: 3.1.0
info:
  title: My API
  version: 1.0.0
  description: |
    # Introduction
    Welcome to the API documentation.
    
    ## Authentication
    All requests require an API key...

servers:
  - url: https://api.example.com/v1
    description: Production

paths:
  /users:
    get:
      summary: List users
      operationId: listUsers
      tags: [Users]
      parameters:
        - name: status
          in: query
          schema:
            type: string
            enum: [active, inactive]
      responses:
        '200':
          description: List of users
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/UserList'
              examples:
                default:
                  $ref: '#/components/examples/UserListExample'
```

### Documentation Requirements

- [ ] All endpoints documented
- [ ] Request/response examples
- [ ] Error responses documented
- [ ] Authentication explained
- [ ] Rate limits documented
- [ ] Changelog maintained
- [ ] Interactive playground

## API Design Checklist

### Before Building

- [ ] Resources and relationships identified
- [ ] URL structure consistent
- [ ] HTTP methods appropriate
- [ ] Response format standardized
- [ ] Error format defined
- [ ] Versioning strategy chosen
- [ ] Authentication mechanism selected
- [ ] Rate limiting planned

### Before Releasing

- [ ] OpenAPI spec complete
- [ ] All endpoints tested
- [ ] Error handling consistent
- [ ] Security review complete
- [ ] Performance benchmarked
- [ ] Monitoring in place
- [ ] Deprecation policy documented

## Anti-Patterns to Avoid

| Anti-Pattern | Better Approach |
|--------------|-----------------|
| Verbs in URLs | Use HTTP methods semantically |
| Inconsistent naming | Establish conventions early |
| Missing pagination | Always paginate collections |
| Generic 500 errors | Proper status codes and messages |
| No request IDs | Include for debugging |
| Undocumented changes | Maintain changelog |
| Breaking changes silently | Version and communicate |

## Constraints

- Always use HTTPS
- Include request ID in all responses
- Document all public endpoints
- Version from day one
- Never expose internal errors
- Rate limit all endpoints
- Validate all input

## Related Skills

- `backend-developer` - Implementation
- `frontend-developer` - Consumer perspective
- `security-engineer` - API security
- `technical-writer` - Documentation
