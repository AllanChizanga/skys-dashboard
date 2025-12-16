import React, { useState } from 'react';
import { useGetUsersAdminQuery, useAddUserAdminMutation } from '../../api/usersAdminApiSlice';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { BsTrash, BsPersonPlus, BsPersonBadge } from 'react-icons/bs';

const UsersAdminList = () => {
  const { data: usersData = [], isLoading, isError, error, refetch } = useGetUsersAdminQuery();
  let users = [];
  if (Array.isArray(usersData)) {
    users = usersData;
  } else if (usersData && Array.isArray(usersData.results)) {
    users = usersData.results;
  }
  const [addUserAdmin, { isLoading: isAdding, error: addError, isSuccess: addSuccess }] = useAddUserAdminMutation();
  const user = useSelector(state => state.auth.user);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ username: '', password: '', password2: '', is_superuser: false });
  const [formError, setFormError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(null);

  const handleInputChange = e => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
    setFormError(null);
    setFormSuccess(null);
  };

  const handleCreateUser = async e => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    if (!form.username || !form.password || !form.password2) {
      setFormError('All fields are required.');
      return;
    }
    if (form.password !== form.password2) {
      setFormError('Passwords do not match.');
      return;
    }
    try {
      await addUserAdmin({
        username: form.username,
        password: form.password,
        is_superuser: form.is_superuser,
      }).unwrap();
      setFormSuccess('User created successfully!');
      setForm({ username: '', password: '', password2: '', is_superuser: false });
      refetch();
      setTimeout(() => setShowModal(false), 1200);
    } catch (err) {
      setFormError(err?.data?.detail || 'Failed to create user.');
    }
  };

  if (isLoading) return <div className="text-center py-5"><div className="spinner-border text-primary" role="status"></div></div>;
  if (isError) return <div>Error: {error?.error || 'Failed to load admin users.'}</div>;

  return (
    <div className="container py-4">
      <div className="card shadow-sm mx-auto" style={{ maxWidth: 700 }}>
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="mb-0"><BsPersonBadge className="me-2 text-primary" />Admin Users</h2>
            {user?.is_superuser && (
              <button className="btn btn-success" onClick={() => setShowModal(true)}>
                <BsPersonPlus className="me-1" /> Create User
              </button>
            )}
          </div>
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Username</th>
               
                  <th>Role</th>
                  <th style={{ width: 60 }}></th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td>
                      <Link to={`/users-admin/${u.id}`} className="text-decoration-none fw-bold">
                        {u.username || u.id}
                      </Link>
                    </td>
                
                    <td>
                      {u.is_superuser ? <span className="badge bg-danger">Superuser</span> : u.is_staff ? <span className="badge bg-info text-dark">Staff</span> : <span className="badge bg-secondary">User</span>}
                    </td>
                    <td>
                      {user?.is_superuser && user.id !== u.id && (
                        <button
                          className="btn btn-sm btn-outline-danger"
                          title="Delete user"
                          onClick={async () => {
                            if (window.confirm(`Are you sure you want to delete user '${u.username}'?`)) {
                              try {
                                                        let response;
                                                        try {
                                                          response = await fetch(`/api/users-admin/${u.id}/`, {
                                  method: 'DELETE',
                                  headers: {
                                    'Authorization': `Bearer ${localStorage.getItem('access')}`,
                                  },
                                                          });
                                                        } catch (networkErr) {
                                                          alert('Network error: could not delete user. Check your connection and try again.');
                                                          console.error('Network error deleting user:', networkErr);
                                                          return;
                                                        }
                                                        if (response.ok) {
                                                          refetch();
                                                        } else if (response.status === 401) {
                                                          alert('Unauthorized: your session may have expired. Please login again.');
                                                        } else {
                                                          alert('Failed to delete user.');
                                                        }
                                                      } catch (err) {
                                                        console.error('Unexpected error deleting user:', err);
                                                        alert('Failed to delete user.');
                                                      }
                            }
                          }}
                        >
                          <BsTrash />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {/* Modal for creating user */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.3)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Create New User</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleCreateUser}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Username</label>
                    <input type="text" className="form-control" name="username" value={form.username} onChange={handleInputChange} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Password</label>
                    <input type="password" className="form-control" name="password" value={form.password} onChange={handleInputChange} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Confirm Password</label>
                    <input type="password" className="form-control" name="password2" value={form.password2} onChange={handleInputChange} required />
                  </div>
                  <div className="form-check mb-3">
                    <input className="form-check-input" type="checkbox" name="is_superuser" id="is_superuser" checked={form.is_superuser} onChange={handleInputChange} />
                    <label className="form-check-label" htmlFor="is_superuser">
                      Superuser
                    </label>
                  </div>
                  {formError && <div className="alert alert-danger">{formError}</div>}
                  {formSuccess && <div className="alert alert-success">{formSuccess}</div>}
                  {addError && <div className="alert alert-danger">{addError.data?.detail || 'Failed to create user.'}</div>}
                  {addSuccess && <div className="alert alert-success">User created successfully!</div>}
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)} disabled={isAdding}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={isAdding}>
                    {isAdding ? 'Creating...' : 'Create User'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersAdminList; 