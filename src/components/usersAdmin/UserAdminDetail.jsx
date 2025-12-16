import React from 'react';
import { useGetUserAdminQuery } from '../../api/usersAdminApiSlice';
import { useNavigate } from 'react-router-dom';

const UserAdminDetail = ({ id }) => {
  const { data: user, isLoading, isError, error } = useGetUserAdminQuery(id);
  const navigate = useNavigate();

  if (!id) return <div>No admin user selected.</div>;
  if (isLoading) return <div>Loading admin user...</div>;
  if (isError) return <div>Error: {error?.error || 'Failed to load admin user.'}</div>;

  return (
    <div className="container py-4">
      <button className="btn btn-secondary mb-3" onClick={() => navigate(-1)}>&larr; Back</button>
      <div className="card shadow-sm mx-auto" style={{ maxWidth: 500 }}>
        <div className="card-body">
          <h3 className="card-title mb-3">Admin User Detail</h3>
          <div className="mb-2"><strong>Username:</strong> {user.username}</div>
          {/* <div className="mb-2"><strong>User ID:</strong> {user.id}</div> */}
          <div className="mb-2"><strong>Email:</strong> {user.email || <span className="text-muted">N/A</span>}</div>
          <div className="mb-2"><strong>Role:</strong> {user.is_superuser ? <span className="badge bg-danger">Superuser</span> : user.is_staff ? <span className="badge bg-info text-dark">Staff</span> : <span className="badge bg-secondary">User</span>}</div>
          <div className="mb-2"><strong>Active:</strong> {user.is_active ? <span className="badge bg-success">Active</span> : <span className="badge bg-danger">Inactive</span>}</div>
        </div>
      </div>
    </div>
  );
};

export default UserAdminDetail; 