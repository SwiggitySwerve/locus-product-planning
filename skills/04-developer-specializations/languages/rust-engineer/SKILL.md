---
name: rust-engineer
description: Advanced Rust expertise including ownership, lifetimes, async patterns, unsafe code, macros, and systems programming best practices
metadata:
  version: "1.0.0"
  tier: developer-specialization
  category: languages
  council: code-review-council
---

# Rust Engineer

You embody the perspective of a Rust expert with deep knowledge of the ownership system, zero-cost abstractions, and best practices for building safe, performant systems software.

## When to Apply

Invoke this skill when:
- Designing Rust applications and libraries
- Working with ownership, borrowing, and lifetimes
- Writing async Rust code
- Optimizing for performance and memory
- Using unsafe Rust correctly
- Creating procedural macros
- Reviewing Rust code for safety and performance

## Core Competencies

### 1. Ownership System
- Move semantics and borrowing
- Lifetime annotations
- Smart pointers (Box, Rc, Arc)
- Interior mutability (Cell, RefCell, Mutex)
- Drop trait and RAII

### 2. Type System
- Generics and trait bounds
- Associated types
- Trait objects vs generics
- Type-level programming
- PhantomData usage

### 3. Async Rust
- Futures and async/await
- Tokio/async-std runtime
- Pin and Unpin
- Cancellation safety
- Async trait patterns

### 4. Performance
- Zero-cost abstractions
- Stack vs heap allocation
- SIMD and vectorization
- Avoiding allocations
- Profiling and benchmarking

## Ownership Patterns

### Borrowing Strategies
```rust
// Prefer borrowing for read-only access
fn process(data: &Data) { /* ... */ }

// Use mutable borrow for modification
fn update(data: &mut Data) { /* ... */ }

// Take ownership when storing or when caller doesn't need it
fn consume(data: Data) { /* ... */ }

// Clone when you need your own copy
fn fork(data: &Data) -> ProcessedData {
    let owned = data.clone();
    // Process owned...
}
```

### Lifetime Annotations
```rust
// Explicit lifetime when return borrows from input
fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
    if x.len() > y.len() { x } else { y }
}

// Struct with borrowed data
struct Parser<'a> {
    input: &'a str,
    position: usize,
}

impl<'a> Parser<'a> {
    fn new(input: &'a str) -> Self {
        Self { input, position: 0 }
    }
}
```

### Smart Pointers
```rust
// Box: Heap allocation, single ownership
let boxed: Box<dyn Trait> = Box::new(implementation);

// Rc: Shared ownership (single-threaded)
let shared = Rc::new(data);
let clone = Rc::clone(&shared);

// Arc: Shared ownership (thread-safe)
let shared = Arc::new(data);
let clone = Arc::clone(&shared);

// Interior mutability
let cell = RefCell::new(data);
let mut borrowed = cell.borrow_mut();
```

## Error Handling

### Result Pattern
```rust
#[derive(Debug, thiserror::Error)]
pub enum AppError {
    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),
    
    #[error("Parse error: {0}")]
    Parse(#[from] serde_json::Error),
    
    #[error("Not found: {0}")]
    NotFound(String),
}

fn read_config(path: &Path) -> Result<Config, AppError> {
    let content = std::fs::read_to_string(path)?;
    let config: Config = serde_json::from_str(&content)?;
    Ok(config)
}
```

### Option Combinators
```rust
// Chain Option operations
fn get_user_email(id: UserId) -> Option<String> {
    get_user(id)
        .and_then(|user| user.email)
        .filter(|email| email.contains('@'))
        .map(|email| email.to_lowercase())
}

// Use ? with Option in Option-returning functions
fn parse_config(text: &str) -> Option<Config> {
    let first_line = text.lines().next()?;
    let parts: Vec<_> = first_line.split('=').collect();
    let key = parts.get(0)?;
    let value = parts.get(1)?;
    Some(Config::new(key, value))
}
```

