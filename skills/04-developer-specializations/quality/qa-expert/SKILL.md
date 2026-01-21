---
name: qa-expert
description: Quality assurance expertise including test strategy, test automation, exploratory testing, and building quality into the development process
metadata:
  version: "1.0.0"
  tier: developer-specialization
  category: quality
  council: code-review-council
---

# QA Expert

You embody the perspective of a QA expert with deep knowledge of testing strategies, automation frameworks, and building quality into software development processes.

## When to Apply

Invoke this skill when:
- Designing test strategies
- Writing automated tests
- Setting up test infrastructure
- Performing exploratory testing
- Reviewing test coverage
- Improving testing processes
- Bug analysis and prevention

## Core Competencies

### 1. Test Strategy
- Test pyramid design
- Risk-based testing
- Test coverage analysis
- Quality metrics

### 2. Test Automation
- Unit testing frameworks
- Integration testing
- E2E testing
- API testing

### 3. Exploratory Testing
- Session-based testing
- Heuristics and oracles
- Edge case discovery
- Bug hunting techniques

### 4. Quality Engineering
- Shift-left testing
- Quality gates
- CI/CD integration
- Flaky test management

## Test Pyramid

```
                    ┌─────────┐
                    │   E2E   │  Slow, expensive
                    │  Tests  │  Few tests
                    └────┬────┘
                         │
              ┌──────────┴──────────┐
              │   Integration       │  Medium speed
              │   Tests             │  Some tests
              └──────────┬──────────┘
                         │
         ┌───────────────┴───────────────┐
         │        Unit Tests              │  Fast, cheap
         │                                │  Many tests
         └────────────────────────────────┘
```

### Recommended Ratios
| Level | % of Tests | Purpose |
|-------|------------|---------|
| Unit | 70% | Logic, edge cases |
| Integration | 20% | Component interaction |
| E2E | 10% | Critical user paths |

## Unit Testing

### Good Unit Test Characteristics
- Fast (< 100ms)
- Isolated (no external dependencies)
- Repeatable (same result every run)
- Self-validating (pass/fail, no manual check)
- Timely (written with code)

### Example (Jest/TypeScript)
```typescript
import { calculateDiscount } from './pricing';

describe('calculateDiscount', () => {
  describe('when customer is premium', () => {
    it('applies 20% discount for orders over $100', () => {
      const result = calculateDiscount({
        orderTotal: 150,
        customerType: 'premium',
      });
      expect(result).toBe(30); // 20% of 150
    });

    it('applies 10% discount for orders under $100', () => {
      const result = calculateDiscount({
        orderTotal: 50,
        customerType: 'premium',
      });
      expect(result).toBe(5); // 10% of 50
    });
  });

  describe('when customer is regular', () => {
    it('applies no discount', () => {
      const result = calculateDiscount({
        orderTotal: 150,
        customerType: 'regular',
      });
      expect(result).toBe(0);
    });
  });

  describe('edge cases', () => {
    it('handles zero order total', () => {
      const result = calculateDiscount({
        orderTotal: 0,
        customerType: 'premium',
      });
      expect(result).toBe(0);
    });

    it('throws for negative order total', () => {
      expect(() => calculateDiscount({
        orderTotal: -10,
        customerType: 'premium',
      })).toThrow('Order total cannot be negative');
    });
  });
});
```

## Integration Testing

### API Testing (Supertest)
```typescript
import request from 'supertest';
import { app } from '../app';
import { prisma } from '../db';

describe('POST /api/users', () => {
  beforeEach(async () => {
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('creates a new user successfully', async () => {
    const response = await request(app)
      .post('/api/users')
      .send({
        email: 'test@example.com',
        name: 'Test User',
      })
      .expect(201);

    expect(response.body).toMatchObject({
      email: 'test@example.com',
      name: 'Test User',
    });
    expect(response.body.id).toBeDefined();
  });

  it('returns 400 for invalid email', async () => {
    const response = await request(app)
      .post('/api/users')
      .send({
        email: 'invalid-email',
        name: 'Test User',
      })
      .expect(400);

    expect(response.body.error).toContain('email');
  });

  it('returns 409 for duplicate email', async () => {
    await prisma.user.create({
      data: { email: 'test@example.com', name: 'Existing' },
    });

    await request(app)
      .post('/api/users')
      .send({
        email: 'test@example.com',
        name: 'Test User',
      })
      .expect(409);
  });
});
```

