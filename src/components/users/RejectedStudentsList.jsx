import React, { useState, useEffect, useCallback } from 'react';
import { useGetRejectedUsersQuery } from '../../api/rejectedUsersApiSlice';
import { useDeleteUserMutation } from '../../api/usersApiSlice';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PAGE_SIZE = 9;

const RejectedStudentsList = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [deleteUser] = useDeleteUserMutation();
  const authUser = useSelector(state => state.auth.user);
  const [confirmId, setConfirmId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchInput]);

  const { data, isLoading, isError, error } = useGetRejectedUsersQuery({ page, page_size: PAGE_SIZE, search });
  const users = data?.results || [];
  const count = data?.count || 0;
  const totalPages = Math.ceil(count / PAGE_SIZE);

  const isAdmin = authUser?.is_staff || authUser?.is_superuser;

  const handlePageChange = useCallback((newPage) => {
    if (newPage >= 1 && newPage <= totalPages) setPage(newPage);
  }, [totalPages]);

  const handleDelete = async (userId) => {
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteUser(userId).unwrap();
      setConfirmId(null);
    } catch (err) {
      setDeleteError('Failed to delete user.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="container py-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4 gap-3">
        <h2 className="mb-0">Rejected Students</h2>
        <div className="input-group" style={{ maxWidth: 320 }}>
          <input
            type="text"
            className="form-control shadow-sm"
            placeholder="Search by name, email, or phone..."
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            aria-label="Search rejected students"
          />
          <span className="input-group-text bg-white"><i className="bi bi-search"></i></span>
        </div>
      </div>
      <div className="row g-4">
        {isLoading ? (
          <div className="col-12 text-center py-5"><div className="spinner-border text-primary" role="status"></div></div>
        ) : isError ? (
          <div className="col-12 text-danger text-center py-5">{error?.error || 'Failed to load rejected students.'}</div>
        ) : users.length === 0 ? (
          <div className="col-12 text-center py-5 text-muted">No rejected students found.</div>
        ) : (
          users.map(user => (
            <div className="col-md-6 col-lg-4" key={user.id}>
              <div className="card shadow-sm h-100 border-0 user-card-hover">
                <div className="card-body">
                  <h5 className="card-title mb-2 text-primary fw-bold">{user.name}</h5>
                  <p className="card-text mb-1"><strong>Email:</strong> {user.email}</p>
                  <p className="card-text mb-1"><strong>Phone:</strong> {user.phone_number}</p>
                  <p className="card-text mb-2 text-muted" style={{ fontSize: '0.9em' }}>
                    <strong>Applied:</strong> {user.application_date ? new Date(user.application_date).toLocaleString() : 'N/A'}
                    {user.registration_date && (
                      <><br/><strong>Registered:</strong> {new Date(user.registration_date).toLocaleString()}</>
                    )}
                  </p>
                  <Link to={`/users/${user.id}`} className="btn btn-outline-primary btn-sm rounded-pill me-2">View Details</Link>
                  {isAdmin && (
                    <>
                      <button className="btn btn-danger btn-sm" onClick={() => setConfirmId(user.id)} disabled={deleting}>
                        Delete
                      </button>
                      {/* Confirm Modal */}
                      {confirmId === user.id && (
                        <div className="modal show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.3)' }}>
                          <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content">
                              <div className="modal-header">
                                <h5 className="modal-title">Confirm Delete</h5>
                                <button type="button" className="btn-close" onClick={() => setConfirmId(null)}></button>
                              </div>
                              <div className="modal-body">
                                <p>Are you sure you want to delete <strong>{user.name}</strong>?</p>
                                {deleteError && <div className="text-danger mb-2">{deleteError}</div>}
                              </div>
                              <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setConfirmId(null)} disabled={deleting}>Cancel</button>
                                <button type="button" className="btn btn-danger" onClick={() => handleDelete(user.id)} disabled={deleting}>
                                  {deleting ? 'Deleting...' : 'Delete'}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
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
        .user-card-hover:hover {
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

export default RejectedStudentsList; 