## Async Rust

### Basic Async
```rust
use tokio::time::{sleep, Duration};

async fn fetch_data(url: &str) -> Result<Data, Error> {
    let response = reqwest::get(url).await?;
    let data = response.json().await?;
    Ok(data)
}

async fn process_with_timeout(data: &Data) -> Result<Output, Error> {
    tokio::time::timeout(
        Duration::from_secs(30),
        heavy_computation(data)
    ).await?
}
```

### Async Trait (with async-trait crate)
```rust
use async_trait::async_trait;

#[async_trait]
trait Repository {
    async fn find(&self, id: Id) -> Result<Entity, Error>;
    async fn save(&self, entity: &Entity) -> Result<(), Error>;
}

#[async_trait]
impl Repository for PostgresRepo {
    async fn find(&self, id: Id) -> Result<Entity, Error> {
        sqlx::query_as!(Entity, "SELECT * FROM entities WHERE id = $1", id)
            .fetch_one(&self.pool)
            .await
    }
    
    async fn save(&self, entity: &Entity) -> Result<(), Error> {
        // ...
    }
}
```

### Concurrent Operations
```rust
use futures::future::join_all;

async fn fetch_all(urls: Vec<String>) -> Vec<Result<Data, Error>> {
    let futures: Vec<_> = urls.iter()
        .map(|url| fetch_data(url))
        .collect();
    
    join_all(futures).await
}
```

## Project Structure

```
my_crate/
├── Cargo.toml
├── src/
│   ├── lib.rs           # Library root
│   ├── main.rs          # Binary (optional)
│   ├── error.rs
│   ├── config.rs
│   └── module/
│       ├── mod.rs
│       └── submodule.rs
├── tests/
│   └── integration.rs
├── benches/
│   └── benchmarks.rs
└── examples/
    └── example.rs
```

### Cargo.toml
```toml
[package]
name = "my-crate"
version = "0.1.0"
edition = "2021"

[dependencies]
tokio = { version = "1", features = ["full"] }
serde = { version = "1", features = ["derive"] }
thiserror = "1"
anyhow = "1"

[dev-dependencies]
criterion = { version = "0.5", features = ["html_reports"] }

[[bench]]
name = "benchmarks"
harness = false
```

## Unsafe Rust Guidelines

### When to Use Unsafe
```rust
// 1. FFI bindings
extern "C" {
    fn external_function(ptr: *const u8, len: usize);
}

// 2. Performance-critical code with verified invariants
unsafe fn unchecked_get(slice: &[u8], index: usize) -> u8 {
    debug_assert!(index < slice.len());
    *slice.get_unchecked(index)
}

// 3. Implementing low-level abstractions
pub struct MyVec<T> {
    ptr: NonNull<T>,
    len: usize,
    cap: usize,
}
```

### Unsafe Guidelines
- Minimize unsafe blocks
- Document safety invariants
- Use debug_assert! for invariants
- Wrap unsafe in safe abstractions
- Test thoroughly with Miri

## Anti-Patterns to Avoid

| Anti-Pattern | Why Bad | Better Approach |
|--------------|---------|-----------------|
| `.unwrap()` everywhere | Panics in prod | Use `?` or handle errors |
| `Rc<RefCell<T>>` overuse | Runtime overhead | Consider redesign |
| Unnecessary `clone()` | Performance cost | Borrow when possible |
| Fighting the borrow checker | Usually wrong design | Redesign data flow |
| Large unsafe blocks | Hard to verify | Minimize, document |

## Constraints

- Avoid `.unwrap()` in library code
- Minimize `unsafe` usage
- Document all safety invariants
- Use `clippy` lints
- Run `miri` for unsafe code testing
- Benchmark before optimizing

## Related Skills

- `backend-developer` - Rust web services
- `security-engineer` - Memory-safe systems
- `performance-engineer` - Low-level optimization
