# Contributing Guidelines

Thank you for your interest in contributing to Daily-Dairy-AI! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md) to foster an inclusive and respectful community.

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in the [Issues](https://github.com/yash1648/Daily-Dairy-AI/issues)
2. If not, create a new issue with a descriptive title and detailed information:
   - Steps to reproduce
   - Expected behavior
   - Actual behavior
   - Screenshots (if applicable)
   - Environment details (OS, browser, etc.)

### Suggesting Features

1. Check if the feature has already been suggested in the [Issues](https://github.com/yash1648/Daily-Dairy-AI/issues)
2. If not, create a new issue with a descriptive title and detailed information:
   - Clear description of the feature
   - Rationale for the feature
   - Potential implementation approach (if you have ideas)

### Pull Requests

1. Fork the repository
2. Create a new branch from `main`
3. Make your changes
4. Run tests and ensure they pass
5. Submit a pull request to the `main` branch

## Development Setup

See the [Installation Guide](INSTALLATION.md) for detailed setup instructions.

## Coding Standards

### General Guidelines

- Write clean, readable, and maintainable code
- Follow the existing code style and patterns
- Add comments for complex logic
- Write tests for new features and bug fixes

### Backend (Java)

- Follow [Google Java Style Guide](https://google.github.io/styleguide/javaguide.html)
- Use meaningful variable and method names
- Write JavaDoc comments for public methods
- Organize imports alphabetically
- Use proper exception handling

### Frontend (React/TypeScript)

- Follow [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- Use TypeScript for type safety
- Use functional components with hooks
- Use proper component organization
- Follow React best practices

## Testing

- Write unit tests for new features
- Ensure all tests pass before submitting a pull request
- Aim for good test coverage

## Documentation

- Update documentation for new features or changes
- Use clear and concise language
- Include examples where appropriate

## Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

Types:
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code changes that neither fix bugs nor add features
- `test`: Adding or modifying tests
- `chore`: Changes to the build process or auxiliary tools

Example:
```
feat(journal): add AI-powered journal suggestions

Add a new feature that suggests journal topics based on user's past entries.
Uses the Ollama AI model to generate personalized suggestions.

Closes #123
```

## Review Process

1. All pull requests require at least one review before merging
2. Address all review comments
3. Ensure CI checks pass
4. Maintainers will merge approved pull requests

## Release Process

1. Maintainers will create releases
2. Releases follow [Semantic Versioning](https://semver.org/)
3. Release notes will be published with each release

Thank you for contributing to Daily-Dairy-AI!