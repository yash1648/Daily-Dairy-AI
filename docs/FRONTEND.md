```
# Frontend Documentation

This document provides an overview of the Daily-Dairy-AI frontend architecture, components, and implementation details.

## Docker Deployment

The frontend can be deployed using Docker. A Dockerfile is provided in the `frontend` directory that creates a multi-stage build:

1. **Build stage**: Uses Node.js to build the React application
2. **Runtime stage**: Uses Nginx to serve the static files

To build and run the frontend using Docker:

```bash
cd frontend
docker build -t daily-dairy-frontend .
docker run -p 80:80 daily-dairy-frontend
```

For complete deployment with all services, use the Docker Compose configuration in the project root.

## Technology Stack

- **React**: UI library
- **TypeScript**: Type-safe JavaScript
- **Vite**: Build tool and development server
- **Tailwind CSS**: Utility-first CSS framework
- **ShadcnUI**: Component library based on Radix UI
- **React Router**: Client-side routing
- **React Query**: Data fetching and state management

## Project Structure

```
frontend/
├── public/                # Static assets
├── src/
│   ├── apis/             # API client and service functions
│   ├── components/       # Reusable UI components
│   ├── contexts/         # React context providers
│   ├── hooks/            # Custom React hooks
│   ├── layouts/          # Page layout components
│   ├── lib/              # Utility functions and constants
│   ├── pages/            # Page components
│   ├── App.tsx           # Main application component
│   ├── App.css           # Global styles
│   ├── index.css         # Tailwind imports
│   ├── main.tsx          # Application entry point
│   └── vite-env.d.ts     # Vite type declarations
├── .gitignore            # Git ignore file
├── components.json       # ShadcnUI configuration
├── eslint.config.js      # ESLint configuration
├── index.html            # HTML entry point
├── package.json          # Dependencies and scripts
├── postcss.config.js     # PostCSS configuration
├── tailwind.config.ts    # Tailwind CSS configuration
├── tsconfig.json         # TypeScript configuration
└── vite.config.ts        # Vite configuration
```

## Key Components

### Authentication

- **LoginPage**: User login interface
- **RegisterPage**: User registration interface
- **AuthContext**: Manages authentication state
- **ProtectedRoute**: Route component that requires authentication

### Journal Interface

- **JournalEditor**: Rich text editor for journal entries
- **AIAssistant**: Interface for AI-powered writing assistance
- **EntryList**: List of journal entries with filtering and sorting
- **EntryDetail**: Detailed view of a journal entry

### WebSocket Communication

- **WebSocketProvider**: Manages WebSocket connection
- **useWebSocket**: Hook for WebSocket interactions
- **MessageHandler**: Processes incoming WebSocket messages

### UI Components

- **Button**: Customizable button component
- **Input**: Form input component
- **Dialog**: Modal dialog component
- **Dropdown**: Dropdown menu component
- **Toast**: Notification component

## State Management

- **React Context**: For global state (auth, theme, etc.)
- **React Query**: For server state (API data)
- **Local State**: For component-specific state

## API Integration

The frontend communicates with the backend through a set of API services:

- **authApi**: Authentication-related API calls
- **journalApi**: Journal entry management
- **aiApi**: AI-powered text generation

## Routing

Client-side routing is implemented using React Router:

```typescript
// Example routing configuration
<Routes>
  <Route path="/" element={<Layout />}>
    <Route index element={<HomePage />} />
    <Route path="login" element={<LoginPage />} />
    <Route path="register" element={<RegisterPage />} />
    <Route element={<ProtectedRoute />}>
      <Route path="journal" element={<JournalPage />} />
      <Route path="journal/:id" element={<EntryDetailPage />} />
      <Route path="settings" element={<SettingsPage />} />
    </Route>
    <Route path="*" element={<NotFoundPage />} />
  </Route>
</Routes>
```

## Theming and Styling

- **Tailwind CSS**: For utility-based styling
- **CSS Variables**: For theme customization
- **Dark Mode**: Toggle between light and dark themes

## Error Handling

- **ErrorBoundary**: Catches and displays errors in components
- **API Error Handling**: Standardized error handling for API calls
- **Form Validation**: Client-side validation for form inputs

## Performance Optimizations

- **Code Splitting**: Lazy loading of components
- **Memoization**: Preventing unnecessary re-renders
- **Asset Optimization**: Optimizing images and other assets

## Accessibility

- **ARIA Attributes**: For screen reader support
- **Keyboard Navigation**: For keyboard-only users
- **Focus Management**: For improved user experience

## Testing

- **Unit Tests**: Testing individual components
- **Integration Tests**: Testing component interactions
- **E2E Tests**: Testing the entire application flow

## Build and Deployment

- **Development**: `npm run dev`
- **Production Build**: `npm run build`
- **Preview Production Build**: `npm run preview`

For detailed setup instructions, see [INSTALLATION.md](./INSTALLATION.md).