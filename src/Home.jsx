import React from 'react';
import { useGetRegisteredUsersQuery } from './api/registeredUsersApiSlice';
import { useGetUsersQuery } from './api/usersApiSlice';
import { useGetRegistrationStatusesQuery } from './api/registrationStatusApiSlice';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from './redux/authSlice';
import { useNavigate } from 'react-router-dom';
import { BsBoxArrowRight } from 'react-icons/bs';

const Home = () => {
  const { data: registeredUsersData, isLoading: isLoadingRegisteredUsers } = useGetRegisteredUsersQuery();
  const { data: chatbotUsersData, isLoading: isLoadingChatbotUsers } = useGetUsersQuery();
  const { data: registrationStatusesData, isLoading: isLoadingRegistrationStatuses } = useGetRegistrationStatusesQuery();
  const registeredUsers = registeredUsersData?.results || [];
  const chatbotUsers = chatbotUsersData?.results || [];
  const registrationStatuses = registrationStatusesData?.results || [];
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  return (
    <div className="container py-4" style={{ background: '#fff', minHeight: '100vh' }}>
      <div className="text-center mb-5">
        <img src="/skies_logo.jpg" alt="Skies Logo" style={{ width: 120, height: 120, objectFit: 'contain' }} />
        <h1 className="mt-3 mb-2" style={{ fontWeight: 700 }}>Welcome to Skies UniConnect</h1>
        <p className="text-muted">Your dashboard for chatbot and student management</p>
      </div>
      <div className="row g-4 justify-content-center my-4">
        
        <ReportCard title="Total Chatbot Users" value={isLoadingChatbotUsers ? <Spinner /> : chatbotUsers.length} color="primary" />
  
        <ReportCard title="Pending Registrations" value={isLoadingRegistrationStatuses ? <Spinner /> : registrationStatuses.filter(s => s.status === 'pending').length} color="warning" />
        <ReportCard title="Accepted Registrations" value={isLoadingRegistrationStatuses ? <Spinner /> : registrationStatuses.filter(s => s.status === 'accepted').length} color="success" />
        <ReportCard title="Rejected Registrations" value={isLoadingRegistrationStatuses ? <Spinner /> : registrationStatuses.filter(s => s.status === 'rejected').length} color="danger" />
      </div>
      {isAuthenticated && (
        <div className="text-center mt-5">
          <button
            className="btn btn-danger"
            onClick={() => {
              if (window.confirm('Are you sure you want to logout?')) {
                dispatch(logout());
                navigate('/login');
              }
            }}
          >
            <BsBoxArrowRight className="me-2" /> Logout
          </button>
        </div>
      )}
    </div>
  );
};

function Spinner() {
  return <div className="spinner-border spinner-border-sm" role="status"><span className="visually-hidden">Loading...</span></div>;
}

function ReportCard({ title, value, color }) {
  return (
    <div className="col-12 col-sm-6 col-md-4 col-lg-3">
      <div className={`card border-${color} shadow-sm h-100`}>
        <div className="card-body text-center">
          <h5 className="card-title mb-2">{title}</h5>
          <div className={`display-6 fw-bold text-${color}`}>{value}</div>
        </div>
      </div>
    </div>
  );
}

export default Home; 