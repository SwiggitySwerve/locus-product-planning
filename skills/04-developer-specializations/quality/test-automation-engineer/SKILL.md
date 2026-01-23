---
name: test-automation-engineer
description: End-to-end test automation, CI/CD test pipelines, test infrastructure, and building reliable automated test suites
metadata:
  version: "1.0.0"
  tier: developer-specialization
  category: quality
  council: code-review-council
---

# Test Automation Engineer

You embody the perspective of a senior test automation engineer with expertise in building robust, maintainable automated test suites and integrating them into CI/CD pipelines.

## When to Apply

Invoke this skill when:
- Setting up test automation frameworks
- Writing E2E or integration tests
- Configuring CI/CD test pipelines
- Debugging flaky tests
- Designing test infrastructure
- Implementing visual regression testing
- Creating API test suites
- Building test data management systems

## Core Competencies

### 1. E2E Test Automation
- Browser automation (Playwright, Cypress)
- Mobile app testing (Appium, Detox)
- Cross-browser and cross-platform testing
- Visual regression testing

### 2. API Testing
- REST and GraphQL testing
- Contract testing (Pact)
- Performance testing (k6, Artillery)
- Mock servers and service virtualization

### 3. CI/CD Integration
- Test parallelization
- Test reporting and analytics
- Flaky test detection
- Test environment management

### 4. Test Infrastructure
- Test data management
- Test environment provisioning
- Containerized test execution
- Cloud testing platforms

## Test Framework Selection

### E2E Framework Comparison

| Framework | Best For | Language | Speed | Reliability |
|-----------|----------|----------|-------|-------------|
| **Playwright** | Modern web apps | JS/TS/Python | Fast | High |
| **Cypress** | Single-page apps | JavaScript | Fast | High |
| **Selenium** | Legacy support | Multi-lang | Slow | Medium |
| **Puppeteer** | Chrome-specific | JavaScript | Fast | High |

### Recommended: Playwright

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 4 : undefined,
  reporter: [
    ['html'],
    ['junit', { outputFile: 'results/junit.xml' }],
  ],
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

## Page Object Model

### Structure

```
tests/
├── pages/
│   ├── BasePage.ts
│   ├── LoginPage.ts
│   ├── DashboardPage.ts
│   └── components/
│       ├── Header.ts
│       └── Sidebar.ts
├── fixtures/
│   └── auth.fixture.ts
├── helpers/
│   └── api.helper.ts
└── specs/
    ├── auth/
    │   ├── login.spec.ts
    │   └── register.spec.ts
    └── dashboard/
        └── dashboard.spec.ts
```

### Page Object Implementation

```typescript
// pages/BasePage.ts
import { Page, Locator } from '@playwright/test';

export abstract class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
  }

  async getTitle(): Promise<string> {
    return this.page.title();
  }
}

// pages/LoginPage.ts
import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.emailInput = page.getByLabel('Email');
    this.passwordInput = page.getByLabel('Password');
    this.submitButton = page.getByRole('button', { name: 'Sign in' });
    this.errorMessage = page.getByRole('alert');
  }

  async goto() {
    await this.page.goto('/login');
    await this.waitForPageLoad();
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async expectError(message: string) {
    await expect(this.errorMessage).toContainText(message);
  }
}

// specs/auth/login.spec.ts
import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { DashboardPage } from '../../pages/DashboardPage';

test.describe('Login', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('successful login redirects to dashboard', async ({ page }) => {
    await loginPage.login('user@example.com', 'password123');
    
    const dashboard = new DashboardPage(page);
    await expect(page).toHaveURL('/dashboard');
    await expect(dashboard.welcomeMessage).toBeVisible();
  });

  test('shows error for invalid credentials', async () => {
    await loginPage.login('invalid@example.com', 'wrongpassword');
    await loginPage.expectError('Invalid email or password');
  });

  test('shows error for empty fields', async () => {
    await loginPage.submitButton.click();
    await loginPage.expectError('Email is required');
  });
});
```

## Test Fixtures

### Authentication Fixture

```typescript
// fixtures/auth.fixture.ts
import { test as base, Page } from '@playwright/test';

type AuthFixtures = {
  authenticatedPage: Page;
  adminPage: Page;
};

export const test = base.extend<AuthFixtures>({
  authenticatedPage: async ({ page, context }, use) => {
    // Option 1: API login for speed
    const response = await page.request.post('/api/auth/login', {
      data: {
        email: 'user@example.com',
        password: 'password123',
      },
    });
    const { token } = await response.json();
    
    // Set token in storage state
    await context.addCookies([{
      name: 'auth_token',
      value: token,
      domain: 'localhost',
      path: '/',
    }]);
    
    await use(page);
  },

  adminPage: async ({ browser }, use) => {
    // Use stored auth state for admin
    const context = await browser.newContext({
      storageState: 'tests/.auth/admin.json',
    });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },
});

export { expect } from '@playwright/test';

// Generate and save auth state
// global-setup.ts
async function globalSetup() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto('/login');
  await page.fill('[name=email]', 'admin@example.com');
  await page.fill('[name=password]', 'adminpass');
  await page.click('button[type=submit]');
  await page.waitForURL('/dashboard');
  
  await page.context().storageState({ path: 'tests/.auth/admin.json' });
  await browser.close();
}

export default globalSetup;
```

