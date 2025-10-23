# Daily-Dairy-AI

**Daily Dairy AI** is an intelligent journaling application designed to help users document their daily thoughts, experiences, and reflections effortlessly. It leverages advanced AI models to generate creative and helpful responses, making journaling more engaging and personalized.

![Daily Dairy AI Logo](./frontend/public/favicon.ico)

## 📋 Features

- **AI-Powered Journaling**: Automatically generate diary entries, creative stories, and reflections using customizable AI prompts.
- **WebSocket-based Real-Time Interaction**: Communicate with the AI assistant in real-time via authenticated WebSocket sessions.
- **User Authentication**: Secure login and signup flows with JWT-based authentication.
- **Prompt Templates**: Supports multiple prompt templates including custom assistant and creative writing modes.
- **Admin Session Management**: Track active user sessions for administrative purposes.
- **Error Handling**: Robust error handling for AI service failures and bad requests.
- **Modern UI**: Clean, responsive interface built with React and Tailwind CSS.
- **Data Persistence**: Store journal entries securely with database integration.

## 🛠️ Technologies Used

### Backend
- **Java 17+**: Core programming language
- **Spring Boot**: Application framework
- **Spring Security**: Authentication and authorization
- **Spring AI**: AI model integration
- **Ollama**: Local AI model (e.g., Gemma3:latest)
- **JWT & BCrypt**: Secure authentication
- **Spring WebSocket**: Real-time communication

### Frontend
- **React**: UI library
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **Vite**: Build tool
- **ShadcnUI**: Component library

## 🚀 Getting Started

For detailed setup instructions, see our [Installation Guide](./docs/INSTALLATION.md).

### Prerequisites

- Java 17+ (for Spring Boot backend)
- Ollama AI model (local/remote)
- Node.js & npm (for React frontend)
- Docker (optional, for easier deployment)

### Quick Start

#### 1. Clone the Repository

```bash
git clone https://github.com/yash1648/Daily-Dairy-AI.git
cd Daily-Dairy-AI
```

#### 2. Set Up Backend

```bash
cd backend
./mvnw spring-boot:run
```

#### 3. Set Up Frontend

```bash
cd frontend
npm install
npm run dev
```

## 📚 Documentation

- [API Documentation](./docs/API.md): Detailed API endpoints and usage
- [Backend Documentation](./docs/BACKEND.md): Backend architecture and components
- [Frontend Documentation](./docs/FRONTEND.md): Frontend architecture and components
- [Contributing Guidelines](./docs/CONTRIBUTING.md): How to contribute to the project

## 🔌 API Endpoints

For a complete list of API endpoints, see our [API Documentation](./docs/API.md).

Key endpoints:
- **POST `/api/ai/generate`**: Generate AI-powered journal entries
- **WebSocket `/ws/ai`**: Real-time AI interaction

## 🔒 Security

- Passwords are hashed using BCrypt
- JWT-based authentication secures API and WebSocket sessions
- HTTPS recommended for production deployment
- Regular security updates and dependency maintenance

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](./docs/CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 📬 Contact

For questions or support, please open an issue on our GitHub repository.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for feature requests, bug fixes, or improvements.

## License

Currently no explicit license. Please contact the repository owner for information.

## Author

[Yash1648](https://github.com/yash1648)

---

**Daily Dairy AI** – Journal smarter, reflect deeper.

