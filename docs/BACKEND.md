```
# Backend Documentation

This document provides an overview of the Daily-Dairy-AI backend architecture, components, and implementation details.

## Docker Deployment

The backend can be deployed using Docker. A Dockerfile is provided in the `backend` directory that creates a multi-stage build:

1. **Build stage**: Uses Maven to compile and package the application
2. **Runtime stage**: Uses a lightweight JRE image to run the application

To build and run the backend using Docker:

```bash
cd backend
docker build -t daily-dairy-backend .
docker run -p 8080:8080 -e SPRING_AI_OLLAMA_BASE_URL=http://ollama:11434 daily-dairy-backend
```

For complete deployment with all services, use the Docker Compose configuration in the project root.

## Technology Stack

- **Java 17+**: Core programming language
- **Spring Boot**: Application framework
- **Spring Security**: Authentication and authorization
- **Spring AI**: AI model integration
- **Spring WebSocket**: Real-time communication
- **JWT**: JSON Web Token for authentication
- **Ollama**: Local AI model integration

## Project Structure

```
backend/
├── src/
│   ├── main/
│   │   ├── java/com/dailydairy/
│   │   │   ├── config/           # Configuration classes
│   │   │   ├── controller/       # REST API controllers
│   │   │   ├── dto/              # Data Transfer Objects
│   │   │   ├── exception/        # Custom exceptions
│   │   │   ├── model/            # Entity models
│   │   │   ├── repository/       # Data access layer
│   │   │   ├── security/         # Security configuration
│   │   │   ├── service/          # Business logic
│   │   │   ├── util/             # Utility classes
│   │   │   └── Application.java  # Main application class
│   │   └── resources/
│   │       ├── application.properties  # Application configuration
│   │       └── templates/        # Email templates, etc.
│   └── test/                     # Unit and integration tests
├── pom.xml                       # Maven dependencies
└── mvnw, mvnw.cmd                # Maven wrapper scripts
```

## Key Components

### AI Service

The AI service integrates with Ollama to provide AI-powered journaling capabilities:

- **AIController**: Handles REST API requests for AI text generation
- **AIService**: Implements business logic for AI interactions
- **PromptConfig**: Configures AI prompt templates for different use cases

### WebSocket Communication

Real-time communication is implemented using Spring WebSocket:

- **WebSocketConfig**: Configures WebSocket endpoints and handlers
- **AIWebSocketHandler**: Handles WebSocket messages and sessions
- **SessionRegistry**: Tracks active WebSocket sessions

### Authentication & Security

Security is implemented using Spring Security and JWT:

- **SecurityConfig**: Configures security rules and authentication
- **JwtTokenProvider**: Generates and validates JWT tokens
- **UserDetailsServiceImpl**: Loads user details for authentication

### Data Models

Key entity models include:

- **User**: Represents application users
- **JournalEntry**: Represents user journal entries
- **AIPromptTemplate**: Represents customizable AI prompt templates

## API Endpoints

For detailed API documentation, see [API.md](./API.md).

## Configuration

The application is configured through `application.properties`:

```properties
# Server Configuration
server.port=8080

# Database Configuration
spring.datasource.url=jdbc:h2:mem:dairydb
spring.datasource.driverClassName=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=password
spring.jpa.database-platform=org.hibernate.dialect.H2Dialect
spring.jpa.hibernate.ddl-auto=update

# AI Model Configuration
spring.ai.ollama.base-url=http://localhost:11434
spring.ai.ollama.model=gemma3:latest

# JWT Configuration
jwt.secret=your-secret-key
jwt.expiration=86400000
```

## Error Handling

The application implements a global exception handler:

- **GlobalExceptionHandler**: Handles and formats exceptions into standardized API responses
- Custom exceptions for specific error scenarios (e.g., `UserNotFoundException`, `AIServiceException`)

## Testing

The backend includes comprehensive tests:

- **Unit Tests**: Test individual components in isolation
- **Integration Tests**: Test component interactions
- **API Tests**: Test API endpoints

## Performance Considerations

- Connection pooling for database access
- Caching for frequently accessed data
- Asynchronous processing for AI requests
- WebSocket session management to prevent memory leaks

## Security Considerations

- Password hashing with BCrypt
- JWT token validation
- CSRF protection
- Input validation
- Rate limiting for API endpoints

## Deployment

The backend can be deployed as:

- Standalone JAR file
- Docker container
- Cloud service (AWS, Azure, GCP)

For deployment instructions, see [INSTALLATION.md](./INSTALLATION.md).