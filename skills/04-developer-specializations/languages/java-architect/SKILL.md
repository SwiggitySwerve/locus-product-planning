---
name: java-architect
description: Advanced Java expertise including modern Java features, Spring ecosystem, enterprise patterns, JVM tuning, and large-scale application design
metadata:
  version: "1.0.0"
  tier: developer-specialization
  category: languages
  council: code-review-council
---

# Java Architect

You embody the perspective of a Java expert with deep knowledge of the JVM, enterprise patterns, and best practices for building scalable, maintainable Java applications.

## When to Apply

Invoke this skill when:
- Designing enterprise Java applications
- Working with Spring Boot/Spring Framework
- Optimizing JVM performance
- Implementing microservices patterns
- Migrating to modern Java versions
- Setting up build and dependency management
- Reviewing Java code for quality and patterns

## Core Competencies

### 1. Modern Java
- Java 17-21 features
- Records and sealed classes
- Pattern matching
- Virtual threads (Project Loom)
- Text blocks and new APIs

### 2. Spring Ecosystem
- Spring Boot best practices
- Spring Security
- Spring Data
- Spring Cloud for microservices
- Reactive programming with WebFlux

### 3. JVM Mastery
- Garbage collection tuning
- Memory management
- JIT compilation
- Performance profiling
- Native compilation (GraalVM)

### 4. Enterprise Patterns
- Domain-Driven Design
- Clean Architecture
- CQRS and Event Sourcing
- Saga patterns
- API Gateway patterns

## Modern Java Features

### Records
```java
// Immutable data carriers
public record User(
    Long id,
    String name,
    String email,
    Instant createdAt
) {
    // Compact constructor for validation
    public User {
        Objects.requireNonNull(name, "name required");
        Objects.requireNonNull(email, "email required");
    }
    
    // Additional methods if needed
    public User withEmail(String newEmail) {
        return new User(id, name, newEmail, createdAt);
    }
}
```

### Sealed Classes
```java
// Exhaustive type hierarchies
public sealed interface PaymentMethod 
    permits CreditCard, DebitCard, BankTransfer, Crypto {
}

public record CreditCard(String number, String cvv, YearMonth expiry) 
    implements PaymentMethod {}

public record DebitCard(String number, String pin) 
    implements PaymentMethod {}

public record BankTransfer(String iban, String bic) 
    implements PaymentMethod {}

public record Crypto(String walletAddress, CryptoType type) 
    implements PaymentMethod {}
```

### Pattern Matching
```java
// Switch expressions with pattern matching
public String processPayment(PaymentMethod method, Amount amount) {
    return switch (method) {
        case CreditCard cc when amount.isOver(1000) -> 
            processHighValueCard(cc, amount);
        case CreditCard cc -> 
            processCard(cc, amount);
        case DebitCard dc -> 
            processDebit(dc, amount);
        case BankTransfer bt -> 
            processTransfer(bt, amount);
        case Crypto c -> 
            processCrypto(c, amount);
    };
}
```

### Virtual Threads
```java
// Lightweight concurrency
try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
    List<Future<Result>> futures = tasks.stream()
        .map(task -> executor.submit(() -> process(task)))
        .toList();
    
    List<Result> results = futures.stream()
        .map(Future::get)
        .toList();
}
```

## Spring Boot Patterns

### Controller Layer
```java
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    
    private final UserService userService;
    
    @GetMapping("/{id}")
    public ResponseEntity<UserDto> getUser(@PathVariable Long id) {
        return userService.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    public ResponseEntity<UserDto> createUser(
            @Valid @RequestBody CreateUserRequest request) {
        UserDto user = userService.create(request);
        URI location = ServletUriComponentsBuilder
            .fromCurrentRequest()
            .path("/{id}")
            .buildAndExpand(user.id())
            .toUri();
        return ResponseEntity.created(location).body(user);
    }
}
```

### Service Layer
```java
@Service
@Transactional
@RequiredArgsConstructor
public class UserService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EventPublisher eventPublisher;
    
    public UserDto create(CreateUserRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new EmailAlreadyExistsException(request.email());
        }
        
        User user = User.builder()
            .email(request.email())
            .password(passwordEncoder.encode(request.password()))
            .name(request.name())
            .build();
        
        User saved = userRepository.save(user);
        eventPublisher.publish(new UserCreatedEvent(saved.getId()));
        
        return UserDto.from(saved);
    }
}
```

### Exception Handling
```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(EntityNotFoundException ex) {
        return ResponseEntity
            .status(HttpStatus.NOT_FOUND)
            .body(new ErrorResponse("NOT_FOUND", ex.getMessage()));
    }
    
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(
            MethodArgumentNotValidException ex) {
        List<FieldError> errors = ex.getBindingResult()
            .getFieldErrors()
            .stream()
            .map(e -> new FieldError(e.getField(), e.getDefaultMessage()))
            .toList();
        return ResponseEntity
            .badRequest()
            .body(new ErrorResponse("VALIDATION_ERROR", "Validation failed", errors));
    }
}
```

## JVM Tuning

### Recommended JVM Flags
```bash
# Modern GC settings (Java 17+)
java -XX:+UseG1GC \
     -XX:MaxGCPauseMillis=200 \
     -XX:+UseStringDeduplication \
     -Xms2g -Xmx2g \
     -jar app.jar

# For low-latency
java -XX:+UseZGC \
     -Xms4g -Xmx4g \
     -jar app.jar
```

### Profiling
```java
// JFR (Java Flight Recorder)
java -XX:+FlightRecorder \
     -XX:StartFlightRecording=duration=60s,filename=recording.jfr \
     -jar app.jar

// Async-profiler for flame graphs
./profiler.sh -d 30 -f flamegraph.html <pid>
```

## Project Structure

```
my-app/
├── pom.xml (or build.gradle.kts)
├── src/main/java/com/example/
│   ├── Application.java
│   ├── config/
│   ├── controller/
│   ├── service/
│   ├── repository/
│   ├── domain/
│   │   ├── model/
│   │   └── event/
│   ├── dto/
│   └── exception/
├── src/main/resources/
│   ├── application.yml
│   └── application-prod.yml
└── src/test/java/
```

## Anti-Patterns to Avoid

| Anti-Pattern | Why Bad | Better Approach |
|--------------|---------|-----------------|
| Null returns | NPE risk | `Optional<T>` |
| Checked exceptions everywhere | Noisy code | Use runtime exceptions |
| Mutable DTOs | Thread unsafe | Records or immutable |
| Field injection | Hard to test | Constructor injection |
| Long methods | Hard to read | Extract methods |
| `new` in services | Hard to test | Dependency injection |

## Constraints

- Use `final` for fields where possible
- Prefer immutable objects (records)
- Use `Optional` instead of null returns
- Keep methods under 20 lines
- Use constructor injection
- Follow Spring's conventions

## Related Skills

- `backend-developer` - General backend patterns
- `devops-engineer` - Deployment and JVM tuning
- `security-engineer` - Spring Security patterns
