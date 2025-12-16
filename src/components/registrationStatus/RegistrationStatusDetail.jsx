import React, { useState } from 'react';
import { useGetRegistrationStatusQuery, useEditRegistrationStatusMutation } from '../../api/registrationStatusApiSlice';
import { useGetUserQuery } from '../../api/usersApiSlice';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Rejected' },
];

const RegistrationStatusDetail = ({ id }) => {
  const { data: status, isLoading, isError, error } = useGetRegistrationStatusQuery(id);
  const { data: user } = useGetUserQuery(status?.user, { skip: !status?.user });
  const [editStatus, setEditStatus] = useState('');
  const [success, setSuccess] = useState(false);
  const [editRegistrationStatus, { isLoading: isSaving }] = useEditRegistrationStatusMutation();
  const navigate = useNavigate();
  const authUser = useSelector(state => state.auth.user);
  const isAdmin = authUser?.is_staff || authUser?.is_superuser;
  // Only admins can edit if status is 'accepted', others can edit if not 'accepted'
  const canEdit = (status?.status === 'accepted') ? isAdmin : true;

  React.useEffect(() => {
    if (status) setEditStatus(status.status);
  }, [status]);

  if (!id) return <div>No status selected.</div>;
  if (isLoading) return <div>Loading status...</div>;
  if (isError) return <div>Error: {error?.error || 'Failed to load status.'}</div>;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess(false);
    try {
      await editRegistrationStatus({ ...status, status: editStatus }).unwrap();
      setSuccess(true);
    } catch (err) {
      setSuccess(false);
    }
  };

  return (
    <div className="container py-4">
      <button className="btn btn-secondary mb-3" onClick={() => navigate(-1)}>&larr; Back</button>
      <div className="card shadow-sm mx-auto" style={{ maxWidth: 500 }}>
        <div className="card-body">
          <h3 className="card-title mb-3">Registration Status Detail</h3>
          <p className="mb-1"><strong>ID:</strong> {status.id}</p>
          <p className="mb-1"><strong>User:</strong> {user ? user.name || user.username : status.user}</p>
          <p className="mb-1"><strong>Status:</strong> <StatusBadge status={status.status} /></p>
          <p className="mb-1"><strong>Created:</strong> {status.created_at ? new Date(status.created_at).toLocaleString() : 'N/A'}</p>
          <p className="mb-1"><strong>Updated:</strong> {status.updated_at ? new Date(status.updated_at).toLocaleString() : 'N/A'}</p>
          <p className="mb-1"><strong>Acceptance Letter:</strong> {status.acceptance_letter ? (
            <a href={status.acceptance_letter} target="_blank" rel="noopener noreferrer">Download</a>
          ) : 'None'}</p>
          <hr />
          <form onSubmit={handleSubmit} className="mt-3">
            <div className="mb-3">
              <label htmlFor="status" className="form-label"><strong>Edit Status</strong></label>
              <select
                id="status"
                className="form-select"
                value={editStatus}
                onChange={e => setEditStatus(e.target.value)}
                disabled={isSaving || !canEdit}
              >
                {STATUS_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn btn-primary" disabled={isSaving || editStatus === status.status || !canEdit}>
              {isSaving ? 'Saving...' : 'Save'}
            </button>
            {success && <span className="text-success ms-3">Status updated!</span>}
            {!canEdit && (
              <div className="alert alert-warning mt-3">
                {status?.status === 'accepted'
                  ? 'Only admins can change the status from accepted.'
                  : 'You do not have permission to change the registration status.'}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

function StatusBadge({ status }) {
  let color = 'secondary';
  if (status === 'pending') color = 'warning';
  else if (status === 'accepted') color = 'success';
  else if (status === 'rejected') color = 'danger';
  return <span className={`badge bg-${color} text-capitalize`}>{status}</span>;
}

export default RegistrationStatusDetail; 