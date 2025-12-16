import React, { useState, useEffect, useCallback } from 'react';
import { useGetRegistrationStatusesQuery } from '../../api/registrationStatusApiSlice';
import { Link } from 'react-router-dom';
import { useGetUserQuery } from '../../api/usersApiSlice';

const PAGE_SIZE = 20;

const RegistrationStatusList = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchInput]);

  const { data, isLoading, isError, error } = useGetRegistrationStatusesQuery({ page, page_size: PAGE_SIZE, search });
  const statuses = data?.results || [];
  const count = data?.count || 0;
  const totalPages = Math.ceil(count / PAGE_SIZE);

  const handlePageChange = useCallback((newPage) => {
    if (newPage >= 1 && newPage <= totalPages) setPage(newPage);
  }, [totalPages]);

  return (
    <div className="container py-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4 gap-3">
        <h2 className="mb-0">Registration Status List</h2>
        <div className="input-group" style={{ maxWidth: 320 }}>
          <input
            type="text"
            className="form-control shadow-sm"
            placeholder="Search by user name, email, or status..."
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            aria-label="Search registration statuses"
          />
          <span className="input-group-text bg-white"><i className="bi bi-search"></i></span>
        </div>
      </div>
      {isLoading ? (
        <div className="text-center py-5"><div className="spinner-border text-primary" role="status"></div></div>
      ) : isError ? (
        <div className="text-danger text-center py-5">{error?.error || 'Failed to load registration statuses.'}</div>
      ) : statuses.length === 0 ? (
        <div className="text-center py-5 text-muted">No registration statuses found.</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped align-middle shadow-sm">
            <thead className="table-light">
              <tr>
                <th>No</th>
                <th>User Name</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {statuses.map((status, idx) => (
                <tr key={status.id}>
                  <td>{(page - 1) * PAGE_SIZE + idx + 1}</td>
                  <td>
                    <Link to={`/registration-status/${status.id}`}>{<UserNameCell userId={status.user} />}</Link>
                  </td>
                  <td><StatusBadge status={status.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

function UserNameCell({ userId }) {
  const { data: user } = useGetUserQuery(userId);
  return <>{user ? user.name || user.username || user.id : userId}</>;
}

function StatusBadge({ status }) {
  let color = 'secondary';
  if (status === 'pending') color = 'warning';
  else if (status === 'accepted') color = 'success';
  else if (status === 'rejected') color = 'danger';
  return <span className={`badge bg-${color} text-capitalize`}>{status}</span>;
}

export default RegistrationStatusList;