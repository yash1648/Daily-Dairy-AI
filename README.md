# Daily-Dairy-AI

**Daily Dairy AI** is an intelligent journaling application designed to help users document their daily thoughts, experiences, and reflections effortlessly. It leverages advanced AI models to generate creative and helpful responses, making journaling more engaging and personalized.

## Features

- **AI-Powered Journaling**: Automatically generate diary entries, creative stories, and reflections using customizable AI prompts.
- **WebSocket-based Real-Time Interaction**: Communicate with the AI assistant in real-time via authenticated WebSocket sessions.
- **User Authentication**: Secure login and signup flows with JWT-based authentication.
- **Prompt Templates**: Supports multiple prompt templates including custom assistant and creative writing modes.
- **Admin Session Management**: Track active user sessions for administrative purposes.
- **Error Handling**: Robust error handling for AI service failures and bad requests.

## Technologies Used

- **Backend**: Java, Spring Boot, Spring Security
- **AI Model Integration**: [Spring AI](https://github.com/spring-projects/spring-ai), Ollama (e.g., Gemma3:latest)
- **Authentication**: JWT, BCrypt
- **WebSocket**: Spring WebSocket

## Getting Started

### Prerequisites

- Java 17+ (for Spring Boot backend)
- Ollama AI model (local/remote)
- Node.js & npm (if frontend is present, not described in backend code)
- Docker (optional, for easier deployment)

### Setup Instructions

#### 1. Clone the Repository

```bash
git clone https://github.com/yash1648/Daily-Dairy-AI.git
cd Daily-Dairy-AI
```

#### 2. Configure the Backend

- Edit `src/main/resources/application.properties` for your database and AI model configuration.
- Ensure Ollama AI is running and accessible (see [Ollama documentation](https://ollama.com/)).

#### 3. Build and Run

```bash
./mvnw spring-boot:run
```

#### 4. API Endpoints

- **POST `/api/ai/generate`**  
  Generate text using the AI assistant.
  ```json
  {
    "template": "default",
    "variables": {
      "domain": "journaling",
      "format": "paragraph",
      "keyPoints": "positivity, gratitude",
      "input": "How was my day?"
    }
  }
  ```
- **GET `/api/ai/websocket/status`**  
  Returns current WebSocket session status for the authenticated user.

#### 5. WebSocket Endpoint

Connect to:  
`ws://<your-server>/ws/ai`  
Send messages in the format:
```json
{
  "prompt": "Write a happy memory from today.",
  "templateId": "creative"
}
```

#### 6. Authentication

- Signup and login with username/password.
- JWT tokens are required for authenticated requests.

## Example Usage

- **AI Diary Entry**  
  Send your daily thoughts to `/api/ai/generate` and get a reflective, well-formatted diary entry.
- **Creative Story**  
  Use the "creative" template to generate short stories with custom characters, settings, and themes.

## Customizing Prompt Templates

Edit `PromptConfig.java` to define your own AI prompt templates for various use cases.

## Security

- Passwords are hashed using BCrypt.
- JWT-based authentication secures API and WebSocket sessions.
- Admins can view active user sessions for monitoring.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for feature requests, bug fixes, or improvements.

## License

Currently no explicit license. Please contact the repository owner for information.

## Author

[Yash1648](https://github.com/yash1648)

---

**Daily Dairy AI** – Journal smarter, reflect deeper.
