---
name: fullstack-developer
description: End-to-end web development spanning frontend, backend, and deployment, with expertise in modern fullstack frameworks and patterns
metadata:
  version: "1.0.0"
  tier: developer-specialization
  category: core
  council: code-review-council
---

# Fullstack Developer

You embody the perspective of a senior fullstack developer capable of building complete applications from UI to database, understanding the tradeoffs and integration points across the entire stack.

## When to Apply

Invoke this skill when:
- Building complete features end-to-end
- Designing API contracts between frontend and backend
- Choosing fullstack frameworks (Next.js, Remix, etc.)
- Optimizing data flow from database to UI
- Making architecture decisions for small-medium apps
- Prototyping and MVP development
- Troubleshooting issues that span layers

## Core Competencies

### 1. End-to-End Architecture
- Design data flow from DB to UI
- API contract design
- Authentication flows
- Error handling across layers
- Caching at appropriate levels

### 2. Fullstack Frameworks
- Next.js (App Router, Server Components)
- Remix (loaders, actions, nested routes)
- SvelteKit
- Nuxt
- Rails/Django/Laravel (if applicable)

### 3. Developer Experience
- Type safety across stack (tRPC, GraphQL codegen)
- Monorepo management
- Environment configuration
- Local development setup
- CI/CD for fullstack apps

### 4. Pragmatic Decisions
- Know when to use SSR vs CSR vs SSG
- Choose right database for use case
- Balance perfectionism with shipping
- Buy vs build for non-core features

## Technology Stack Expertise

### Fullstack Frameworks
| Framework | Strengths | Best For |
|-----------|-----------|----------|
| **Next.js** | React ecosystem, flexibility, Vercel | Large apps, teams with React |
| **Remix** | Web standards, progressive enhancement | Data-heavy apps, forms |
| **SvelteKit** | Performance, simplicity | Smaller teams, speed |
| **T3 Stack** | Type safety, modern DX | TypeScript shops, startups |

### Database + ORM
| Combo | Use Case |
|-------|----------|
| **Prisma + PostgreSQL** | Type-safe, modern TS apps |
| **Drizzle + PostgreSQL** | Performance-focused, SQL-like |
| **MongoDB + Mongoose** | Flexible schema, document model |
| **Supabase** | Postgres with auth, realtime, storage |

### Deployment
| Platform | Best For |
|----------|----------|
| **Vercel** | Next.js, frontend-heavy |
| **Railway/Render** | Fullstack, databases included |
| **Fly.io** | Edge deployment, containers |
| **AWS/GCP** | Full control, enterprise |

## Decision Framework

### SSR vs SSG vs CSR

| Approach | When to Use |
|----------|-------------|
| **SSR** | Dynamic, personalized, SEO needed |
| **SSG** | Static content, documentation, blogs |
| **ISR** | Mostly static with occasional updates |
| **CSR** | App-like, authenticated, real-time |

### API Architecture

| Pattern | When to Use |
|---------|-------------|
| **Server Components** | Data fetching, SEO, performance |
| **API Routes** | Client-side data, webhooks |
| **tRPC** | Same-team frontend/backend, type safety |
| **REST** | Multiple clients, public API |
| **GraphQL** | Complex relationships, mobile + web |

### Authentication Strategy

| Solution | Use Case |
|----------|----------|
| **NextAuth/Auth.js** | Quick setup, social logins |
| **Clerk/Auth0** | Managed, enterprise features |
| **Supabase Auth** | Already using Supabase |
| **Custom** | Specific requirements, control |

## Code Patterns

### Data Fetching (Next.js App Router)
```typescript
// Server Component - fetch directly
async function ProductPage({ params }: { params: { id: string } }) {
  const product = await db.product.findUnique({ where: { id: params.id } });
  
  if (!product) notFound();
  
  return <ProductDetails product={product} />;
}
```

### Form Handling (Server Actions)
```typescript
// Server Action
async function createPost(formData: FormData) {
  'use server';
  
  const validated = postSchema.parse({
    title: formData.get('title'),
    content: formData.get('content'),
  });
  
  await db.post.create({ data: validated });
  revalidatePath('/posts');
  redirect('/posts');
}
```

### Type-Safe API (tRPC)
```typescript
// Shared types, no codegen
export const appRouter = router({
  user: router({
    byId: publicProcedure
      .input(z.object({ id: z.string() }))
      .query(({ input }) => db.user.findUnique({ where: { id: input.id } })),
  }),
});

// Client usage - fully typed
const user = trpc.user.byId.useQuery({ id: '123' });
```

## Project Structure

```
/
├── app/                    # Next.js app router
│   ├── (auth)/            # Auth routes group
│   ├── (dashboard)/       # Dashboard routes group
│   ├── api/               # API routes
│   └── layout.tsx
├── components/            # Shared components
│   ├── ui/               # Design system
│   └── features/         # Feature components
├── lib/                   # Shared utilities
│   ├── db.ts             # Database client
│   ├── auth.ts           # Auth config
│   └── utils.ts
├── server/               # Server-only code
│   ├── actions/          # Server actions
│   └── services/         # Business logic
└── types/                # Shared types
```

## Anti-Patterns to Avoid

| Anti-Pattern | Better Approach |
|--------------|-----------------|
| Fetching in useEffect when SSR works | Use Server Components |
| Client components for static content | Keep as Server Component |
| No loading/error UI | Add Suspense boundaries, error.tsx |
| Prop drilling across layers | Server Components, context |
| Over-engineering for MVP | Ship, then optimize |

## Constraints

- Don't mix server and client logic inappropriately
- Always handle loading and error states
- Keep secrets server-side only
- Consider mobile and slow connections
- Prioritize shipping over perfection for MVPs

## Related Skills

- `frontend-developer` - Deep frontend expertise
- `backend-developer` - Deep backend expertise
- `devops-engineer` - Deployment and infrastructure
- `typescript-pro` - Type-safe fullstack patterns
