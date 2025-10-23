# Installation Guide

This guide provides detailed instructions for setting up the Daily-Dairy-AI application on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Java 17+** (required for Spring Boot backend)
- **Node.js 18+** and npm (required for React frontend)
- **Ollama** (for local AI model hosting)
- **Git** (for cloning the repository)
- **Docker** (optional, for containerized deployment)

## Backend Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yash1648/Daily-Dairy-AI.git
cd Daily-Dairy-AI
```

### 2. Configure the Backend

Navigate to the backend directory:

```bash
cd backend
```

Create or edit `src/main/resources/application.properties` with the following configuration:

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

### 3. Build and Run the Backend

Using Maven wrapper:

```bash
./mvnw clean install
./mvnw spring-boot:run
```

The backend server will start on http://localhost:8080.

## Frontend Setup

### 1. Navigate to the Frontend Directory

```bash
cd ../frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the frontend directory:

```
VITE_API_URL=http://localhost:8080/api
```

### 4. Start the Development Server

```bash
npm run dev
```

The frontend development server will start on http://localhost:5173.

## Ollama Setup

### 1. Install Ollama

Follow the instructions on the [Ollama website](https://ollama.com/download) to install Ollama for your operating system.

### 2. Pull the Required Model

```bash
ollama pull gemma3:latest
```

### 3. Start Ollama

```bash
ollama serve
```

Ollama will start on http://localhost:11434.

## Docker Deployment (Optional)

### 1. Build Docker Images

```bash
# Build backend image
cd backend
docker build -t daily-dairy-backend .

# Build frontend image
cd ../frontend
docker build -t daily-dairy-frontend .
```

### 2. Run with Docker Compose

Create a `docker-compose.yml` file in the root directory:

```yaml
version: '3'
services:
  backend:
    image: daily-dairy-backend
    ports:
      - "8080:8080"
    environment:
      - SPRING_AI_OLLAMA_BASE_URL=http://ollama:11434
    depends_on:
      - ollama

  frontend:
    image: daily-dairy-frontend
    ports:
      - "5173:80"
    depends_on:
      - backend

  ollama:
    image: ollama/ollama
    ports:
      - "11434:11434"
    volumes:
      - ollama_data:/root/.ollama
    command: serve

volumes:
  ollama_data:
```

Start the services:

```bash
docker-compose up -d
```

## Verifying Installation

1. Open your browser and navigate to http://localhost:5173
2. You should see the Daily-Dairy-AI login page
3. Create an account or log in with the default admin credentials (if configured)
4. Start journaling with AI assistance!

## Troubleshooting

### Common Issues

1. **Backend fails to start**
   - Ensure Java 17+ is installed: `java -version`
   - Check if port 8080 is already in use: `netstat -ano | findstr 8080`

2. **Frontend fails to start**
   - Ensure Node.js is installed: `node -v`
   - Check if port 5173 is already in use: `netstat -ano | findstr 5173`

3. **AI model not responding**
   - Ensure Ollama is running: `curl http://localhost:11434/api/tags`
   - Check if the model is downloaded: `ollama list`

### Getting Help

If you encounter any issues not covered here, please:
1. Check the [GitHub Issues](https://github.com/yash1648/Daily-Dairy-AI/issues) for similar problems
2. Open a new issue with detailed information about your problem