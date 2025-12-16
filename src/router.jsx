import { createBrowserRouter } from 'react-router-dom';
import React from 'react';
import Layout from './Layout';
import Home from './Home';
import Chat from './Chat';
import Login from './Login';
import { useSelector } from 'react-redux';
import { Navigate, Outlet, useParams } from 'react-router-dom';
import UsersList from './components/users/UsersList';
import UserDetail from './components/users/UserDetail';
import IdDocumentsList from './components/idDocuments/IdDocumentsList';
import IdDocumentDetail from './components/idDocuments/IdDocumentDetail';
import ResultDocumentsList from './components/resultDocuments/ResultDocumentsList';
import ResultDocumentDetail from './components/resultDocuments/ResultDocumentDetail';
import RegistrationStatusList from './components/registrationStatus/RegistrationStatusList';
import RegistrationStatusDetail from './components/registrationStatus/RegistrationStatusDetail';
import UsersAdminList from './components/usersAdmin/UsersAdminList';
import UserAdminDetail from './components/usersAdmin/UserAdminDetail';
import RegisteredUsersList from './components/users/RegisteredUsersList';
import ChatbotUserDetail from './components/users/ChatbotUserDetail';
import PendingStudentsList from './components/users/PendingStudentsList';
import RejectedStudentsList from './components/users/RejectedStudentsList';
import ErrorPage from './components/ErrorPage';
import ProgramsPage from './components/programs/ProgramsPage';
import ScholarshipsPage from './components/scholarships/ScholarshipsPage';
import AcceptanceLetterConfigForm from './components/AcceptanceLetterConfigForm';
import FAQPage from './components/FAQPage';

function PrivateRoute() {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

function SuperuserRoute() {
  const user = useSelector((state) => state.auth.user);
  return user?.is_superuser ? <Outlet /> : <Navigate to="/" replace />;
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <PrivateRoute />, // Protect all routes under /
    errorElement: <ErrorPage />,
    children: [
      {
        path: '/',
        element: <Layout />,
        errorElement: <ErrorPage />,
        children: [
          { path: '', element: <Home /> },
          {
            path: 'chat',
            element: <SuperuserRoute />,
            errorElement: <ErrorPage />,
            children: [
              { path: '', element: <Chat /> },
            ]
          },
          { path: 'users', element: <UsersList />, errorElement: <ErrorPage /> },
          { path: 'users/:userId', element: <ChatbotUserDetailWrapper />, errorElement: <ErrorPage /> },
          { path: 'id-documents', element: <IdDocumentsList />, errorElement: <ErrorPage /> },
          { path: 'id-documents/:id', element: <IdDocumentDetailWrapper />, errorElement: <ErrorPage /> },
          { path: 'result-documents', element: <ResultDocumentsList />, errorElement: <ErrorPage /> },
          { path: 'result-documents/:id', element: <ResultDocumentDetailWrapper />, errorElement: <ErrorPage /> },
          { path: 'registration-status', element: <RegistrationStatusList />, errorElement: <ErrorPage /> },
          { path: 'registration-status/:id', element: <RegistrationStatusDetailWrapper />, errorElement: <ErrorPage /> },
          { path: 'users-admin', element: <UsersAdminList />, errorElement: <ErrorPage /> },
          { path: 'users-admin/:id', element: <UserAdminDetailWrapper />, errorElement: <ErrorPage /> },
          { path: 'registered-users', element: <RegisteredUsersList />, errorElement: <ErrorPage /> },
          { path: 'pending-students', element: <PendingStudentsList />, errorElement: <ErrorPage /> },
          { path: 'rejected-students', element: <RejectedStudentsList />, errorElement: <ErrorPage /> },
          { path: 'programs', element: <ProgramsPage />, errorElement: <ErrorPage /> },
          { path: 'scholarships', element: <ScholarshipsPage />, errorElement: <ErrorPage /> },
          {
            path: 'faqs',
            element: <SuperuserRoute />,
            errorElement: <ErrorPage />,
            children: [
              { path: '', element: <FAQPage /> },
            ]
          },
        ],
      },
    ],
  },
  { path: '/login', element: <Login />, errorElement: <ErrorPage /> },
]);

// Add wrapper components for detail routes to extract params
function UserDetailWrapper() {
  const { userId } = useParams();
  return <UserDetail userId={userId} />;
}
function IdDocumentDetailWrapper() {
  const { id } = useParams();
  return <IdDocumentDetail id={id} />;
}
function ResultDocumentDetailWrapper() {
  const { id } = useParams();
  return <ResultDocumentDetail id={id} />;
}
function RegistrationStatusDetailWrapper() {
  const { id } = useParams();
  return <RegistrationStatusDetail id={id} />;
}
function UserAdminDetailWrapper() {
  const { id } = useParams();
  return <UserAdminDetail id={id} />;
}
function ChatbotUserDetailWrapper() {
  const { userId } = useParams();
  return <ChatbotUserDetail userId={parseInt(userId, 10)} />;
}

export default router; 