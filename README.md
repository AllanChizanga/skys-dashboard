# Skies UniConnect Dashboard

A React-based administrative dashboard for managing the Skies UniConnect educational platform. This dashboard provides comprehensive management tools for student applications, document handling, chat analytics, and administrative oversight.

## Project Overview

Skies UniConnect is an educational platform that helps students with university applications and study abroad processes. This dashboard serves as the administrative interface for managing:

- Student applications and registrations
- Document management (ID documents, result documents, acceptance letters)
- ChatBot analytics and user interactions
- University programs and scholarships
- FAQ management
- User administration

## Technology Stack

- **Frontend Framework**: React 19.1.0
- **Build Tool**: Vite 7.0.0
- **State Management**: Redux Toolkit with RTK Query
- **Styling**: Bootstrap 5.3.7 + React Bootstrap 2.10.10
- **Routing**: React Router DOM 7.6.3
- **Charts**: Chart.js 4.5.0 + React Chart.js 2
- **HTTP Client**: Axios 1.10.0
- **PDF Generation**: html2pdf.js 0.10.3
- **Icons**: React Icons 5.5.0

## Redux State Management

The application uses **Redux Toolkit** for state management with the following architecture:

### Store Configuration
```javascript
// src/redux/store.js
const store = configureStore({
  reducer: {
    chat: chatReducer,           // Chat analytics and messaging state
    auth: authReducer,           // Authentication and user session
    [apiSlice.reducerPath]: apiSlice.reducer, // RTK Query API state
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});
```

### State Slices

1. **Authentication Slice** (`src/redux/authSlice.js`)
   - Manages JWT tokens (access/refresh)
   - User authentication status
   - Login/logout functionality
   - Persistent storage integration

2. **Chat Slice** (`src/redux/chatSlice.js`)
   - Chat analytics data
   - Message tracking
   - User interaction metrics

3. **API Slice** (`src/redux/api.js` & `src/api/apiSlice.js`)
   - Centralized API management using RTK Query
   - Automatic caching and invalidation
   - Tag-based cache management for entities like Users, Programs, Scholarships

### API Management with RTK Query

The application uses **RTK Query** for efficient data fetching and caching:

- **Base Query**: Custom base query with authentication handling
- **Endpoint Injection**: Modular API endpoints injected into the main API slice
- **Cache Tags**: Automatic cache invalidation for related data
- **Optimistic Updates**: Real-time UI updates

#### API Slices Structure:
```
src/api/
├── apiSlice.js              # Main API slice configuration
├── customBaseQuery.js       # Authentication-aware base query
├── usersApiSlice.js         # User management endpoints
├── registeredUsersApiSlice.js
├── pendingUsersApiSlice.js
├── rejectedUsersApiSlice.js
├── idDocumentsApiSlice.js   # Document management
├── resultDocumentsApiSlice.js
├── registrationStatusApiSlice.js
└── ...
```

## Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── users/           # User management components
│   ├── idDocuments/     # ID document management
│   ├── resultDocuments/ # Result document management
│   ├── programs/        # University programs
│   ├── scholarships/    # Scholarship management
│   └── ...
├── redux/              # Redux store and slices
├── api/                # RTK Query API definitions
├── router.jsx          # React Router configuration
├── Layout.jsx          # Main application layout
├── Home.jsx            # Dashboard home page
└── main.jsx           # Application entry point
```

## Key Features

### 📊 Dashboard Analytics
- Student registration metrics
- Chat interaction analytics
- Peak usage hours tracking
- Messages per day visualization

### 👥 User Management
- Student application tracking
- Registration status management
- User role administration
- Bulk operations support

### 📁 Document Management
- ID document verification
- Academic result processing
- Acceptance letter generation
- Document status tracking

### 💬 Chat Analytics
- Bot interaction metrics
- User engagement tracking
- Response time analytics
- Popular query identification

### 🎓 Academic Management
- University program catalog
- Scholarship opportunities
- FAQ management
- Application workflow control

## Getting Started

### Prerequisites
- Node.js (Latest LTS version)
- npm or yarn package manager

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd skies_uniconnect_dashboard
```

2. Install dependencies
```bash
npm install
```

3. Start development server
```bash
npm run dev
```

4. Build for production
```bash
npm run build
```

### Available Scripts

- `npm run dev` - Start development server with HMR
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint code quality checks

## Authentication

The application uses JWT-based authentication with:
- Access tokens for API authorization
- Refresh tokens for automatic token renewal
- Persistent login state via localStorage
- Protected routes with authentication guards

## Development Guidelines

### State Management Best Practices
- Use RTK Query for all API calls
- Implement proper cache invalidation strategies
- Utilize optimistic updates for better UX
- Keep local state minimal, prefer server state

### Code Organization
- Components should be modular and reusable
- API logic separated into dedicated slices
- Consistent naming conventions
- Proper error handling and loading states

## Environment Configuration

Ensure proper environment variables are configured for:
- API base URLs
- Authentication endpoints
- File upload configurations
- Analytics tracking

---

For technical support or contribution guidelines, please refer to the project documentation or contact the development team.te

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