## API Testing

### API Test Structure

```typescript
// api/users.api.spec.ts
import { test, expect, APIRequestContext } from '@playwright/test';

let apiContext: APIRequestContext;

test.beforeAll(async ({ playwright }) => {
  apiContext = await playwright.request.newContext({
    baseURL: process.env.API_URL || 'http://localhost:3000/api',
    extraHTTPHeaders: {
      'Authorization': `Bearer ${process.env.API_TOKEN}`,
      'Content-Type': 'application/json',
    },
  });
});

test.afterAll(async () => {
  await apiContext.dispose();
});

test.describe('Users API', () => {
  test('GET /users returns paginated list', async () => {
    const response = await apiContext.get('/users?page=1&limit=10');
    
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
    
    const body = await response.json();
    expect(body.data).toBeInstanceOf(Array);
    expect(body.meta.page).toBe(1);
    expect(body.meta.limit).toBe(10);
  });

  test('POST /users creates new user', async () => {
    const userData = {
      email: `test-${Date.now()}@example.com`,
      name: 'Test User',
    };

    const response = await apiContext.post('/users', { data: userData });
    
    expect(response.status()).toBe(201);
    
    const body = await response.json();
    expect(body.data.email).toBe(userData.email);
    expect(body.data.id).toBeDefined();

    // Cleanup
    await apiContext.delete(`/users/${body.data.id}`);
  });

  test('POST /users validates required fields', async () => {
    const response = await apiContext.post('/users', { 
      data: { name: 'Missing Email' } 
    });
    
    expect(response.status()).toBe(400);
    
    const body = await response.json();
    expect(body.error.code).toBe('validation_error');
    expect(body.error.details).toContainEqual(
      expect.objectContaining({ field: 'email' })
    );
  });
});
```

## Visual Regression Testing

### Setup with Playwright

```typescript
// visual.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Visual Regression', () => {
  test('homepage matches snapshot', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Full page screenshot
    await expect(page).toHaveScreenshot('homepage.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('dashboard components match snapshots', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Component-level screenshots
    const sidebar = page.locator('[data-testid="sidebar"]');
    await expect(sidebar).toHaveScreenshot('sidebar.png');
    
    const header = page.locator('[data-testid="header"]');
    await expect(header).toHaveScreenshot('header.png');
  });

  test('responsive layouts', async ({ page }) => {
    await page.goto('/');
    
    // Desktop
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page).toHaveScreenshot('homepage-desktop.png');
    
    // Tablet
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page).toHaveScreenshot('homepage-tablet.png');
    
    // Mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page).toHaveScreenshot('homepage-mobile.png');
  });
});
```

## CI/CD Integration

### GitHub Actions Pipeline

```yaml
# .github/workflows/e2e.yml
name: E2E Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  e2e:
    runs-on: ubuntu-latest
    timeout-minutes: 30
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Setup database
        run: npm run db:setup
        env:
          DATABASE_URL: postgres://postgres:postgres@localhost:5432/test

      - name: Build application
        run: npm run build

      - name: Run E2E tests
        run: npx playwright test
        env:
          BASE_URL: http://localhost:3000
          DATABASE_URL: postgres://postgres:postgres@localhost:5432/test

      - name: Upload test results
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30

      - name: Upload screenshots on failure
        uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: test-screenshots
          path: test-results/
          retention-days: 7
```

### Test Parallelization

```typescript
// playwright.config.ts additions
export default defineConfig({
  // Shard tests across multiple CI machines
  // Run with: npx playwright test --shard=1/4
  
  // Parallel within machine
  workers: process.env.CI ? 4 : undefined,
  fullyParallel: true,
  
  // Retry flaky tests in CI
  retries: process.env.CI ? 2 : 0,
});
```

## Flaky Test Management

### Detection and Prevention

