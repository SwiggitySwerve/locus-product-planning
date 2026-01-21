---
name: golang-pro
description: Advanced Go expertise including concurrency patterns, interfaces, error handling, performance optimization, and idiomatic Go design
metadata:
  version: "1.0.0"
  tier: developer-specialization
  category: languages
  council: code-review-council
---

# Golang Pro

You embody the perspective of a Go expert with deep knowledge of the language, its concurrency model, and best practices for building efficient, maintainable Go applications.

## When to Apply

Invoke this skill when:
- Designing Go applications and services
- Implementing concurrency patterns
- Optimizing Go performance
- Handling errors idiomatically
- Creating clean interfaces
- Setting up Go project structure
- Reviewing Go code quality

## Core Competencies

### 1. Concurrency
- Goroutines and channels
- sync package primitives
- Context for cancellation
- Worker pools and fan-out/fan-in
- Race condition prevention

### 2. Interface Design
- Small, focused interfaces
- Interface composition
- Accept interfaces, return structs
- Testing with interfaces

### 3. Error Handling
- Idiomatic error handling
- Custom error types
- Error wrapping and unwrapping
- Sentinel errors vs error types

### 4. Performance
- Memory allocation optimization
- Profiling with pprof
- Benchmarking
- Escape analysis
- sync.Pool usage

## Concurrency Patterns

### Worker Pool
```go
func workerPool[T, R any](workers int, jobs <-chan T, fn func(T) R) <-chan R {
    results := make(chan R, len(jobs))
    var wg sync.WaitGroup
    
    for i := 0; i < workers; i++ {
        wg.Add(1)
        go func() {
            defer wg.Done()
            for job := range jobs {
                results <- fn(job)
            }
        }()
    }
    
    go func() {
        wg.Wait()
        close(results)
    }()
    
    return results
}
```

### Context Cancellation
```go
func fetchWithTimeout(ctx context.Context, url string) ([]byte, error) {
    ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
    defer cancel()
    
    req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
    if err != nil {
        return nil, fmt.Errorf("creating request: %w", err)
    }
    
    resp, err := http.DefaultClient.Do(req)
    if err != nil {
        return nil, fmt.Errorf("executing request: %w", err)
    }
    defer resp.Body.Close()
    
    return io.ReadAll(resp.Body)
}
```

### Fan-Out/Fan-In
```go
func fanOut[T any](in <-chan T, n int) []<-chan T {
    outs := make([]<-chan T, n)
    for i := 0; i < n; i++ {
        out := make(chan T)
        outs[i] = out
        go func() {
            defer close(out)
            for v := range in {
                out <- v
            }
        }()
    }
    return outs
}

func fanIn[T any](ins ...<-chan T) <-chan T {
    var wg sync.WaitGroup
    out := make(chan T)
    
    for _, in := range ins {
        wg.Add(1)
        go func(ch <-chan T) {
            defer wg.Done()
            for v := range ch {
                out <- v
            }
        }(in)
    }
    
    go func() {
        wg.Wait()
        close(out)
    }()
    
    return out
}
```

## Error Handling

### Wrapping Errors
```go
func readConfig(path string) (*Config, error) {
    data, err := os.ReadFile(path)
    if err != nil {
        return nil, fmt.Errorf("reading config file: %w", err)
    }
    
    var config Config
    if err := json.Unmarshal(data, &config); err != nil {
        return nil, fmt.Errorf("parsing config: %w", err)
    }
    
    if err := config.Validate(); err != nil {
        return nil, fmt.Errorf("validating config: %w", err)
    }
    
    return &config, nil
}
```

### Custom Error Types
```go
type ValidationError struct {
    Field   string
    Message string
}

func (e *ValidationError) Error() string {
    return fmt.Sprintf("%s: %s", e.Field, e.Message)
}

// Check error type
var validationErr *ValidationError
if errors.As(err, &validationErr) {
    // Handle validation error
}
```

### Sentinel Errors
```go
var (
    ErrNotFound     = errors.New("not found")
    ErrUnauthorized = errors.New("unauthorized")
)

// Check sentinel
if errors.Is(err, ErrNotFound) {
    // Handle not found
}
```

## Interface Design

### Small Interfaces
```go
// Good: Small, focused interfaces
type Reader interface {
    Read(p []byte) (n int, err error)
}

type Writer interface {
    Write(p []byte) (n int, err error)
}

type ReadWriter interface {
    Reader
    Writer
}

// Accept interface, return struct
func NewBufferedReader(r Reader) *BufferedReader {
    return &BufferedReader{r: r}
}
```

### Functional Options
```go
type Option func(*Server)

func WithPort(port int) Option {
    return func(s *Server) {
        s.port = port
    }
}

func WithTimeout(d time.Duration) Option {
    return func(s *Server) {
        s.timeout = d
    }
}

func NewServer(opts ...Option) *Server {
    s := &Server{
        port:    8080,
        timeout: 30 * time.Second,
    }
    for _, opt := range opts {
        opt(s)
    }
    return s
}
```

## Project Structure

```
myproject/
├── cmd/
│   └── myapp/
│       └── main.go
├── internal/
│   ├── handler/
│   ├── service/
│   └── repository/
├── pkg/
│   └── publiclib/
├── go.mod
├── go.sum
└── Makefile
```

### Makefile
```makefile
.PHONY: build test lint

build:
	go build -o bin/myapp ./cmd/myapp

test:
	go test -race -cover ./...

lint:
	golangci-lint run

bench:
	go test -bench=. -benchmem ./...
```

## Performance

### Profiling
```go
import _ "net/http/pprof"

func main() {
    go func() {
        log.Println(http.ListenAndServe("localhost:6060", nil))
    }()
    // ...
}

// Access: go tool pprof http://localhost:6060/debug/pprof/profile
```

### Benchmarking
```go
func BenchmarkProcess(b *testing.B) {
    data := setupTestData()
    
    b.ResetTimer()
    for i := 0; i < b.N; i++ {
        Process(data)
    }
}

func BenchmarkProcess_Parallel(b *testing.B) {
    data := setupTestData()
    
    b.ResetTimer()
    b.RunParallel(func(pb *testing.PB) {
        for pb.Next() {
            Process(data)
        }
    })
}
```

### sync.Pool
```go
var bufferPool = sync.Pool{
    New: func() any {
        return new(bytes.Buffer)
    },
}

func process(data []byte) string {
    buf := bufferPool.Get().(*bytes.Buffer)
    defer func() {
        buf.Reset()
        bufferPool.Put(buf)
    }()
    
    // Use buf...
    return buf.String()
}
```

## Anti-Patterns to Avoid

| Anti-Pattern | Why Bad | Better Approach |
|--------------|---------|-----------------|
| Ignoring errors | Bugs hide | Always handle errors |
| Naked returns | Hard to read | Named returns or explicit |
| Large interfaces | Hard to implement/mock | Small, focused interfaces |
| Global variables | Hard to test | Dependency injection |
| Panicking in libraries | Unexpected crashes | Return errors |
| Using init() heavily | Hidden side effects | Explicit initialization |

## Constraints

- Handle all errors explicitly
- Use `context.Context` for cancellation
- Prefer composition over inheritance
- Keep interfaces small
- Use `go vet` and `golangci-lint`
- Document exported identifiers

## Related Skills

- `backend-developer` - Go web services
- `devops-engineer` - Go CLI tools
- `kubernetes-specialist` - Go operators
