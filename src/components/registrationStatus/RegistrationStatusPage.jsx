import React, { useState, useEffect, useCallback } from 'react';
import { useGetRegistrationStatusesQuery } from '../../api/registrationStatusApiSlice';
import { Link } from 'react-router-dom';

const PAGE_SIZE = 20;

const RegistrationStatusPage = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearch(searchInput);
      setPage(1); // Reset to first page on new search
    }, 500);
    return () => clearTimeout(handler);
  }, [searchInput]);

  const { data, isLoading, isError, error } = useGetRegistrationStatusesQuery({ page, page_size: PAGE_SIZE, search });

  // Pagination meta from DRF
  const statuses = data?.results || [];
  const count = data?.count || 0;
  const totalPages = Math.ceil(count / PAGE_SIZE);

  const handlePageChange = useCallback((newPage) => {
    if (newPage >= 1 && newPage <= totalPages) setPage(newPage);
  }, [totalPages]);

  return (
    <div className="container py-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4 gap-3">
        <h2 className="mb-0">Registration Statuses</h2>
        <div className="input-group" style={{ maxWidth: 320 }}>
          <input
            type="text"
            className="form-control shadow-sm"
            placeholder="Search by name, email, phone, or status..."
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            aria-label="Search registration statuses"
          />
          <span className="input-group-text bg-white"><i className="bi bi-search"></i></span>
        </div>
      </div>

      <div className="row g-4">
        {isLoading ? (
          <div className="col-12 text-center py-5"><div className="spinner-border text-primary" role="status"></div></div>
        ) : isError ? (
          <div className="col-12 text-danger text-center py-5">{error?.error || 'Failed to load registration statuses.'}</div>
        ) : statuses.length === 0 ? (
          <div className="col-12 text-center py-5 text-muted">No registration statuses found.</div>
        ) : (
          statuses.map(status => (
            <div className="col-md-6 col-lg-4" key={status.id}>
              <div className="card shadow-sm h-100 border-0 status-card-hover">
                <div className="card-body">
                  <h5 className="card-title mb-2 text-primary fw-bold">{status.user_name || status.user || 'User'}</h5>
                  <p className="card-text mb-2">
                    <strong>Status:</strong>{' '}
                    <span className={`badge ${
                      status.status === 'accepted' ? 'bg-success' : 
                      status.status === 'pending' ? 'bg-warning text-dark' : 
                      'bg-danger'
                    }`}>
                      {status.status?.toUpperCase()}
                    </span>
                  </p>
                  <p className="card-text mb-2 text-muted" style={{ fontSize: '0.9em' }}>
                    <strong>Created:</strong> {status.created_at ? new Date(status.created_at).toLocaleString() : 'N/A'}
                  </p>
                  <p className="card-text mb-2 text-muted" style={{ fontSize: '0.9em' }}>
                    <strong>Updated:</strong> {status.updated_at ? new Date(status.updated_at).toLocaleString() : 'N/A'}
                  </p>
                  <Link to={`/users/${status.user}`} className="btn btn-outline-primary btn-sm rounded-pill">View User</Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <nav className="d-flex justify-content-center mt-5">
          <ul className="pagination pagination-lg shadow-sm">
            <li className={`page-item${page === 1 ? ' disabled' : ''}`}>
              <button className="page-link" onClick={() => handlePageChange(page - 1)}>&laquo;</button>
            </li>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <li key={p} className={`page-item${p === page ? ' active' : ''}`}>
                <button className="page-link" onClick={() => handlePageChange(p)}>{p}</button>
              </li>
            ))}
            <li className={`page-item${page === totalPages ? ' disabled' : ''}`}>
              <button className="page-link" onClick={() => handlePageChange(page + 1)}>&raquo;</button>
            </li>
          </ul>
        </nav>
      )}

      <style>{`
        .status-card-hover:hover {
          box-shadow: 0 0 0 4px #0d6efd22;
          transform: translateY(-2px) scale(1.01);
          transition: box-shadow 0.2s, transform 0.2s;
        }
        .pagination .page-link {
          border-radius: 50px !important;
          margin: 0 2px;
        }
        .pagination .page-item.active .page-link {
          background: #0d6efd;
          color: #fff;
          border: none;
        }
        .pagination .page-link:focus {
          box-shadow: 0 0 0 2px #0d6efd55;
        }
      `}</style>
    </div>
  );
};

export default RegistrationStatusPage; 