```typescript
// Avoid: Timing-based waits
await page.waitForTimeout(5000); // BAD

// Prefer: Condition-based waits
await page.waitForSelector('[data-loaded="true"]'); // GOOD
await expect(page.locator('.content')).toBeVisible(); // GOOD

// Avoid: Fragile selectors
await page.click('.btn-primary'); // BAD - may match multiple

// Prefer: Test IDs or roles
await page.click('[data-testid="submit-btn"]'); // GOOD
await page.getByRole('button', { name: 'Submit' }).click(); // BEST

// Avoid: Race conditions
const text = await page.textContent('.counter');
expect(parseInt(text)).toBe(5); // BAD - might not be updated

// Prefer: Assertions that wait
await expect(page.locator('.counter')).toHaveText('5'); // GOOD
```

### Flaky Test Reporter

```typescript
// flaky-reporter.ts
import { Reporter, TestCase, TestResult } from '@playwright/test/reporter';
import * as fs from 'fs';

class FlakyReporter implements Reporter {
  private flakyTests: Map<string, number> = new Map();

  onTestEnd(test: TestCase, result: TestResult) {
    if (result.status === 'passed' && result.retry > 0) {
      // Test passed on retry = flaky
      const key = `${test.location.file}:${test.title}`;
      this.flakyTests.set(key, (this.flakyTests.get(key) || 0) + 1);
    }
  }

  onEnd() {
    if (this.flakyTests.size > 0) {
      const report = {
        timestamp: new Date().toISOString(),
        flakyTests: Object.fromEntries(this.flakyTests),
      };
      fs.writeFileSync('flaky-tests.json', JSON.stringify(report, null, 2));
      console.log(`Found ${this.flakyTests.size} flaky tests`);
    }
  }
}

export default FlakyReporter;
```

## Test Data Management

### Factory Pattern

```typescript
// factories/user.factory.ts
import { faker } from '@faker-js/faker';

interface User {
  email: string;
  name: string;
  role: 'admin' | 'user';
}

export function createUser(overrides: Partial<User> = {}): User {
  return {
    email: faker.internet.email(),
    name: faker.person.fullName(),
    role: 'user',
    ...overrides,
  };
}

export function createUsers(count: number, overrides: Partial<User> = {}): User[] {
  return Array.from({ length: count }, () => createUser(overrides));
}

// Database seeding
// seed.ts
import { prisma } from './db';
import { createUser, createUsers } from './factories/user.factory';

async function seed() {
  // Create admin
  await prisma.user.create({
    data: createUser({ email: 'admin@test.com', role: 'admin' }),
  });

  // Create test users
  const users = createUsers(10);
  await prisma.user.createMany({ data: users });
}
```

### Test Isolation

```typescript
// Reset database between tests
test.beforeEach(async () => {
  await prisma.$executeRaw`TRUNCATE users, orders CASCADE`;
});

// Or use transactions that roll back
test.beforeEach(async () => {
  await prisma.$executeRaw`BEGIN`;
});

test.afterEach(async () => {
  await prisma.$executeRaw`ROLLBACK`;
});
```

## Performance Testing

### k6 Load Testing

```javascript
// load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 20 },  // Ramp up
    { duration: '1m', target: 20 },   // Stay at 20
    { duration: '30s', target: 50 },  // Ramp up more
    { duration: '1m', target: 50 },   // Stay at 50
    { duration: '30s', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],  // 95% under 500ms
    http_req_failed: ['rate<0.01'],    // Error rate under 1%
  },
};

export default function () {
  const res = http.get('http://localhost:3000/api/users');
  
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time OK': (r) => r.timings.duration < 500,
  });
  
  sleep(1);
}
```

## Anti-Patterns to Avoid

| Anti-Pattern | Better Approach |
|--------------|-----------------|
| Hard-coded waits | Condition-based waits |
| Fragile CSS selectors | Test IDs or ARIA roles |
| Tests depending on order | Independent, isolated tests |
| Testing third-party services | Mock external dependencies |
| Ignoring flaky tests | Fix root cause or quarantine |
| No test data cleanup | Reset state between tests |
| Giant test files | Organized by feature |

## Test Automation Checklist

### Framework Setup
- [ ] Framework selected and configured
- [ ] Page Object Model structure
- [ ] Test fixtures for common scenarios
- [ ] Parallel execution enabled
- [ ] Retries configured for CI

### CI/CD Integration
- [ ] Tests run on every PR
- [ ] Test results reported
- [ ] Screenshots/videos on failure
- [ ] Flaky test tracking
- [ ] Performance benchmarks

### Maintenance
- [ ] Regular review of flaky tests
- [ ] Test coverage monitoring
- [ ] Documentation updated
- [ ] Quarterly cleanup of obsolete tests

## Constraints

- Tests must be independent and isolated
- No hard-coded waits (use conditions)
- Use semantic selectors (roles, test IDs)
- Keep tests maintainable over comprehensive
- Fix flaky tests immediately

## Related Skills

- `qa-expert` - Test strategy
- `devops-engineer` - CI/CD pipelines
- `frontend-developer` - UI testing
- `backend-developer` - API testing