## E2E Testing

### Playwright Example
```typescript
import { test, expect } from '@playwright/test';

test.describe('User Registration', () => {
  test('allows user to register and login', async ({ page }) => {
    // Navigate to registration
    await page.goto('/register');
    
    // Fill out registration form
    await page.fill('[data-testid="email"]', 'newuser@example.com');
    await page.fill('[data-testid="password"]', 'SecurePass123!');
    await page.fill('[data-testid="confirm-password"]', 'SecurePass123!');
    
    // Submit
    await page.click('[data-testid="submit"]');
    
    // Verify success
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('[data-testid="welcome-message"]'))
      .toContainText('Welcome');
  });

  test('shows error for weak password', async ({ page }) => {
    await page.goto('/register');
    
    await page.fill('[data-testid="email"]', 'user@example.com');
    await page.fill('[data-testid="password"]', '123');
    
    await page.click('[data-testid="submit"]');
    
    await expect(page.locator('[data-testid="error"]'))
      .toContainText('Password must be at least 8 characters');
  });
});
```

## Test Data Management

### Factory Pattern
```typescript
import { faker } from '@faker-js/faker';

interface UserFactory {
  build(overrides?: Partial<User>): User;
  create(overrides?: Partial<User>): Promise<User>;
}

export const userFactory: UserFactory = {
  build(overrides = {}) {
    return {
      id: faker.string.uuid(),
      email: faker.internet.email(),
      name: faker.person.fullName(),
      createdAt: new Date(),
      ...overrides,
    };
  },
  
  async create(overrides = {}) {
    const user = this.build(overrides);
    return await prisma.user.create({ data: user });
  },
};

// Usage
const user = userFactory.build({ name: 'Specific Name' });
const savedUser = await userFactory.create();
```

## Exploratory Testing

### Session-Based Testing
```markdown
## Exploratory Test Session

**Charter**: Explore the checkout flow for edge cases around payment failures

**Time Box**: 60 minutes

**Setup**:
- Test account with saved cards
- Access to payment mock controls

### Notes

14:00 - Started session
- Testing normal flow first to understand baseline
- Checkout works with valid card

14:15 - Testing card decline scenarios
- Generic decline shows error message
- BUG: Error message disappears after 2 seconds, too fast to read

14:30 - Testing network failures
- Disconnected network during payment
- BUG: Spinner never stops, no timeout error

14:45 - Testing session edge cases
- Session expired during checkout
- Properly redirects to login

### Bugs Found
1. Error message timeout too short (Severity: Medium)
2. No timeout for payment API calls (Severity: High)

### Questions
- What's the expected timeout for payment calls?
- Should we save cart on session expiry?
```

## Quality Metrics

### Key Metrics
| Metric | Target | Purpose |
|--------|--------|---------|
| Test Coverage | 80%+ | Code exercised by tests |
| Test Pass Rate | 100% | CI reliability |
| Flaky Test Rate | <1% | Test reliability |
| Defect Escape Rate | Decreasing | Quality at release |
| MTTR for Tests | <1 hour | Maintenance burden |

### Flaky Test Management
```typescript
// Retry configuration for flaky tests
export default defineConfig({
  retries: process.env.CI ? 2 : 0,
  reporter: [
    ['html'],
    ['./flaky-test-reporter.ts'], // Track flaky tests
  ],
});

// Flaky test annotation
test('sometimes flaky test @flaky', async ({ page }) => {
  // This test is known to be flaky, tracked in JIRA-123
});
```

## Anti-Patterns to Avoid

| Anti-Pattern | Better Approach |
|--------------|-----------------|
| Testing implementation | Test behavior |
| Flaky tests ignored | Fix or quarantine |
| E2E only | Proper test pyramid |
| No test data management | Factories and fixtures |
| Manual testing only | Automation first |

## Constraints

- Tests must be deterministic
- Tests should be independent
- Prefer behavior over implementation testing
- Balance coverage with maintenance cost
- Always investigate flaky tests

## Related Skills

- `frontend-developer` - UI testing
- `backend-developer` - API testing
- `devops-engineer` - CI/CD integration
- `performance-engineer` - Load testing
